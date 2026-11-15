import { useEffect, useState, useCallback } from 'react';
import { Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from './services/api';
import ValuationHeader from './components/ValuationHeader';
import CardInventory from './components/CardInventory';
import AddCardModal from './components/AddCardModal';
import ChatbotWidget from './components/ChatbotWidget';

export default function App() {
  const [cards, setCards] = useState([]);
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rarityFilter, setRarityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [cardsData, valuationData] = await Promise.all([
        api.getCards(rarityFilter, typeFilter),
        api.getValuation(),
      ]);
      setCards(cardsData);
      setValuation(valuationData);
    } catch (err) {
      setError(
        `Error de conexión con la API (${err.message}). Asegurate de que FastAPI esté corriendo en el puerto 8000.`
      );
    } finally {
      setLoading(false);
    }
  }, [rarityFilter, typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCardCreated = (newCard) => {
    fetchData();
    const alertNote =
      newCard.estimated_price >= 50
        ? ' (Se disparó alerta de carta valiosa a Telegram)'
        : '';
    setToast(`Carta "${newCard.name}" agregada al inventario${alertNote}.`);
    setTimeout(() => setToast(''), 5000);
  };

  return (
    <div className="min-h-screen flex flex-col pb-24 bg-[#F0F4F8]">
      {/* Navbar estilo Reverso Pokémon (Azul Marino + Borde Amarillo) */}
      <header className="bg-gradient-to-r from-[#0B2545] via-[#134074] to-[#0B2545] border-b-4 border-[#FFCB05] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Ícono Pokébola CSS puro */}
            <div className="w-10 h-10 rounded-full border-2 border-slate-900 overflow-hidden shadow-md relative shrink-0">
              <div className="h-1/2 bg-[#DC2626] border-b-2 border-slate-900" />
              <div className="h-1/2 bg-white" />
              <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>

            <div>
              <h1 className="pokemon-title text-xl sm:text-2xl leading-none">
                POKÉMON TCG VAULT
              </h1>
              <p className="text-[11px] text-blue-200 font-medium mt-0.5">
                Inventario, Valuación & AI Counters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchData}
              title="Recargar datos"
              className="p-2.5 text-blue-100 hover:text-[#FFCB05] bg-white/10 hover:bg-white/20 rounded-xl border border-white/15 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#0B2545] bg-[#FFCB05] hover:bg-[#ffd633] rounded-xl transition cursor-pointer shadow-sm border-b-2 border-[#B48A00]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Nueva Carta
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1">
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 border-l-4 border-[#DC2626] text-red-900 text-xs flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchData}
              className="underline font-semibold shrink-0 cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        {toast && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border-l-4 border-emerald-600 text-emerald-900 text-xs font-medium shadow-xs">
            {toast}
          </div>
        )}

        <ValuationHeader valuation={valuation} onError={setError} />

        <CardInventory
          cards={cards}
          loading={loading}
          rarityFilter={rarityFilter}
          typeFilter={typeFilter}
          onRarityChange={setRarityFilter}
          onTypeChange={setTypeFilter}
        />
      </main>

      <ChatbotWidget />

      <AddCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCardCreated={handleCardCreated}
        onError={setError}
      />
    </div>
  );
}