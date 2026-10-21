#pragma once
#include <string>
#include <vector>
#include <queue>
#include <memory>

// Lightweight plain C++ representation of a city record.
struct CityRecord {
    int geonameid;
    std::string name;
    std::string countryCode;
    long long population;
};

// Comparator for a Min-Heap based on population.
// Used when maintaining a bounded Top-K: the city with the lowest
// population stays at the top of the heap, making it easy to evict
// when a higher-population candidate comes in.
struct CompareCityByPopulationMin {
    bool operator()(const CityRecord& a, const CityRecord& b) const {
        return a.population > b.population; // Smallest at the top
    }
};

// Comparator for sorting cities in descending order (highest population first).
// Used for final output extraction so the most populated cities appear first.
struct CompareCityByPopulationDesc {
    bool operator()(const CityRecord& a, const CityRecord& b) const {
        return a.population > b.population;
    }
};