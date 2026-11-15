import { ShieldAlert, Sparkles } from 'lucide-react';

const DEFAULT_CARD_BACK = 'https://d1i787aglh9bmb.cloudfront.net/assets/img/global/tcg-card-back.jpg';

export default function PokemonCardItem({ card }) {
  const imageSrc = card.image_url || DEFAULT_CARD_BACK;

  return (
    <div className="p-5 rounded-2xl bg-white border-2 border-[#134074]/15 hover:border-[#FFCB05] hover:shadow-lg transition flex flex-col justify-between">
      <div>
        {/* Contenedor superior con degradado azul estilo reverso */}
        <div className="relative flex justify-center items-center py-4 mb-4 bg-gradient-to-b from-[#0B2545] to-[#134074] rounded-xl shadow-inner">
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
  );
}