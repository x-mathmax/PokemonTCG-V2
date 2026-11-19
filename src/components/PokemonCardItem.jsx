import { useState } from 'react';
import { ShieldAlert, Sparkles, Trash2, AlertTriangle } from 'lucide-react';

const DEFAULT_CARD_BACK = 'https://d1i787aglh9bmb.cloudfront.net/assets/img/global/tcg-card-back.jpg';

export default function PokemonCardItem({ card, onDelete }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const imageSrc = card.image_url || DEFAULT_CARD_BACK;

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(card.id, card.name);
      }
      setIsConfirmOpen(false);
    } catch {
      // Si ocurre un error, el padre lo maneja
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="p-5 rounded-2xl bg-white border-2 border-[#134074]/15 hover:border-[#FFCB05] hover:shadow-lg transition flex flex-col justify-between relative group">
        <div>
          {/* Contenedor superior con degradado azul estilo reverso */}
          <div className="relative flex justify-center items-center py-4 mb-4 bg-gradient-to-b from-[#0B2545] to-[#134074] rounded-xl shadow-inner">
            {/* Cestito para eliminar */}
            <button
              type="button"
              onClick={() => setIsConfirmOpen(true)}
              title="Eliminar carta"
              className="absolute top-2.5 left-2.5 p-1.5 rounded-lg bg-black/40 hover:bg-[#DC2626] text-white/80 hover:text-white transition shadow-sm cursor-pointer z-10"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <img
              src={imageSrc}
              alt={card.name}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_CARD_BACK;
              }}
              className="w-40 h-auto rounded-lg shadow-md hover:scale-105 transition-transform duration-200 object-contain"
            />
            <span className="absolute top-2.5 right-2.5 text-xs font-bold text-[#0B2545] bg-[#FFCB05] px-2.5 py-1 rounded-lg shadow-sm">
              ${card.estimated_price.toFixed(2)}
            </span>
          </div>

          {/* Información de la carta */}
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#134074]/10 text-[#134074] mb-1.5">
              {card.type} • {card.rarity}
            </span>
            <h3 className="text-base font-bold text-[#0B2545]">{card.name}</h3>
            <p className="text-xs text-slate-400">{card.set_name}</p>

            {card.counter_notes && (
              <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                {card.counter_notes}
              </p>
            )}
          </div>
        </div>

        {/* Counters y alerta */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          {card.counter_cards?.length > 0 && (
            <>
              <p className="text-[11px] font-semibold text-[#134074] flex items-center gap-1 mb-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#DC2626]" />
                Counters recomendados:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {card.counter_cards.map((counter, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium bg-[#F0F4F8] border border-[#134074]/15 text-[#0B2545] px-2.5 py-0.5 rounded-md"
                  >
                    {counter}
                  </span>
                ))}
              </div>
            </>
          )}

          {card.estimated_price >= 50 && (
            <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-amber-700">
              <Sparkles className="w-3 h-3 text-[#FFCB05] fill-[#FFCB05]" />
              <span>Carta de alto valor (dispara alerta Telegram)</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal / Toast de Confirmación de Eliminación */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border-2 border-red-100 text-center animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-full bg-red-50 text-[#DC2626] flex items-center justify-center mx-auto mb-3 border border-red-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#0B2545] mb-1">{card.name}</h4>
            <p className="text-xs text-slate-400 mb-3">{card.set_name}</p>
            <p className="text-xs font-semibold text-slate-700 mb-5 leading-relaxed">
              ¿Está seguro de que desea eliminar esta carta de su colección?
            </p>
            <div className="flex gap-2.5 justify-center">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-[#DC2626] hover:bg-[#b91c1c] rounded-xl transition cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
