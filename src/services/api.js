const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error HTTP ${response.status}`);
  }
  return response.json();
}

export const api = {
  // GET /cards (con filtros opcionales)
  getCards: async (rarity = '', cardType = '') => {
    const params = new URLSearchParams();
    if (rarity) params.append('rarity', rarity);
    if (cardType) params.append('card_type', cardType);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/cards${queryString}`);
    return handleResponse(res);
  },

  // GET /cards/valuation
  getValuation: async () => {
    const res = await fetch(`${API_BASE_URL}/cards/valuation`);
    return handleResponse(res);
  },

  // POST /cards
  createCard: async (cardData) => {
    const res = await fetch(`${API_BASE_URL}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cardData),
    });
    return handleResponse(res);
  },

  // GET /cards/search-external?query=...
  searchExternalCards: async (query) => {
    const res = await fetch(
      `${API_BASE_URL}/cards/search-external?query=${encodeURIComponent(query)}`
    );
    return handleResponse(res);
  },

  // DELETE /cards/:cardId
  deleteCard: async (cardId) => {
    const res = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // POST /automated/chatbot
  sendChatQuery: async (query) => {
    const res = await fetch(`${API_BASE_URL}/automated/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    return handleResponse(res);
  },

  // POST /automated/trigger-report
  triggerReport: async (destinationEmail) => {
    const res = await fetch(`${API_BASE_URL}/automated/trigger-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination_email: destinationEmail }),
    });
    return handleResponse(res);
  },
};