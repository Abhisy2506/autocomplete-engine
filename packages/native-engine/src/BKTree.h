#pragma once

#include "Types.h"
#include <string>
#include <vector>
#include <unordered_map>
#include <memory>

/**
 * BKTreeNode
 * Represents a node in the Burkhard-Keller metric tree.
 * Edges represent the discrete Levenshtein edit distance between the
 * parent's city name and the child's city name.
 */
class BKTreeNode {
public:
    CityRecord city;
    std::unordered_map<int, std::shared_ptr<BKTreeNode>> children;

    BKTreeNode(CityRecord c) : city(std::move(c)) {}
};

/**
 * BKTree (Burkhard-Keller Metric Tree)
 * Used as a fuzzy typo-correction fallback when the Radix Tree returns 0 matches.
 * Uses triangle inequality of the Levenshtein metric space to prune search branches.
 */
class BKTree {
public:
    BKTree();

    void insert(const CityRecord& city);

    std::vector<CityRecord> search(const std::string& query, int maxDistance = 2, size_t k = 5);

private:
    std::shared_ptr<BKTreeNode> root;

    // Helper: Computes Levenshtein edit distance between two strings
    static int levenshteinDistance(const std::string& s1, const std::string& s2);
    static std::string toLower(const std::string& str);

    // Recursive traversal applying triangle inequality pruning
    void searchRecursive(const std::shared_ptr<BKTreeNode>& node,
                         const std::string& query,
                         int maxDistance,
                         std::vector<std::pair<int, CityRecord>>& candidates);
};