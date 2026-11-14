import httpx
import os

# Dirección del webhook de n8n para la alerta de Telegram (Flujo 3 de Axel)
N8N_TELEGRAM_WEBHOOK_URL = os.getenv("N8N_TELEGRAM_WEBHOOK_URL", "http://localhost:5678/webhook/alerta-carta-valiosa")
# Dirección del webhook de n8n para disparo de reportes (Flujo 2 de Axel)
N8N_REPORT_WEBHOOK_URL = os.getenv("N8N_REPORT_WEBHOOK_URL", "http://localhost:5678/webhook/generar-reporte")

async def notify_valuable_card(card: dict):
    """Notifica a n8n si la carta supera $50 USD o es de rareza alta."""
    threshold_price = 50.0
    rare_types = ["Hyper Rare", "Special Illustration Rare", "Secret Rare", "Ultra Rare"]
    
    if card["estimated_price"] >= threshold_price or card["rarity"] in rare_types:
        async with httpx.AsyncClient() as client:
            try:
                await client.post(N8N_TELEGRAM_WEBHOOK_URL, json=card, timeout=5.0)
            except Exception as e:
                print(f"[Warning] No se pudo enviar notificación a n8n: {e}")

async def trigger_email_report(email: str, valuation_data: dict) -> bool:
    """Envía a n8n el pedido de reporte por mail."""
    payload = {
        "destination_email": email,
        "summary": valuation_data
    }
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(N8N_REPORT_WEBHOOK_URL, json=payload, timeout=5.0)
            return res.status_code == 200
        except Exception as e:
            print(f"[Error] Fallo al invocar webhook de reporte: {e}")
            return False