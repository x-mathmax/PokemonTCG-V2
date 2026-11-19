from fastapi import APIRouter, HTTPException, BackgroundTasks, status, Query
from typing import List, Optional
from app.models import CardCreate, CardResponse, ValuationSummary
from app import database
from app.services.n8n_client import notify_valuable_card
from app.services.tcg_api import fetch_card_image, search_tcg_cards

router = APIRouter(prefix="/cards", tags=["Cartas e Inventario"])

# Endpoint 1: GET /cards (Lista con filtros opcionales)
@router.get("", response_model=List[CardResponse])
def get_cards(rarity: Optional[str] = None, card_type: Optional[str] = None):
    cards = database.get_all_cards()
    if rarity:
        cards = [c for c in cards if c.get("rarity").lower() == rarity.lower()]
    if card_type:
        cards = [c for c in cards if c.get("type").lower() == card_type.lower()]
    return cards

# Endpoint 2: GET /cards/valuation (Valuación total y métricas)
@router.get("/valuation", response_model=ValuationSummary)
def get_valuation():
    cards = database.get_all_cards()
    if not cards:
        return ValuationSummary(
            total_cards=0,
            total_valuation_usd=0.0,
            average_card_price=0.0,
            most_expensive_card=None,
            cards_by_rarity={}
        )
    
    total_val = sum(c["estimated_price"] for c in cards)
    avg_price = total_val / len(cards)
    most_expensive = max(cards, key=lambda x: x["estimated_price"])
    
    by_rarity = {}
    for c in cards:
        r = c.get("rarity", "Unspecified")
        by_rarity[r] = by_rarity.get(r, 0) + 1
        
    return ValuationSummary(
        total_cards=len(cards),
        total_valuation_usd=round(total_val, 2),
        average_card_price=round(avg_price, 2),
        most_expensive_card=most_expensive,
        cards_by_rarity=by_rarity
    )

# # Endpoint 3 :Busca cartas en la API externa de Pokémon TCG
@router.get("/search-external")
async def search_external_cards(
    query: str = Query(
        ...,
        min_length=2,
        description="Nombre de la carta a buscar",
    ),
):
    results = await search_tcg_cards(query)
    return results

# Endpoint 4: GET /cards/{card_id} (Detalle individual)
@router.get("/{card_id}", response_model=CardResponse)
def get_card(card_id: str):
    card = database.get_card_by_id(card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Carta no encontrada")
    return card

# Endpoint 5: POST /cards (Agregar carta + webhook automático si es valiosa)
@router.post("", response_model=CardResponse, status_code=status.HTTP_201_CREATED)
async def create_card(card_data: CardCreate, background_tasks: BackgroundTasks):
    if not card_data.image_url:
        card_data.image_url = await fetch_card_image(card_data.name)
       
    new_card = database.add_card(card_data)
    background_tasks.add_task(notify_valuable_card, new_card)
    return new_card