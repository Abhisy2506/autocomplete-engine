#include <napi.h>
#include "RadixTree.h"
#include "BKTree.h"
#include <memory>

// Persistent singleton tree instances held in native process heap
static std::unique_ptr<RadixTree> g_radixTree = nullptr;
static std::unique_ptr<BKTree> g_bkTree = nullptr;

// Helper: Converts an internal C++ CityRecord into a lightweight V8 JS Object
Napi::Object CityRecordToJs(Napi::Env env, const CityRecord& city) {
    Napi::Object obj = Napi::Object::New(env);
    obj.Set("geonameid", Napi::Number::New(env, city.geonameid));
    obj.Set("name", Napi::String::New(env, city.name));
    obj.Set("countryCode", Napi::String::New(env, city.countryCode));
    obj.Set("population", Napi::Number::New(env, static_cast<double>(city.population)));
    return obj;
}

/**
 * JS Signature: initEngine(citiesArray)
 * Ingests city documents once on server startup into C++ heap memory.
 */
Napi::Value InitEngine(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsArray()) {
        Napi::TypeError::New(env, "Expected an array of city objects").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Array arr = info[0].As<Napi::Array>();
    uint32_t length = arr.Length();

    // Reset and initialize trees
    g_radixTree = std::make_unique<RadixTree>();
    g_bkTree = std::make_unique<BKTree>();

    for (uint32_t i = 0; i < length; ++i) {
        Napi::Value val = arr.Get(i);
        if (!val.IsObject()) continue;

        Napi::Object obj = val.As<Napi::Object>();
        CityRecord record;
        record.geonameid = obj.Get("geonameid").As<Napi::Number>().Int32Value();
        record.name = obj.Get("name").As<Napi::String>().Utf8Value();
        record.countryCode = obj.Get("countryCode").As<Napi::String>().Utf8Value();
        record.population = obj.Get("population").As<Napi::Number>().Int64Value();

        // 1. Insert into Compressed Radix Tree (with bounded top-K heaps)
        g_radixTree->insert(record);

        // 2. Insert into BK-Tree for fuzzy matching (filtered to cities with population >= 10k
        // to keep metric-space tree traversals fast and memory bounded)
        if (record.population >= 10000) {
            g_bkTree->insert(record);
        }
    }

    Napi::Object res = Napi::Object::New(env);
    res.Set("success", Napi::Boolean::New(env, true));
    res.Set("indexedCities", Napi::Number::New(env, length));
    return res;
}

/**
 * JS Signature: search(query, limit = 5)
 * Sub-millisecond prefix lookup with BK-Tree fuzzy fallback.
 */
Napi::Value Search(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected search query string").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string query = info[0].As<Napi::String>().Utf8Value();
    size_t limit = 5;
    if (info.Length() >= 2 && info[1].IsNumber()) {
        limit = info[1].As<Napi::Number>().Uint32Value();
    }

    if (!g_radixTree) {
        return Napi::Array::New(env, 0);
    }

    // 1. Primary prefix lookup using Compressed Radix Tree (O(L) time, O(1) top-K extraction)
    std::vector<CityRecord> matches = g_radixTree->searchPrefix(query, limit);

    // 2. Fuzzy fallback: If exact prefix yields 0 matches and query length >= 3,
    // trigger BK-Tree Levenshtein metric search with max edit distance <= 2
    if (matches.empty() && g_bkTree && query.length() >= 3) {
        matches = g_bkTree->search(query, 2, limit);
    }

    // Serialize native C++ results back into a V8 JavaScript Array
    Napi::Array results = Napi::Array::New(env, matches.size());
    for (size_t i = 0; i < matches.size(); ++i) {
        results.Set(i, CityRecordToJs(env, matches[i]));
    }

    return results;
}

// Module registration
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("initEngine", Napi::Function::New(env, InitEngine));
    exports.Set("search", Napi::Function::New(env, Search));
    return exports;
}

NODE_API_MODULE(native_engine, Init)