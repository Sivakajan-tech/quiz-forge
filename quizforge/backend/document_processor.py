"""
Document processing utilities for Foundry IQ document ingestion pipeline.
Handles text extraction from various file formats before passing to
Foundry IQ for indexing and knowledge retrieval.
"""

import pdfplumber
import io


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text content from a PDF file."""
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)


def extract_facts_from_text(raw_text: str, max_facts: int = 8) -> list[str]:
    """
    Extract key facts from raw text for Foundry IQ knowledge indexing.
    Splits text into fact-sized chunks suitable for grounding LLM prompts.
    """
    raw_text = raw_text.strip()
    if not raw_text:
        return []

    sentences = []
    for para in raw_text.split("\n"):
        para = para.strip()
        if len(para) < 20:
            continue
        for sent in para.replace(". ", ".\n").split("\n"):
            sent = sent.strip()
            if len(sent) >= 30:
                sentences.append(sent[:250])

    unique = list(dict.fromkeys(sentences))
    unique.sort(key=len, reverse=True)
    return unique[:max_facts]
