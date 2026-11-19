# ⚡ Pokémon TCG Vault (V2)
### Gestión de Inventario, Valuación y Automatizaciones con IA & Low-Code

Plataforma integral para coleccionistas y jugadores competitivos de **Pokémon TCG**. Permite administrar un inventario interactivo de cartas, obtener valuaciones de mercado y arte oficial en tiempo real, consultar debilidades y cartas *counter* mediante un Chatbot con Inteligencia Artificial, y disparar automatizaciones de reportes por correo electrónico y alertas a Telegram a través de **n8n**.

---

## 🎯 1. Objetivo del Proyecto

El objetivo de esta solución es modernizar y automatizar el ciclo de vida del coleccionismo y análisis estratégico de cartas de Pokémon TCG:
1. **Digitalizar y valuar el inventario:** Facilitar la carga de cartas mediante la integración directa con la API oficial de Pokémon TCG, obteniendo imágenes en alta resolución y cotizaciones de mercado en USD (TCGPlayer / Cardmarket) sin necesidad de ingreso manual tedioso.
2. **Análisis estratégico con IA:** Proveer recomendaciones en tiempo real sobre qué cartas utilizar como *counter* frente a mazos rivales mediante un agente conversacional.
3. **Automatización de notificaciones:** Notificar instantáneamente vía Telegram cuando ingresa una carta valiosa y enviar balances de inventario por correo electrónico a demanda utilizando flujos de trabajo en **n8n**.

---

## 🏗️ 2. Componentes de la Arquitectura

El sistema está diseñado bajo una arquitectura modular desacoplada:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                      │
│            Vite • Tailwind CSS v4 • Lucide Icons            │
│                  http://localhost:5173                      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI REST)                    │
│      Python 3.11 • Uvicorn • Pydantic • HTTPX Client        │
│                  http://localhost:8000                      │
└──────────────┬───────────────────────────────┬──────────────┘
               │ Lectura/Escritura             │ Webhooks
               ▼                               ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│ Base de Datos JSON (Volume)  │ │      Motor n8n (Low-Code)   │
│     data/cards_db.json       │ │  • Chatbot de Counters (IA) │
│                              │ │  • Reportes Email (SMTP)    │
│                              │ │  • Alertas Telegram Bot     │
│                              │ │    http://localhost:5678    │
└──────────────────────────────┘ └─────────────────────────────┘
```

1. **Frontend (Web App):**
   - Desarrollado con **React 19**, **Vite** y **Tailwind CSS v4**.
   - Interfaz temática Pokémon con diseño responsivo, buscador externo interactivo, filtros reactivos, panel de métricas, diálogos de confirmación y widget flotante de chatbot.
2. **Backend (API REST):**
   - Desarrollado en **FastAPI** (Python 3.11).
   - Documentación OpenAPI/Swagger autogenerada.
   - Conector con la API externa pública de Pokémon TCG (`api.pokemontcg.io`).
   - Tareas en segundo plano (`BackgroundTasks`) para disparo asíncrono de webhooks.
3. **Persistencia de Datos:**
   - Archivo JSON estructurado (`data/cards_db.json`) montado como volumen persistente en Docker.
4. **Motor de Automatización (n8n):**
   - Contenedor oficial de **n8n** orquestando tres flujos principales:
     - `01_chatbot_counters.json`: Flujo de chat y análisis de counters.
     - `02_reporte_inventario_email.json`: Generación y despacho de reporte consolidado por email.
     - `03_alerta_telegram_carta_valiosa.json`: Notificación inmediata vía bot de Telegram para cartas con precio $\ge$ 50 USD o rarezas especiales.

---

## 📋 3. Requisitos Previos

Antes de comenzar, asegurate de tener instalado en tu equipo:

- **Docker Desktop** (con soporte para Docker Compose v2).
- **Node.js** (versión 18.x o superior) y gestor de paquetes **npm**.
- *(Opcional)* **Python 3.11+** si deseás ejecutar el backend localmente sin Docker.
- Conexión a Internet para la consulta de cartas y descarga de imágenes oficiales.

---

## 🚀 4. Instrucciones de Instalación y Ejecución

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/x-mathmax/PokemonTCG-V2.git
cd PokemonTCG-V2
```

---

### Paso 2: Iniciar Servicios de Backend & n8n con Docker

El proyecto incluye un archivo `compose.yaml` listo para desplegar el backend de FastAPI y el motor de n8n con sus respectivos volúmenes y redes.

#### Iniciar los servicios en segundo plano:
```bash
docker compose up -d --build
```

#### Comandos útiles para la gestión de Docker:
- **Ver el estado de los servicios:**
  ```bash
  docker compose ps
  ```
- **Ver los logs en tiempo real:**
  ```bash
  docker compose logs -f
  ```
- **Ver logs de un servicio específico:**
  ```bash
  docker compose logs -f backend
  docker compose logs -f n8n
  ```
- **Detener los servicios (sin borrar datos):**
  ```bash
  docker compose stop
  ```
- **Detener y remover los contenedores y redes:**
  ```bash
  docker compose down
  ```
- **Reiniciar los servicios:**
  ```bash
  docker compose restart
  ```

---

### Paso 3: Iniciar el Frontend (React + Vite)

En una terminal independiente, dentro de la raíz del proyecto:

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

3. El frontend estará disponible en: **`http://localhost:5173`**

---

## 🌐 5. Puntos de Acceso del Sistema

