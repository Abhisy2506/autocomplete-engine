#include "RadixTree.h"
#include <cctype>

std::string RadixTree::toLower(const std::string& str) {
    std::string lowerStr = str;
    std::transform(lowerStr.begin(), lowerStr.end(), lowerStr.begin(), [](unsigned char c) {
        return std::tolower(c);
    });
    return lowerStr;
}

size_t RadixTree::commonPrefixLength(const std::string& a, const std::string& b) {
    size_t len = 0;
    while (len < a.size() && len < b.size() && a[len] == b[len]) {
        len++;
    }
    return len;
}

void RadixTreeNode::updateTopK(const CityRecord& city, size_t k) {
    // 1. Avoid duplicate entries for the same city ID
    for (auto& item : topKCities) {
        if (item.geonameid == city.geonameid) {
            if (city.population > item.population) {
                item = city;
            }
            std::sort(topKCities.begin(), topKCities.end(), CompareCityByPopulationDesc());
            return;
        }
    }

    // 2. Insert or conditionally replace the lowest-population candidate
    if (topKCities.size() < k) {
        topKCities.push_back(city);
    } else if (city.population > topKCities.back().population) {
        topKCities.back() = city;
    } else {
        return; // Population not high enough to beat current top-K
    }

    // Keep sorted descending by population for instant extraction
    std::sort(topKCities.begin(), topKCities.end(), CompareCityByPopulationDesc());
}

RadixTree::RadixTree() : totalCities(0) {
    root = std::make_shared<RadixTreeNode>("");
}

void RadixTree::insert(const CityRecord& city) {
    std::string key = toLower(city.name);
    if (key.empty()) return;

    std::shared_ptr<RadixTreeNode> current = root;
    current->updateTopK(city);

    size_t keyIndex = 0;
    while (keyIndex < key.length()) {
        char firstChar = key[keyIndex];

        // Case A: No branch exists with this starting character
        if (current->children.find(firstChar) == current->children.end()) {
            auto newNode = std::make_shared<RadixTreeNode>(key.substr(keyIndex), true);
            newNode->updateTopK(city);
            current->children[firstChar] = newNode;
            totalCities++;
            return;
        }

        std::shared_ptr<RadixTreeNode> child = current->children[firstChar];
        std::string edge = child->edgeLabel;
        size_t commonLen = commonPrefixLength(key.substr(keyIndex), edge);

        // Case B: Partial match -> split existing compressed edge
        if (commonLen < edge.length()) {
            auto splitNode = std::make_shared<RadixTreeNode>(edge.substr(0, commonLen), false);
            
            // Re-wire existing child under split node
            child->edgeLabel = edge.substr(commonLen);
            splitNode->children[child->edgeLabel[0]] = child;
            
            // Carry forward Top-K rankings to the new parent
            splitNode->topKCities = child->topKCities;
            splitNode->updateTopK(city);

            current->children[firstChar] = splitNode;

            if (commonLen == key.length() - keyIndex) {
                // Key terminates right on the split node
                splitNode->isTerminal = true;
            } else {
                // Remainder forms a new leaf branch
                auto newLeaf = std::make_shared<RadixTreeNode>(key.substr(keyIndex + commonLen), true);
                newLeaf->updateTopK(city);
                splitNode->children[newLeaf->edgeLabel[0]] = newLeaf;
            }
            totalCities++;
            return;
        }

        // Case C: Full match along this edge -> traverse deeper
        child->updateTopK(city);
        keyIndex += edge.length();
        current = child;
    }

    current->isTerminal = true;
    totalCities++;
}

std::vector<CityRecord> RadixTree::searchPrefix(const std::string& prefix, size_t k) {
    std::string key = toLower(prefix);
    if (key.empty()) return {};

    std::shared_ptr<RadixTreeNode> current = root;
    size_t keyIndex = 0;

    while (keyIndex < key.length()) {
        char firstChar = key[keyIndex];
        if (current->children.find(firstChar) == current->children.end()) {
            return {}; // Prefix does not exist in tree
        }

        std::shared_ptr<RadixTreeNode> child = current->children[firstChar];
        std::string edge = child->edgeLabel;
        size_t remainingKey = key.length() - keyIndex;

        // If prefix ends within or at this edge
        if (remainingKey <= edge.length()) {
            if (edge.rfind(key.substr(keyIndex), 0) == 0) {
                // Direct O(1) extraction from precomputed bounded Top-K
                return child->topKCities;
            }
            return {};
        }

        // Verify full edge match before stepping deeper
        if (key.substr(keyIndex, edge.length()) != edge) {
            return {};
        }

        keyIndex += edge.length();
        current = child;
    }

    return current->topKCities;
}