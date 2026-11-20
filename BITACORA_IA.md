# Bitácora de Uso de Inteligencia Artificial

Este documento registra el uso de herramientas de Inteligencia Artificial durante el desarrollo del proyecto.

---

## Registro de Actividades

- **Herramientas / Modelos utilizado:** (Gemini / ChatGPT)

- **Objetivo / Problema abordado:** ¿Cómo estructuro el componente de cada carta (CardItem) para que muestre imagen, tipo, rareza y precio estimado, y se renderice dinámicamente desde un array?
- **Resultado obtenido:** Implementá un componente reutilizable CardItem recibiendo cada objeto carta por props y renderizando el catálogo mediante .map() con clave única (key={card.id}) y un fallback visual en caso de que la URL de la imagen falle. 
---

- **Objetivo / Problema abordado:** Al levantar el proyecto con Docker Compose, el frontend no muestra las imágenes cargadas a último momento ni recibe cambios del backend, aunque corriendo por consola sí funciona. ¿Qué puede estar pasando?"
- **Resultado obtenido:** Puede suceder que el contenedor del backend este corriendo una imagen en caché previa al agregado del campo de imagen y que las rutas relativas locales no coincidan con el volumen montado en Docker. Se recomienda reconstruir con docker compose up -d --build.
---

- **Objetivo / Problema abordado:** Quiero conectar mi cuenta de Gmail en n8n para disparar desde ahí los reportes de valuación, pero el nodo me pide credenciales OAuth2 con Client ID y Client Secret. ¿De dónde los saco y cómo configuro la pantalla de consentimiento y la URL de redirección en Google Cloud?
- **Resultado obtenido:** Para vincular tu Gmail con n8n mediante OAuth2, seguí estos pasos en Google Cloud Console. Primero habilitá la API entrando a APIs & Services, luego Library, buscá Gmail API y hacé clic en Enable. Segundo configurá la pantalla de consentimiento buscando en la barra superior Google Auth Platform y hacé clic en Get started: en App Information poné el nombre de la app como n8n Pokemon y elegí tu correo, en Audience seleccioná External y guardá, y después entrá a la pestaña Audience del menú izquierdo, bajá hasta Test users, tocá Add users y agregá tu dirección de Gmail. Tercero generá el Client ID y Client Secret entrando a Clients, luego Create client y elegí Web application, dejá vacía la primera opción de JavaScript origins y pegá la URL de callback de n8n en la segunda opción (Authorized redirect URIs): http://localhost:5678/rest/oauth2-credential/callback y tocá Create. Cuarto conectalo en n8n copiando el Client ID y Client Secret generados, pegalos en la credencial Gmail OAuth2 de n8n, hacé clic en Sign in with Google, aceptá los permisos y guardá el flujo.
---

- **Objetivo / Problema abordado:** ¿Cómo configuro el bot de Telegram y qué tengo que poner en Access Token, Base URL y Chat ID en n8n para probar el flujo 3 de alertas automáticas cuando ingresa una carta mayor a USD 50?
- **Resultado obtenido:** Para dejar funcionando las alertas en Telegram en menos de 2 minutos, hacé lo siguiente. Primero creá el bot y sacá el Access Token abriendo Telegram, buscá el usuario verificado @BotFather y enviale el comando /newbot, elegí un nombre visible como Pokemon TCG Vault Alertas y un username terminado en bot como pokemontcg_vault_bot, copiá el HTTP API Token que te devuelve y entrá al enlace t.me/tu_bot que te dio para tocar Iniciar o /start porque Telegram no deja que un bot te escriba primero si no iniciaste el chat antes. Segundo obtené tu chatId buscando @userinfobot en Telegram, tocá Iniciar o /start y copiá el número que aparece al lado de Id. Tercero configurá el nodo en n8n abriendo el flujo 03 - Alerta Carta Valiosa y creá una credencial nueva de tipo Telegram API, en Access Token pegá el token largo que te dio @BotFather, en Base URL dejá exactamente https://api.telegram.org sin barra al final y guardá hasta ver el cartel verde de conexión exitosa, y por último en el nodo Enviar Alerta Telegram pegá tu número en el campo Chat ID, activá el flujo y probalo cargando una carta mayor a USD 50 desde la web, por ejemplo Umbreon VMAX a 120 USD.
---

