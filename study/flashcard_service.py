import json
import os
import re

from dotenv import load_dotenv
from google import genai

from .chroma_db import collection

load_dotenv()


def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured in the environment."
        )

    return genai.Client(api_key=api_key)


def get_document_text(document_id):
    """
    Get all ChromaDB chunks belonging to one PDF document.
    """
    results = collection.get(
        where={"document_id": str(document_id)}
    )

    documents = results.get("documents") or []

    if not documents:
        return ""

    return "\n\n".join(documents)


def clean_json_response(text):
    """
    Gemini sometimes wraps JSON in ```json ... ```.
    Remove that wrapper before parsing.
    """
    text = text.strip()

    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

    return text.strip()


def generate_flashcards(
    document_id,
    number_of_cards=10,
    difficulty="medium",
):
    """
    Generate AI flashcards from the selected PDF's ChromaDB chunks.
    """

    document_text = get_document_text(document_id)

    if not document_text:
        raise ValueError(
            "No indexed text found for this document."
        )

    # Keep the prompt reasonably sized.
    # Chroma may contain a large amount of text for big PDFs.
    max_context_chars = 30000
    context = document_text[:max_context_chars]

    prompt = f"""
You are an expert study assistant.

Create exactly {number_of_cards} study flashcards from the document
context below.

Difficulty: {difficulty}

Rules:
- Use ONLY information present in the provided context.
- Do not invent facts.
- Focus on important concepts, definitions, principles, formulas,
  processes, relationships, and exam-relevant facts.
- Each question must test one clear concept.
- Answers should be concise but sufficient.
- Assign each card a difficulty of easy, medium, or hard.
- Avoid duplicate questions.

Return ONLY valid JSON.
Do not use Markdown.
Do not use ```.

Required format:

[
  {{
    "question": "Question here",
    "answer": "Answer here",
    "difficulty": "medium"
  }}
]

Document context:
{context}
"""

    client = get_gemini_client()

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    raw_text = getattr(response, "text", None)

    if not raw_text:
        raise RuntimeError(
            "Gemini returned an empty response."
        )

    cleaned = clean_json_response(raw_text)

    try:
        cards = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            f"Gemini returned invalid JSON: {cleaned[:500]}"
        ) from exc

    if not isinstance(cards, list):
        raise RuntimeError(
            "Gemini response must be a JSON array."
        )

    valid_cards = []

    for card in cards:
        if not isinstance(card, dict):
            continue

        question = str(card.get("question", "")).strip()
        answer = str(card.get("answer", "")).strip()
        card_difficulty = str(
            card.get("difficulty", difficulty)
        ).lower().strip()

        if not question or not answer:
            continue

        if card_difficulty not in {"easy", "medium", "hard"}:
            card_difficulty = difficulty

        valid_cards.append({
            "question": question,
            "answer": answer,
            "difficulty": card_difficulty,
        })

    if not valid_cards:
        raise RuntimeError(
            "Gemini did not return any valid flashcards."
        )

    return valid_cards[:number_of_cards]
