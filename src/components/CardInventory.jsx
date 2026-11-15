import { Search } from 'lucide-react';
import PokemonCardItem from './PokemonCardItem';

const RARITIES = ['Hyper Rare', 'Special Illustration Rare', 'Secret Rare', 'Ultra Rare', 'Rare', 'Common'];
const TYPES = ['Fire', 'Water', 'Grass', 'Lightning', 'Psychic', 'Fighting', 'Darkness', 'Metal', 'Dragon', 'Colorless'];

export default function CardInventory({
  cards,
  loading,
  rarityFilter,
  typeFilter,
  onRarityChange,
  onTypeChange,
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E3B6B9]/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="pokemon-subtitle-dark text-xl">Inventario de Cartas</h2>
          <p className="text-xs text-slate-500">Consultá valuación, ilustraciones oficiales y debilidades</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          <select
            value={rarityFilter}
            onChange={(e) => onRarityChange(e.target.value)}
            className="text-xs bg-[#FAF8F9] border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#E3B6B9]"
          >
            <option value="">Todas las rarezas</option>
            {RARITIES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
            className="text-xs bg-[#FAF8F9] border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#E3B6B9]"
          >
            <option value="">Todos los tipos</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Cargando cartas desde FastAPI...</div>
      ) : cards.length === 0 ? (
        <div className="py-12 text-center">
          <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No se encontraron cartas con esos filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map((card) => (
            <PokemonCardItem key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}