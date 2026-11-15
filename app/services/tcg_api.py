import httpx
from typing import Optional

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