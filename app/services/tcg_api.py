import httpx
from typing import Optional, List, Dict, Any

async def fetch_card_image(card_name: str) -> Optional[str]:
    """Consulta la API pública de Pokémon TCG para obtener la imagen oficial de la carta."""
    url = "https://api.pokemontcg.io/v2/cards"
    params = {"q": f'name:"{card_name}"', "pageSize": 1}
   
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(url, params=params, timeout=6.0)
            if res.status_code == 200:
                data = res.json()
                cards = data.get("data", [])
                if cards:
                    images = cards[0].get("images", {})
                    return images.get("small") or images.get("large")
        except Exception as e:
            print(f"[Warning] No se pudo obtener imagen externa para {card_name}: {e}")
    return None

def _extract_price(card: Dict[str, Any]) -> float:
    """Extrae el precio en USD: primero TCGPlayer y luego Cardmarket."""
    tcg_prices = (card.get("tcgplayer") or {}).get("prices") or {}

    variants = [
        "holofoil",
        "normal",
        "reverseHolofoil",
        "unlimitedHolofoil",
        "1stEditionHolofoil",
    ]

    for variant in variants:
        price_data = tcg_prices.get(variant) or {}
        if price_data.get("market") is not None:
            return round(float(price_data["market"]), 2)
        if price_data.get("mid") is not None:
            return round(float(price_data["mid"]), 2)

    cm_prices = (card.get("cardmarket") or {}).get("prices") or {}
    if cm_prices.get("averageSellPrice") is not None:
        return round(float(cm_prices["averageSellPrice"]), 2)
    if cm_prices.get("trendPrice") is not None:
        return round(float(cm_prices["trendPrice"]), 2)

    return 10.0


async def search_tcg_cards(
    query: str,
    page_size: int = 8,
) -> List[Dict[str, Any]]:
    """Busca cartas por nombre en la API pública de Pokémon TCG."""
    if not query or not query.strip():
        return []

    clean_query = query.strip()
    url = "https://api.pokemontcg.io/v2/cards"
    params = {
        "q": f'name:"*{clean_query}*"',
        "pageSize": page_size,
    }
    headers = {"User-Agent": "PokemonVault/1.0"}

    async with httpx.AsyncClient(headers=headers) as client:
        try:
            res = await client.get(url, params=params, timeout=8.0)

            if res.status_code != 200:
                exact_params = {
                    "q": f'name:"{clean_query}"',
                    "pageSize": page_size,
                }
                res = await client.get(url, params=exact_params, timeout=8.0)

            if res.status_code != 200:
                return []

            cards_data = res.json().get("data", [])
            results = []

            for card in cards_data:
                types = card.get("types") or ["Colorless"]
                images = card.get("images") or {}
                card_set = card.get("set") or {}

                results.append({
                    "name": card.get("name"),
                    "set_name": card_set.get("name", "Unknown Set"),
                    "rarity": card.get("rarity") or "Rare",
                    "type": types[0],
                    "estimated_price": _extract_price(card),
                    "image_url": images.get("small") or images.get("large"),
                })

            return results

        except Exception as error:
            print(
                f"[Warning] Error buscando cartas externas "
                f"para '{clean_query}': {error}"
            )
            return []