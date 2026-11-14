from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import cards, automated

app = FastAPI(
    title="TCG Cards & Counters API",
    description="Backend oficial para gestión de inventario, valuación y chatbot de counters.",
    version="1.0.0"
)

# -------------------------------------------------------------
# CONFIGURACIÓN DE CORS (Crucial para consumir desde React)
# -------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite pedidos desde React (http://localhost:5173, etc.)
    allow_credentials=True,
    allow_methods=["*"],  # Permite GET, POST, PUT, DELETE, OPTIONS
    allow_headers=["*"],  # Permite todos los headers
)

# Inclusión de Routers
app.include_router(cards.router)
app.include_router(automated.router)

@app.get("/")
def root():
    return {
        "message": "API de Cartas y Counters TCG activa 🚀",
        "docs_url": "http://localhost:8000/docs"
    }