"""
detector.py — Rule-based Text Analysis and AI Content Estimation Prototype.

IMPORTANT DISCLAIMER:
This analysis engine is a prototype rule-based statistical estimator. It extracts
surface linguistic and structural patterns (such as sentence length uniformity,
vocabulary diversity, and repetition) to provide an estimated probability score.
It does NOT claim to definitively prove whether any text was authored by human or AI.
"""

import re
import math
from collections import Counter
from typing import Dict, Any


# Common transitional phrases frequently observed in standard LLM generation
COMMON_LLM_PATTERNS = [
    r"\bfurthermore\b",
    r"\bmoreover\b",
    r"\bin conclusion\b",
    r"\bit is important to note\b",
    r"\bit is worth noting\b",
    r"\ba testament to\b",
    r"\bdelve into\b",
    r"\bdelves into\b",
    r"\bplays a pivotal role\b",
    r"\brich tapestry\b",
    r"\bseamlessly\b",
    r"\bin summary\b",
]

# Basic English stopwords for content word frequency analysis
STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
    "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from",
    "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself",
    "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its",
    "itself", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off",
    "on", "once", "only", "or", "other", "our", "ours", "ourselves", "out", "over",
    "own", "same", "she", "should", "so", "some", "such", "than", "that", "the",
    "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this",
    "those", "through", "to", "too", "under", "until", "up", "very", "was", "we",
    "were", "what", "when", "where", "which", "while", "who", "whom", "why", "with",
    "won't", "would", "you", "your", "yours", "yourself", "yourselves"
}


def analyze_text(text: str) -> Dict[str, Any]:
    """
    Analyzes submitted text using rule-based linguistic metrics and estimates
    the likelihood of AI vs. human origin.

    Args:
        text (str): Input text to analyze.

    Returns:
        dict: Containing 'ai_probability', 'human_probability', and 'details' dictionary.

    Raises:
        ValueError: If text is empty or too short for meaningful analysis.
    """
    # 1. Validation: Reject empty or whitespace-only text
    if not text or not text.strip():
        raise ValueError("Text cannot be empty. Please provide text to analyze.")

    # 2. Tokenization
    # Extract alphanumeric words (preserving contractions)
    words = re.findall(r"\b[a-zA-Z0-9']+\b", text)
    word_count = len(words)

    # Validation: Ensure sufficient length for statistical metrics
    MINIMUM_WORDS = 10
    if word_count < MINIMUM_WORDS:
        raise ValueError(
            f"Text is too short for meaningful analysis ({word_count} word{'s' if word_count != 1 else ''} detected). "
            f"Please provide at least {MINIMUM_WORDS} words."
        )

    # Segment sentences based on standard ending punctuation (. ! ?)
    raw_sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
    sentence_count = max(1, len(raw_sentences))

    # 3. Compute Structural Metrics
    # Average sentence length (words per sentence)
    average_sentence_length = round(word_count / sentence_count, 2)

    # Vocabulary diversity (Type-Token Ratio: unique words / total words)
    lower_words = [w.lower() for w in words]
    unique_words = set(lower_words)
    vocabulary_diversity = round(len(unique_words) / word_count, 2)

    # Repetition score (combination of repeated bigrams and repetitive content words)
    repetition_score = _calculate_repetition_score(lower_words)

    # Sentence length variation (standard deviation across sentence lengths)
    sentence_length_std = _calculate_sentence_length_variation(raw_sentences)

    # 4. Heuristic AI Probability Calculation
    ai_score = _estimate_ai_probability(
        word_count=word_count,
        sentence_count=sentence_count,
        avg_sentence_len=average_sentence_length,
        vocab_diversity=vocabulary_diversity,
        repetition_score=repetition_score,
        sentence_std=sentence_length_std,
        text=text
    )

    # Clamp probability to a realistic range (5.0% - 95.0%)
    # This emphasizes that the metric is an estimation and never absolute proof.
    clamped_ai_prob = round(max(5.0, min(95.0, ai_score)), 1)
    clamped_human_prob = round(100.0 - clamped_ai_prob, 1)

    return {
        "ai_probability": clamped_ai_prob,
        "human_probability": clamped_human_prob,
        "details": {
            "word_count": word_count,
            "sentence_count": sentence_count,
            "average_sentence_length": average_sentence_length,
            "vocabulary_diversity": vocabulary_diversity,
            "repetition_score": repetition_score,
        }
    }


