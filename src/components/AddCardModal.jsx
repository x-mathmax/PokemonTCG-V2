import { useState } from 'react';
import { X, Search, PlusCircle, Check, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { api } from '../services/api';

const DEFAULT_CARD_BACK = 'https://d1i787aglh9bmb.cloudfront.net/assets/img/global/tcg-card-back.jpg';

export default function AddCardModal({ isOpen, onClose, onCardCreated, onError }) {
  // Modo: 'search' (por defecto) o 'manual'
  const [mode, setMode] = useState('search');

  // Estados de búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  // Campos adicionales opcionales
  const [customPrice, setCustomPrice] = useState('');
  const [counterCardsText, setCounterCardsText] = useState('');
  const [counterNotes, setCounterNotes] = useState('');

  // Estados del formulario manual (fallback)
  const [manualForm, setManualForm] = useState({
    name: '',
    set_name: '',
    rarity: 'Rare',
    type: 'Fire',
    estimated_price: '',
    counter_cards_text: '',
    counter_notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  if (!isOpen) return null;

  const resetAll = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setSelectedCard(null);
    setCustomPrice('');
    setCounterCardsText('');
    setCounterNotes('');
    setModalError('');
    setMode('search');
    setManualForm({
      name: '',
      set_name: '',
      rarity: 'Rare',
      type: 'Fire',
      estimated_price: '',
      counter_cards_text: '',
      counter_notes: '',
    });
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  // Buscar en la API externa de Pokémon TCG
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query || query.length < 2) {
      setModalError('Ingresá al menos 2 letras para buscar.');
      return;
    }

    setModalError('');
    setIsSearching(true);
    setHasSearched(true);
    setSelectedCard(null);

    try {
      const results = await api.searchExternalCards(query);
      setSearchResults(results || []);
    } catch (err) {
      setModalError(`No se pudieron obtener resultados de la API: ${err.message}`);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Al seleccionar una carta de la lista de resultados
  const handleSelectCard = (card) => {
    setSelectedCard(card);
    setCustomPrice(card.estimated_price?.toString() || '10.00');
    setCounterCardsText('');
    setCounterNotes('');
    setModalError('');
  };

  // Confirmar y guardar la carta seleccionada
  const handleConfirmSelected = async (e) => {
    e.preventDefault();
    if (!selectedCard) return;

    const price = parseFloat(customPrice);
    if (isNaN(price) || price <= 0) {
      setModalError('El precio debe ser un número válido mayor a 0.');
      return;
    }

    setSubmitting(true);
    setModalError('');
    try {
      const payload = {
        name: selectedCard.name,
        set_name: selectedCard.set_name,
        rarity: selectedCard.rarity || 'Rare',
        type: selectedCard.type || 'Colorless',
        estimated_price: price,
        image_url: selectedCard.image_url,
        counter_cards: counterCardsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        counter_notes: counterNotes.trim(),
      };

      const created = await api.createCard(payload);
      onCardCreated(created);
      handleClose();
    } catch (err) {
      setModalError(`Error al guardar carta: ${err.message}`);
      onError(`Error al guardar carta: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Guardar formulario manual
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const price = parseFloat(manualForm.estimated_price);
    if (isNaN(price) || price <= 0) {
      setModalError('El precio estimado debe ser un número mayor a 0.');
      return;
    }

    setSubmitting(true);
    setModalError('');
    try {
      const payload = {
        name: manualForm.name.trim(),
        set_name: manualForm.set_name.trim(),
        rarity: manualForm.rarity,
        type: manualForm.type,
        estimated_price: price,
        counter_cards: manualForm.counter_cards_text
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        counter_notes: manualForm.counter_notes.trim(),
      };

      const created = await api.createCard(payload);
      onCardCreated(created);
      handleClose();
    } catch (err) {
      setModalError(`No se pudo guardar la carta: ${err.message}`);
      onError(`No se pudo guardar la carta: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border-2 border-[#134074]/20 max-h-[90vh] flex flex-col">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="pokemon-subtitle-dark text-lg sm:text-xl">
              {mode === 'search' ? 'Buscar y Agregar Carta' : 'Agregar Carta Manualmente'}
            </h3>
            <p className="text-xs text-slate-500">
              {mode === 'search'
                ? 'Buscá por nombre para autocompletar imagen, rareza y precio de mercado'
                : 'Ingresá todos los datos de la carta manualmente'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensaje de error interno */}
        {modalError && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border-l-4 border-[#DC2626] text-red-800 text-xs font-medium shrink-0">
            {modalError}
          </div>
        )}

        {/* Cuerpo del Modal con scroll si es necesario */}
        <div className="flex-1 overflow-y-auto py-4">
          {mode === 'search' ? (
            <div className="space-y-4">
              {/* Barra de Búsqueda */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#134074] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ej: Pikachu, Charizard ex, Mewtwo, Gengar..."
                    className="w-full pl-10 pr-3 py-2.5 text-xs bg-[#F0F4F8] border border-slate-200 rounded-xl focus:outline-none focus:border-[#134074] focus:bg-white transition"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#0B2545] bg-[#FFCB05] hover:bg-[#ffd633] rounded-xl transition cursor-pointer shadow-xs border-b-2 border-[#B48A00] disabled:opacity-50 shrink-0"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      Buscar
                    </>
                  )}
                </button>
              </form>

              {/* Si todavía no se seleccionó ninguna carta */}
              {!selectedCard && (
                <>
                  {isSearching && (
                    <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#134074]" />
                      <span>Consultando base oficial de Pokémon TCG...</span>
                    </div>
                  )}

                  {!isSearching && hasSearched && searchResults.length === 0 && (
                    <div className="py-10 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4">
                      <p className="font-semibold text-slate-700 mb-1">No se encontraron cartas con ese nombre.</p>
                      <p>Probá con otro término (ej: sin "ex" o en inglés) o cargala manualmente.</p>
                    </div>
                  )}

                  {!isSearching && searchResults.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-[#0B2545] mb-2.5">
                        Seleccioná la versión de tu carta ({searchResults.length} encontradas):
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                        {searchResults.map((card, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSelectCard(card)}
                            className="p-3 bg-white border-2 border-slate-200 hover:border-[#FFCB05] hover:shadow-md rounded-xl transition cursor-pointer flex flex-col items-center text-center group"
                          >
                            <img
                              src={card.image_url || DEFAULT_CARD_BACK}
                              alt={card.name}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = DEFAULT_CARD_BACK;
                              }}
                              className="w-24 h-32 object-contain rounded-md mb-2 group-hover:scale-105 transition-transform duration-150"
                            />
                            <p className="text-xs font-bold text-[#0B2545] line-clamp-1 w-full">
                              {card.name}
                            </p>
                            <p className="text-[10px] text-slate-400 line-clamp-1 mb-1.5">
                              {card.set_name}
                            </p>
                            <div className="mt-auto w-full flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100">
                              <span className="font-semibold text-[#134074] px-1.5 py-0.5 bg-[#134074]/10 rounded">
                                {card.type}
                              </span>
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                ${card.estimated_price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Si ya seleccionó una carta: Mostrar formulario de confirmación con datos autocompletados */}
              {selectedCard && (
                <form onSubmit={handleConfirmSelected} className="space-y-4">
                  {/* Tarjeta de previsualización seleccionada */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#0B2545]/5 via-[#134074]/5 to-transparent border-2 border-[#FFCB05] flex items-center gap-4">
                    <img
                      src={selectedCard.image_url || DEFAULT_CARD_BACK}
                      alt={selectedCard.name}
                      className="w-18 h-24 object-contain rounded-md shadow-md shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#134074] text-[#FFCB05]">
                          {selectedCard.type} • {selectedCard.rarity}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Sugerido: ${selectedCard.estimated_price.toFixed(2)}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#0B2545] mt-1 truncate">
                        {selectedCard.name}
                      </h4>
                      <p className="text-xs text-slate-500">{selectedCard.set_name}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCard(null)}
                      className="inline-flex items-center gap-1 text-xs text-[#134074] hover:underline font-semibold shrink-0 cursor-pointer p-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Cambiar
                    </button>
                  </div>

                  {/* Campos ajustables */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Precio estimado (USD) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#F0F4F8] border border-slate-200 rounded-xl focus:outline-none focus:border-[#134074]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Counters recomendados (opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Blastoise ex, Starmie ex..."
                        value={counterCardsText}
                        onChange={(e) => setCounterCardsText(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#F0F4F8] border border-slate-200 rounded-xl focus:outline-none focus:border-[#134074]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Notas estratégicas (opcional)
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Debilidades o recomendaciones de juego..."
                      value={counterNotes}
                      onChange={(e) => setCounterNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#F0F4F8] border border-slate-200 rounded-xl focus:outline-none focus:border-[#134074]"
                    />
                  </div>

                  {/* Botones de acción */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedCard(null)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                    >
                      Volver a la lista
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-[#0B2545] bg-[#FFCB05] hover:bg-[#ffd633] rounded-xl transition cursor-pointer shadow-sm border-b-2 border-[#B48A00] disabled:opacity-50"
                      >
                        <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                        {submitting ? 'Guardando...' : 'Confirmar y Guardar'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Modo Manual */
            <form onSubmit={handleManualSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre de la Carta *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pikachu ex"
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F0F4F8] border border-slate-200 rounded-xl focus:outline-none focus:border-[#134074]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expansión / Set *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Surging Sparks"
                    value={manualForm.set_name}
                    onChange={(e) => setManualForm({ ...manualForm, set_name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F0F4F8] border border-slate-200 rounded-xl focus:outline-none focus:border-[#134074]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Precio (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="Ej: 65.00"
                    value={manualForm.estimated_price}
                    onChange={(e) => setManualForm({ ...manualForm, estimated_price: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F0F4F8] border border-slate-200 rounded-xl focus:outline-none focus:border-[#134074]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rareza</label>
                  <select
                    value={manualForm.rarity}
                    onChange={(e) => setManualForm({ ...manualForm, rarity: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F0F4F8] border border-slate-200 rounded-xl focus:outline-none focus:border-[#134074]"
                  >
                    <option value="Common">Common</option>
                    <option value="Rare">Rare</option>
                    <option value="Ultra Rare">Ultra Rare</option>
                    <option value="Secret Rare">Secret Rare</option>
                    <option value="Special Illustration Rare">Special Illustration Rare</option>
                    <option value="Hyper Rare">Hyper Rare</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo</label>
                  <select
                    value={manualForm.type}
                    onChange={(e) => setManualForm({ ...manualForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F0F4F8] border border-slate-200 rounded-xl focus:outline-none focus:border-[#134074]"
                  >
                    <option value="Fire">Fire</option>
                    <option value="Water">Water</option>
                    <option value="Grass">Grass</option>
                    <option value="Lightning">Lightning</option>
                    <option value="Psychic">Psychic</option>
                    <option value="Fighting">Fighting</option>
                    <option value="Darkness">Darkness</option>
                    <option value="Metal">Metal</option>
                    <option value="Dragon">Dragon</option>
                    <option value="Colorless">Colorless</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cartas Counter (separadas por coma)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Bloodmoon Ursaluna ex, Sandy Shocks"
                  value={manualForm.counter_cards_text}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, counter_cards_text: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F0F4F8] border border-slate-200 rounded-xl focus:outline-none focus:border-[#134074]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notas estratégicas</label>
                <textarea
                  rows="2"
                  placeholder="Debilidades o estrategia recomendada..."
                  value={manualForm.counter_notes}
                  onChange={(e) => setManualForm({ ...manualForm, counter_notes: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F0F4F8] border border-slate-200 rounded-xl focus:outline-none focus:border-[#134074]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#0B2545] bg-[#FFCB05] hover:bg-[#ffd633] rounded-xl cursor-pointer border-b-2 border-[#B48A00] disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                  {submitting ? 'Guardando...' : 'Guardar Carta'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Pie del Modal con alternancia de modos */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          {mode === 'search' ? (
            <button
              type="button"
              onClick={() => {
                setMode('manual');
                setModalError('');
              }}
              className="text-[#134074] hover:underline font-semibold cursor-pointer"
            >
              ¿No encontrás la carta? Cargarla manualmente
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode('search');
                setModalError('');
              }}
              className="text-[#134074] hover:underline font-semibold cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver al buscador automático
            </button>
          )}

          <span className="text-[11px] text-slate-400">
            Pokémon TCG Vault • v2
          </span>
        </div>
      </div>
    </div>
  );
}