- **Objetivo / Problema abordado:** ¿Cómo organizo las carpetas del backend en Python para que el código quede prolijo, separado de los datos persistentes y listo para contenedorizar con Docker?
- **Resultado obtenido:** Para mantener separada la lógica del servidor de los archivos de datos y de la configuración de despliegue, organizá el proyecto con una carpeta raíz pokemon-tcg-vault que contenga el archivo compose.yaml, una carpeta data para el almacenamiento persistente en cards.json, una carpeta frontend con la aplicación de React y Vite, y una carpeta backend con los archivos main.py, requirements.txt y Dockerfile. De esa forma el código de la API queda encapsulado en su propio módulo dentro de backend, y Docker puede montar exclusivamente la carpeta data como volumen externo sin mezclar dependencias ni código fuente.
---

- **Objetivo / Problema abordado:** ¿Cómo armo el endpoint POST /chatbot en FastAPI para recibir la pregunta del usuario desde React, enviársela al webhook del AI Agent en n8n y devolver la respuesta estructurada al frontend? 
- **Resultado obtenido:** Para conectar el chat de la interfaz con el agente inteligente en n8n, definí un esquema Pydantic ChatRequest con el campo query de tipo string y creá la ruta POST /chatbot en main.py.
---

- **Objetivo / Problema abordado:** ¿Cómo puedo integrar Vite al proyecto si ya tengo archivos en la carpeta y se que no permite ejecutar para crear cuando no es una carpeta vacía?
- **Resultado obtenido:** Para evitar que el asistente de Vite sobreescriba o borre tus archivos actuales, generá el proyecto en una carpeta temporal ejecutando npm create vite@latest temp-front -- --template react desde la ruta padre. Una vez creada, mové únicamente los archivos de configuración base hacia tu carpeta frontend real (package.json, vite.config.js, index.html y la estructura inicial de src), borrá la carpeta temp-front y finalmente corré npm install dentro de frontend para instalar las dependencias sin tocar tu trabajo previo.

---

## Principales Decisiones Técnicas tomadas junto a la IA

**Validación y adaptación de código generado**: En lugar de copiar y pegar código, se utilizó la IA para generar estructuras base (como modelos Pydantic, llamadas asíncronas con fetch y httpx, o el manejo de estados en React) y luego se ajustaron manualmente los contratos de datos JSON para que coincidieran con los esquemas reales del equipo.

**Uso de IA como guía de configuración paso a paso**: Para las integraciones externas en n8n, se empleó el asistente para desglosar flujos complejos de autenticación (Google Cloud Auth Platform y BotFather de Telegram) en instrucciones secuenciales verificables en tiempo real.

**División estratégica de tareas asistidas**: Se aprovechó la IA para acelerar tareas repetitivas de estructura y código repetitivo en frontend y backend, reservando el criterio del equipo para las reglas de negocio (como el umbral de alerta mayor a USD 50), la división de responsabilidades y las pruebas de integración de punta a punta.

## Dificultades en la Interacción con la IA y Correcciones Realizadas

**Contexto incompleto en consultas iniciales**: En las primeras consultas sobre la estructura del proyecto o el manejo de archivos, las respuestas genéricas de la IA proponían rutas o métodos que no coincidían con el avance previo del equipo (por ejemplo, sugerir endpoints que aún no existían o sobrescribir carpetas con archivos previos). Se corrigió brindándole al asistente el contexto exacto de carpetas, fragmentos reales de código y restricciones del entorno antes de pedir soluciones.

**Diferencias de interfaz en herramientas externas**: Al configurar Gmail en Google Cloud, las instrucciones iniciales mencionaban nombres clásicos de menú (OAuth consent screen) que habían cambiado en la interfaz actual (Google Auth Platform). Se repreguntó detallando los errores exactos mostrados en pantalla para ajustar la configuración al flujo vigente y poder guiarnos con ella.

**Diagnóstico de diferencias entre ejecución local y Docker**: Cuando la IA sugería revisar la lógica de React o FastAPI por las imágenes faltantes, se acotó el problema explicando que por consola funcionaba y en Docker no, lo que permitió reorientar el diagnóstico hacia la caché de construcción de imágenes y el mapeo de volúmenes persistentes.