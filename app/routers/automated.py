import httpx
import os
from fastapi import APIRouter, HTTPException
from app.models import ChatQueryRequest, ChatQueryResponse, ReportTriggerRequest
from app.routers.cards import get_valuation
from app.services.n8n_client import trigger_email_report

router = APIRouter(prefix="/automated", tags=["Integración n8n & IA"])

N8N_CHATBOT_WEBHOOK_URL = os.getenv("N8N_CHATBOT_WEBHOOK_URL", "http://localhost:5678/webhook/chatbot-counters")

# Endpoint 5: POST /automated/chatbot (Consulta de counters de la V1)
@router.post("/chatbot", response_model=ChatQueryResponse)
async def chatbot_query(req: ChatQueryRequest):
    """
    Envía la consulta del usuario a n8n para ser procesada por el nodo de IA / Agent.
    Si n8n no responde, tiene un fallback local.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(N8N_CHATBOT_WEBHOOK_URL, json={"query": req.query}, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                return ChatQueryResponse(
                    query=req.query,
                    reply=data.get("reply", "Respuesta procesada exitosamente."),
                    suggested_counters=data.get("suggested_counters", [])
                )
    except Exception:
        pass  # Fallback si n8n no está levantado aún durante desarrollo

    # Fallback mock para trabajar sin bloquear el frontend
    q_lower = req.query.lower()
    if "charizard" in q_lower:
        reply = "Para frenar a Charizard ex te conviene usar pokémones de tipo Agua agresivos con ataques de bajo consumo de energía."
        counters = ["Starmie ex", "Blastoise ex", "Wellspring Mask Ogerpon ex"]
    else:
        reply = f"Análisis de counters para '{req.query}': priorizá control de banca y disrupción de energía."
        counters = ["Iron Valiant ex", "Flutter Mane"]

    return ChatQueryResponse(query=req.query, reply=reply, suggested_counters=counters)

# Endpoint extra para disparar el reporte por email
@router.post("/trigger-report")
async def request_report(req: ReportTriggerRequest):
    val_data = get_valuation()
    success = await trigger_email_report(req.destination_email, val_data.model_dump())
    if not success:
        return {"status": "ok", "message": "Disparado (Simulación en modo local sin n8n activo)"}
    return {"status": "ok", "message": f"Reporte enviado a {req.destination_email}"}