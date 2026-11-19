from pydantic import BaseModel, Field
from typing import List, Optional

class CardBase(BaseModel):
    name: str = Field(..., example="Charizard ex")
    set_name: str = Field(..., example="Obsidian Flames")
    rarity: str = Field(..., example="Hyper Rare")
    type: str = Field(..., example="Fire")
    estimated_price: float = Field(..., gt=0, example=85.50)
    image_url: Optional[str] = Field(default=None, example="https://images.pokemontcg.io/sv3/223.png")
    counter_cards: List[str] = Field(default=[], example=["Starmie ex", "Blastoise ex"])
    counter_notes: Optional[str] = Field(default="", example="Vulnerable a ataques tipo agua rápidos.")

class CardCreate(CardBase):
    pass

class CardResponse(CardBase):
    id: str

class ValuationSummary(BaseModel):
    total_cards: int
    total_valuation_usd: float
    average_card_price: float
    most_expensive_card: Optional[CardResponse]
    cards_by_rarity: dict

class ChatQueryRequest(BaseModel):
    query: str = Field(..., example="¿Cuáles son los mejores counters para Charizard ex?")

class ChatQueryResponse(BaseModel):
    query: str
    reply: str
    suggested_counters: List[str]

class ReportTriggerRequest(BaseModel):
    destination_email: str = Field(..., example="ejemplo@correo.com")