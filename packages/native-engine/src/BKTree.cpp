#include "BKTree.h"
#include <algorithm>
#include <cmath>

std::string BKTree::toLower(const std::string& str) {
    std::string lowerStr = str;
    std::transform(lowerStr.begin(), lowerStr.end(), lowerStr.begin(), [](unsigned char c) {
        return std::tolower(c);
    });
    return lowerStr;
}

// Classical dynamic programming Levenshtein distance using 2 rows (O(N) space)
int BKTree::levenshteinDistance(const std::string& s1, const std::string& s2) {
    const size_t m = s1.size();
    const size_t n = s2.size();
    std::vector<int> prev(n + 1);
    std::vector<int> curr(n + 1);

    for (size_t j = 0; j <= n; ++j) prev[j] = static_cast<int>(j);

    for (size_t i = 1; i <= m; ++i) {
        curr[0] = static_cast<int>(i);
        for (size_t j = 1; j <= n; ++j) {
            if (s1[i - 1] == s2[j - 1]) {
                curr[j] = prev[j - 1];
            } else {
                curr[j] = 1 + std::min({ prev[j], curr[j - 1], prev[j - 1] });
            }
        }
        prev = curr;
    }
    return prev[n];
}

BKTree::BKTree() : root(nullptr) {}

void BKTree::insert(const CityRecord& city) {
    if (!root) {
        root = std::make_shared<BKTreeNode>(city);
        return;
    }

    std::string cityLower = toLower(city.name);
    std::shared_ptr<BKTreeNode> current = root;

    while (true) {
        int dist = levenshteinDistance(cityLower, toLower(current->city.name));
        if (dist == 0) return;

        if (current->children.find(dist) == current->children.end()) {
            current->children[dist] = std::make_shared<BKTreeNode>(city);
            break;
        }
        current = current->children[dist];
    }
}

void BKTree::searchRecursive(const std::shared_ptr<BKTreeNode>& node,
                             const std::string& query,
                             int maxDistance,
                             std::vector<std::pair<int, CityRecord>>& candidates) {
    if (!node) return;

    int dist = levenshteinDistance(query, toLower(node->city.name));
    if (dist <= maxDistance) {
        candidates.push_back({ dist, node->city });
    }

    // Triangle inequality pruning window: [dist - maxDistance, dist + maxDistance]
    int low = dist - maxDistance;
    int high = dist + maxDistance;

    for (const auto& [edgeDist, child] : node->children) {
        if (edgeDist >= low && edgeDist <= high) {
            searchRecursive(child, query, maxDistance, candidates);
        }
    }
}

std::vector<CityRecord> BKTree::search(const std::string& query, int maxDistance, size_t k) {
    if (!root) return {};

    std::string qLower = toLower(query);
    std::vector<std::pair<int, CityRecord>> candidates;
    searchRecursive(root, qLower, maxDistance, candidates);

    // Rank candidates: smallest edit distance first; tie-break with population descending
    std::sort(candidates.begin(), candidates.end(), [](const auto& a, const auto& b) {
        if (a.first != b.first) return a.first < b.first;
        return a.second.population > b.second.population;
    });

    std::vector<CityRecord> results;
    for (size_t i = 0; i < candidates.size() && i < k; ++i) {
        results.push_back(candidates[i].second);
    }
    return results;
}