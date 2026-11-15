import { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { api } from '../services/api';

export default function AddCardModal({ isOpen, onClose, onCardCreated, onError }) {
  const [formData, setFormData] = useState({
    name: '',
    set_name: '',
    rarity: 'Rare',
    type: 'Fire',
    estimated_price: '',
    counter_cards_text: '',
    counter_notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const price = parseFloat(formData.estimated_price);
    if (isNaN(price) || price <= 0) {
      onError('El precio estimado debe ser un número mayor a 0.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        set_name: formData.set_name.trim(),
        rarity: formData.rarity,
        type: formData.type,
        estimated_price: price,
        counter_cards: formData.counter_cards_text
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        counter_notes: formData.counter_notes.trim(),
      };

      const created = await api.createCard(payload);
      onCardCreated(created);
      setFormData({
        name: '',
        set_name: '',
        rarity: 'Rare',
        type: 'Fire',
        estimated_price: '',
        counter_cards_text: '',
        counter_notes: '',
      });
      onClose();
    } catch (err) {
      onError(`No se pudo guardar la carta: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E3B6B9]/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Agregar Nueva Carta</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-sm">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nombre de la Carta *</label>
            <input
              type="text"
              required
              placeholder="Ej: Pikachu ex"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF8F9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#E3B6B9]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Expansión / Set *</label>
              <input
                type="text"
                required
                placeholder="Ej: Surging Sparks"
                value={formData.set_name}
                onChange={(e) => setFormData({ ...formData, set_name: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#E3B6B9]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Precio (USD) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="Ej: 65.00"
                value={formData.estimated_price}
                onChange={(e) => setFormData({ ...formData, estimated_price: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#E3B6B9]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Rareza</label>
              <select
                value={formData.rarity}
                onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#E3B6B9]"
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#E3B6B9]"
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
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Cartas Counter (separadas por coma)
            </label>
            <input
              type="text"
              placeholder="Ej: Bloodmoon Ursaluna ex, Sandy Shocks"
              value={formData.counter_cards_text}
              onChange={(e) => setFormData({ ...formData, counter_cards_text: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF8F9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#E3B6B9]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notas estratégicas</label>
            <textarea
              rows="2"
              placeholder="Debilidades o estrategia recomendada..."
              value={formData.counter_notes}
              onChange={(e) => setFormData({ ...formData, counter_notes: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF8F9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#E3B6B9]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 bg-[#E3B6B9] hover:bg-[#d8a3a7] rounded-xl cursor-pointer disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              {submitting ? 'Guardando...' : 'Guardar Carta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}