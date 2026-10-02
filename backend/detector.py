"""
detector.py — ModernBERT-based AI Text Detection.

Uses the pretrained "ogmatrixllm/glyph-v1.1" model (DeBERTa-v3-base GLYPH)
for binary AI-vs-human text classification.

The model is loaded once at module startup. The analyze_text() function
returns the model's raw probability output without any manual modification.
"""

import re
import unicodedata
from typing import Dict, Any

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer


MODEL_NAME = "ogmatrixllm/glyph-v1.1"

# ---------------------------------------------------------------------------
# NFKC normalization as recommended by the model card
# Strips zero-width invisibles, fullwidth chars, ligatures; collapses whitespace.
# ---------------------------------------------------------------------------
_ZERO_WIDTH = re.compile(r"[\u200b-\u200d\u200e\u200f\u202a-\u202e\u2060-\u206f\ufeff\u00ad\u034f\u180e]")
_WHITESPACE = re.compile(r"\s+")


def _normalize_text(text: str) -> str:
    """Apply NFKC normalization and strip zero-width / invisible characters."""
    t = unicodedata.normalize("NFKC", text)
    t = _ZERO_WIDTH.sub("", t)
    t = _WHITESPACE.sub(" ", t).strip()
    return t


# ---------------------------------------------------------------------------
# Load model and tokenizer once at module import time.
# GLYPH uses a slow DeBERTa-v3 SentencePiece tokenizer (use_fast=False).
# ---------------------------------------------------------------------------
_tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, use_fast=False)
_model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
_model.eval()

# LABEL_0 = human, LABEL_1 = AI (per GLYPH model card)
_HUMAN_LABEL = 0
_AI_LABEL = 1


def analyze_text(text: str) -> Dict[str, Any]:
    """
    Analyzes submitted text using the Tabularis ModernBERT R1 AI detector.

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
    words = re.findall(r"\b[a-zA-Z0-9']+\b", text)
    word_count = len(words)

    # Validation: Ensure sufficient length for statistical metrics
    MINIMUM_WORDS = 10
    if word_count < MINIMUM_WORDS:
        raise ValueError(
            f"Text is too short for meaningful analysis ({word_count} word{'s' if word_count != 1 else ''} detected). "
            f"Please provide at least {MINIMUM_WORDS} words."
        )

    # 3. Compute structural metrics (for details output, not used for scoring)
    raw_sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
    sentence_count = max(1, len(raw_sentences))
    average_sentence_length = round(word_count / sentence_count, 2)

    lower_words = [w.lower() for w in words]
    unique_words = set(lower_words)
    vocabulary_diversity = round(len(unique_words) / word_count, 2)

    # 4. Run the pretrained model for AI probability
    normalized = _normalize_text(text)
    inputs = _tokenizer(
        normalized,
        return_tensors="pt",
        truncation=True,
        max_length=512,
    )

    with torch.no_grad():
        outputs = _model(**inputs)
        probs = torch.softmax(outputs.logits, dim=-1)

    ai_probability = round(probs[0][_AI_LABEL].item() * 100, 1)
    human_probability = round(100.0 - ai_probability, 1)

    # 5. Repetition score (for details output)
    repetition_score = _calculate_repetition_score(lower_words)

    return {
        "ai_probability": ai_probability,
        "human_probability": human_probability,
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
    content_words = [w for w in lower_words if w not in _STOPWORDS]
    if content_words:
        from collections import Counter
        counts = Counter(content_words)
        repeated_tokens = sum(count for count in counts.values() if count > 1)
        content_rep_ratio = repeated_tokens / len(content_words)
    else:
        content_rep_ratio = 0.0

    # Weighted blend
    score = (0.5 * bigram_rep_ratio) + (0.5 * content_rep_ratio)
    return round(min(1.0, max(0.0, score)), 2)


_STOPWORDS = {
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