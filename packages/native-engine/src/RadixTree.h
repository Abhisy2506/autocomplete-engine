#pragma once

#include "Types.h"
#include <string>
#include <vector>
#include <unordered_map>
#include <memory>
#include <algorithm>

/**
 * RadixTreeNode
 * Represents a compressed edge node in the Radix Tree.
 * Each node holds its edge label and a precomputed bounded Top-K list
 * of cities sorted descending by population for O(1) retrieval.
 */
class RadixTreeNode {
public:
    std::string edgeLabel;
    bool isTerminal;
    std::unordered_map<char, std::shared_ptr<RadixTreeNode>> children;
    
    // Bounded Top-K cities precomputed at this prefix node
    std::vector<CityRecord> topKCities;

    RadixTreeNode(std::string edge = "", bool terminal = false)
        : edgeLabel(std::move(edge)), isTerminal(terminal) {}

    // Updates the bounded Top-K cities at this node (default K = 5)
    void updateTopK(const CityRecord& city, size_t k = 5);
};

/**
 * RadixTree (Compressed Prefix Tree)
 * Provides O(L) prefix matching where L is the query length,
 * completely avoiding empty pointer overhead found in standard tries.
 */
class RadixTree {
public:
    RadixTree();
    
    // Inserts a city record into the compressed radix tree
    void insert(const CityRecord& city);
    
    // Performs O(L) prefix traversal and returns O(1) top-K precomputed results
    std::vector<CityRecord> searchPrefix(const std::string& prefix, size_t k = 5);
    
    size_t size() const { return totalCities; }

private:
    std::shared_ptr<RadixTreeNode> root;
    size_t totalCities;
    
    static std::string toLower(const std::string& str);
    static size_t commonPrefixLength(const std::string& a, const std::string& b);
};