| Servicio | URL | Descripción |
| :--- | :--- | :--- |
| **Frontend Web** | [http://localhost:5173](http://localhost:5173) | Interfaz de usuario de React |
| **Backend API (Swagger Docs)** | [http://localhost:8000/docs](http://localhost:8000/docs) | Documentación interactiva de endpoints |
| **Backend API (ReDoc)** | [http://localhost:8000/redoc](http://localhost:8000/redoc) | Documentación técnica alternativa |
| **n8n Workflow Engine** | [http://localhost:5678](http://localhost:5678) | Panel de administración de flujos low-code |

---

## ✨ 6. Principales Funcionalidades

### 1. Búsqueda y Autocompletado desde Pokémon TCG API
- Al presionar **"Nueva Carta"**, se abre un modal con buscador oficial.
- Al escribir el nombre de un Pokémon (ej: *Charizard*, *Pikachu*, *Mewtwo*), el sistema consulta la API pública y muestra una grilla de cartas encontradas con su foto oficial, set, tipo, rareza y precio de mercado.
- Al seleccionar una carta, **todos los datos se autocompletan en un clic**. Se puede editar el precio o añadir counters/notas opcionales antes de guardar.
- Dispone además de una opción para carga manual en caso de requerirse.

### 2. Inventario Interactivo y Filtros Dinámicos
- Muestra las cartas con estilo de tarjeta Pokémon, ilustración oficial, tipo, rareza y precio destacado.
- Filtros reactivos por **Rareza** (*Hyper Rare*, *Special Illustration Rare*, *Ultra Rare*, etc.) y por **Tipo elemental** (*Fire*, *Water*, *Psychic*, etc.).

### 3. Eliminación Segura con Confirmación
- Cada carta cuenta con un botón de cesto de basura en la esquina superior.
- Al presionarlo, se abre un diálogo modal de confirmación (*"¿Está seguro de que desea eliminar esta carta de su colección?"*).
- Al confirmar, se envía la petición `DELETE /cards/{id}`, se remueve la carta del almacenamiento y se recalculan al instante las métricas globales.

### 4. Panel de Valuación de la Colección
- Indicador en tiempo real de la **Valuación Total en USD**, **Total de Cartas** registradas y la **Carta Top (más valiosa)** del inventario.

### 5. Generación y Envío de Reporte por Email (n8n)
- Espacio dedicado en el panel superior para ingresar una dirección de correo y presionar **"Reporte Email"**.
- El backend procesa la petición y dispara el webhook de n8n para generar el balance del inventario y despacharlo por correo, con mensaje de confirmación en pantalla.

### 6. Chatbot Estratégico de Counters con IA
- Burbuja flotante e interactiva en la esquina inferior derecha.
- Permite consultar estrategias, ventajas elementales y counters recomendados para enfrentar cualquier carta rival. Se conecta con el flujo `01_chatbot_counters` de n8n (con fallback inteligente en backend si n8n no está conectado).

### 7. Alertas Automáticas de Cartas Valiosas en Telegram
- Si una carta agregada tiene un precio estimado $\ge$ $50 USD o pertenece a rarezas altas (*Hyper Rare*, *Special Illustration Rare*, *Secret Rare*, *Ultra Rare*), el backend dispara automáticamente en segundo plano una notificación al bot de Telegram configurado en n8n.

---

## 📁 7. Estructura del Repositorio

```text
PokemonTCG-V2/
├── app/                              # Backend en FastAPI
│   ├── main.py                       # Punto de entrada de la API y CORS
│   ├── models.py                     # Esquemas de datos Pydantic
│   ├── database.py                   # Lógica de persistencia en JSON
│   ├── routers/
│   │   ├── cards.py                  # Endpoints CRUD y búsqueda de cartas
│   │   └── automated.py              # Endpoints de chatbot y reporte email
│   └── services/
│       ├── tcg_api.py                # Cliente de conexión con Pokémon TCG API
│       └── n8n_client.py             # Cliente HTTP para webhooks de n8n
├── data/
│   └── cards_db.json                 # Base de datos local de cartas
├── n8n_workflows/                    # Flujos de automatización exportados
│   ├── 01_chatbot_counters.json
│   ├── 02_reporte_inventario_email.json
│   └── 03_alerta_telegram_carta_valiosa.json
├── src/                              # Frontend en React
│   ├── components/
│   │   ├── AddCardModal.jsx          # Modal con buscador oficial y selección
│   │   ├── CardInventory.jsx         # Grilla de inventario y selectores
│   │   ├── ChatbotWidget.jsx         # Burbuja flotante de chatbot
│   │   ├── PokemonCardItem.jsx       # Tarjeta individual con cestito de borrado
│   │   └── ValuationHeader.jsx       # Métricas de valuación y disparador de reporte
│   ├── services/
│   │   └── api.js                    # Capa de consumo del backend FastAPI
│   ├── App.jsx                       # Componente principal de la aplicación
│   ├── main.jsx                      # Bootstrap de React
│   └── index.css                     # Configuración de estilos Tailwind CSS v4
├── compose.yaml                      # Configuración de Docker Compose (FastAPI + n8n)
├── Dockerfile                        # Imagen Docker para el backend
├── package.json                      # Dependencias y scripts del Frontend
├── requirements.txt                  # Dependencias de Python
└── README.md                         # Documentación general del proyecto
```

---

## 👥 Equipo de Desarrollo

- **Frontend & UI/UX:** Barbie (`Barbie-Frontend`)
- **Backend & Integración TCG API:** Braian (`Braian-Backend`)
- **Automatizaciones & Flujos n8n:** Axel (`Axel-N8N`)
