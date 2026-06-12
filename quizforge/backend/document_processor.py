import pdfplumber
import io


def extract_text_from_pdf(file_bytes: bytes) -> str:
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)


def extract_facts_from_text(raw_text: str, max_facts: int = 8) -> list[str]:
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

    # Deduplicate and take the most informative (longest) ones
    unique = list(dict.fromkeys(sentences))
    unique.sort(key=len, reverse=True)
    return unique[:max_facts]


def get_context_from_document(raw_text: str, source_name: str = "user-upload") -> dict:
    facts = extract_facts_from_text(raw_text)

    if not facts:
        return {
            "topic": source_name,
            "facts": [],
            "source": "foundry-iq-document-ingestion",
            "confidence": 0.0,
            "grounded": False,
            "warning": "Could not extract meaningful content from the document.",
        }

    return {
        "topic": source_name,
        "facts": facts,
        "source": "foundry-iq-document-ingestion",
        "confidence": 0.95,
        "grounded": True,
    }
