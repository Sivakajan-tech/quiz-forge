import json
import os
from difflib import get_close_matches

_KNOWLEDGE_PATH = os.path.join(os.path.dirname(__file__), "topic_knowledge.json")

with open(_KNOWLEDGE_PATH, "r") as f:
    _KNOWLEDGE_BASE = json.load(f)


def get_context(topic: str) -> dict:
    """
    Simulates Microsoft Foundry IQ grounded knowledge retrieval.

    Real Foundry IQ queries enterprise data sources (SharePoint, databases, documents)
    and returns cited, grounded facts to reduce AI hallucination.

    This mock does the same using a local knowledge base.
    """
    topic_lower = topic.lower().strip()

    # Exact match
    if topic_lower in _KNOWLEDGE_BASE:
        entry = _KNOWLEDGE_BASE[topic_lower]
        return {
            "topic": topic_lower,
            "facts": entry["facts"],
            "source": entry["source"],
            "confidence": entry["confidence"],
            "grounded": True,
        }

    # Fuzzy match — handles slight typos or alternate phrasing
    close = get_close_matches(topic_lower, _KNOWLEDGE_BASE.keys(), n=1, cutoff=0.6)
    if close:
        matched_key = close[0]
        entry = _KNOWLEDGE_BASE[matched_key]
        return {
            "topic": matched_key,
            "facts": entry["facts"],
            "source": entry["source"],
            "confidence": entry["confidence"] * 0.85,  # slightly lower confidence for fuzzy match
            "grounded": True,
            "matched_as": matched_key,
        }

    # No match — signal to AI to be cautious (mirrors real Foundry IQ behavior)
    return {
        "topic": topic_lower,
        "facts": [],
        "source": "mock-foundry-iq",
        "confidence": 0.0,
        "grounded": False,
        "warning": "No grounded knowledge found for this topic. AI should rely on general training and note uncertainty.",
    }


def list_supported_topics() -> list[str]:
    return list(_KNOWLEDGE_BASE.keys())
