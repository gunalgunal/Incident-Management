package com.example.incidentmanagement.service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Lightweight text-similarity helper used to rank resolved incidents against a
 * target incident description. Uses cosine similarity over token-frequency vectors
 * with a small stop-word list and basic stemming (trailing "s" removal) to reduce
 * vocabulary noise. No external dependencies.
 */
public final class TextSimilarity {

    private static final Pattern TOKEN_PATTERN = Pattern.compile("[^a-zA-Z0-9]+");

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "a", "an", "the", "and", "or", "but", "if", "then", "else", "for", "of", "to",
            "in", "on", "at", "by", "with", "from", "is", "are", "was", "were", "be", "been",
            "being", "this", "that", "these", "those", "it", "its", "as", "not", "no", "do",
            "does", "did", "has", "have", "had", "can", "cannot", "cant", "will", "would",
            "should", "could", "i", "we", "they", "he", "she", "you", "us", "them", "their",
            "our", "my", "your", "his", "her", "so", "than", "too", "very", "s", "t"));

    private TextSimilarity() {
    }

    /**
     * Cosine similarity between two texts, in the range [0.0, 1.0].
     * Returns 0.0 if either text has no usable tokens.
     */
    public static double cosine(String a, String b) {
        Map<String, Double> va = termFrequency(a);
        Map<String, Double> vb = termFrequency(b);
        if (va.isEmpty() || vb.isEmpty()) {
            return 0.0;
        }

        double dot = 0.0;
        for (Map.Entry<String, Double> e : va.entrySet()) {
            Double w = vb.get(e.getKey());
            if (w != null) {
                dot += e.getValue() * w;
            }
        }

        double na = norm(va);
        double nb = norm(vb);
        if (na == 0.0 || nb == 0.0) {
            return 0.0;
        }
        return dot / (na * nb);
    }

    private static Map<String, Double> termFrequency(String text) {
        Map<String, Integer> counts = new HashMap<>();
        if (text == null || text.isBlank()) {
            return Map.of();
        }
        for (String raw : TOKEN_PATTERN.split(text.toLowerCase())) {
            if (raw.isBlank()) {
                continue;
            }
            String token = stem(raw);
            if (STOP_WORDS.contains(token) || token.length() < 2) {
                continue;
            }
            counts.merge(token, 1, Integer::sum);
        }
        Map<String, Double> tf = new HashMap<>();
        counts.forEach((k, v) -> tf.put(k, (double) v));
        return tf;
    }

    private static String stem(String word) {
        // Very light stemming: drop a trailing "s" so "errors" matches "error".
        if (word.length() > 3 && word.endsWith("s") && !word.endsWith("ss")) {
            return word.substring(0, word.length() - 1);
        }
        return word;
    }

    private static double norm(Map<String, Double> v) {
        double sum = 0.0;
        for (double w : v.values()) {
            sum += w * w;
        }
        return Math.sqrt(sum);
    }

    /** Convenience: tokenize for debugging or testing. */
    static List<String> tokenize(String text) {
        return Arrays.stream(TOKEN_PATTERN.split(text == null ? "" : text.toLowerCase()))
                .filter(s -> !s.isBlank())
                .map(TextSimilarity::stem)
                .filter(s -> !STOP_WORDS.contains(s) && s.length() >= 2)
                .collect(Collectors.toList());
    }
}