def _calculate_repetition_score(lower_words: list) -> float:
    """Calculates a normalized repetition score between 0.0 and 1.0."""
    if len(lower_words) < 2:
        return 0.0

    # Bigram repetition
    bigrams = [f"{lower_words[i]} {lower_words[i+1]}" for i in range(len(lower_words) - 1)]
    bigram_rep_ratio = 1.0 - (len(set(bigrams)) / len(bigrams)) if bigrams else 0.0

    # Content word repetition (excluding common stopwords)
    content_words = [w for w in lower_words if w not in STOPWORDS]
    if content_words:
        counts = Counter(content_words)
        repeated_tokens = sum(count for count in counts.values() if count > 1)
        content_rep_ratio = repeated_tokens / len(content_words)
    else:
        content_rep_ratio = 0.0

    # Weighted blend
    score = (0.5 * bigram_rep_ratio) + (0.5 * content_rep_ratio)
    return round(min(1.0, max(0.0, score)), 2)


def _calculate_sentence_length_variation(sentences: list) -> float:
    """Computes the standard deviation of sentence lengths (word counts)."""
    if len(sentences) <= 1:
        return 0.0

    lengths = [len(re.findall(r"\b[a-zA-Z0-9']+\b", s)) for s in sentences if s.strip()]
    if not lengths:
        return 0.0

    mean_len = sum(lengths) / len(lengths)
    variance = sum((l - mean_len) ** 2 for l in lengths) / len(lengths)
    return math.sqrt(variance)


def _estimate_ai_probability(
    word_count: int,
    sentence_count: int,
    avg_sentence_len: float,
    vocab_diversity: float,
    repetition_score: float,
    sentence_std: float,
    text: str
) -> float:
    """
    Combines individual statistical signals into a single estimated AI probability score.
    """
    # Start at a neutral baseline
    score = 50.0

    # Factor 1: Sentence Length Uniformity (Burstiness)
    # LLMs tend to generate consistent sentence lengths (low std dev),
    # while humans naturally mix very short sentences with long complex clauses.
    if sentence_count >= 3:
        if sentence_std < 3.0:
            score += 15.0  # High uniformity -> AI indicator
        elif sentence_std < 4.5:
            score += 6.0
        elif sentence_std > 8.0:
            score -= 15.0  # High burstiness / variation -> Human indicator
        elif sentence_std > 5.5:
            score -= 8.0

    # Factor 2: Average Sentence Length
    # LLM writing frequently centers around 16 - 24 words per sentence
    if 16.0 <= avg_sentence_len <= 24.0:
        score += 8.0
    elif avg_sentence_len < 11.0 or avg_sentence_len > 32.0:
        score -= 8.0

    # Factor 3: Vocabulary Diversity (Type-Token Ratio)
    # Human text often exhibits richer vocabulary or informal variance
    if vocab_diversity > 0.82 and word_count >= 30:
        score -= 10.0
    elif vocab_diversity < 0.55:
        score += 12.0

    # Factor 4: Repetition
    if repetition_score > 0.35:
        score += 10.0
    elif repetition_score < 0.12:
        score -= 6.0

    # Factor 5: Presence of typical LLM discourse markers
    lower_text = text.lower()
    marker_hits = 0
    for pattern in COMMON_LLM_PATTERNS:
        if re.search(pattern, lower_text):
            marker_hits += 1

    if marker_hits > 0:
        # Add up to +12% for characteristic LLM transitional phrases
        score += min(12.0, marker_hits * 4.0)

    # Factor 6: Punctuation Patterns
    # High frequency of informal punctuation (e.g., dashes, exclamation, brackets)
    informal_punct = len(re.findall(r'[!—\-\(\)]', text))
    if informal_punct >= 3 and word_count < 150:
        score -= 6.0

    return score
