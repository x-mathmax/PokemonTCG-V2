import json
import os
import uuid
from typing import List, Optional
from app.models import CardCreate, CardResponse

DB_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "cards_db.json")

def _ensure_db_exists():
    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, indent=2)

def load_cards() -> List[dict]:
    _ensure_db_exists()
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return []

def save_cards(cards: List[dict]):
    _ensure_db_exists()
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(cards, f, indent=2, ensure_ascii=False)

def get_all_cards() -> List[dict]:
    return load_cards()

def get_card_by_id(card_id: str) -> Optional[dict]:
    cards = load_cards()
    for card in cards:
        if card["id"] == card_id:
            return card
    return None

def add_card(card_data: CardCreate) -> dict:
    cards = load_cards()
    new_card = card_data.model_dump()
    new_card["id"] = f"card-{uuid.uuid4().hex[:6]}"
    cards.append(new_card)
    save_cards(cards)
    return new_card