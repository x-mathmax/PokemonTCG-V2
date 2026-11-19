import { useState } from 'react';
import { DollarSign, Layers, Trophy, Mail, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function ValuationHeader({ valuation, onError }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sentMessage, setSentMessage] = useState('');

  const handleSendReport = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setSentMessage('');
    try {
      const res = await api.triggerReport(email);
      setSentMessage(res.message || 'Reporte enviado correctamente');
      setEmail('');
      setTimeout(() => setSentMessage(''), 4000);
    } catch (err) {
      onError(`Error al enviar reporte: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-[#134074]/15 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          <div className="bg-[#F0F4F8] p-4 rounded-xl border border-[#134074]/10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#134074] text-[#FFCB05] shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Valuación Total</p>
              <p className="text-xl font-bold text-[#0B2545]">
                ${valuation?.total_valuation_usd?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>

          <div className="bg-[#F0F4F8] p-4 rounded-xl border border-[#134074]/10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#134074] text-[#FFCB05] shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Cartas</p>
              <p className="text-xl font-bold text-[#0B2545]">
                {valuation?.total_cards || 0}
              </p>
            </div>
          </div>

          <div className="bg-[#F0F4F8] p-4 rounded-xl border border-[#134074]/10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFCB05] text-[#0B2545] shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-medium">Carta Top</p>
              <p className="text-sm font-bold text-[#0B2545] truncate">
                {valuation?.most_expensive_card
                  ? `${valuation.most_expensive_card.name} ($${valuation.most_expensive_card.estimated_price})`
                  : 'Sin datos'}
              </p>
            </div>
          </div>
        </div>

        {/* Disparador de Reporte n8n */}
        <div className="flex flex-col sm:items-end shrink-0">
          <form onSubmit={handleSendReport} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <Mail className="w-4 h-4 text-[#134074] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com para reporte..."
                className="pl-9 pr-3 py-2.5 text-xs bg-[#F0F4F8] border border-slate-200 rounded-xl focus:outline-none focus:border-[#134074] w-full sm:w-60"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#DC2626] hover:bg-[#b91c1c] rounded-xl transition cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              {sending ? 'Enviando...' : 'Reporte Email'}
            </button>
          </form>

          {sentMessage && (
            <div className="mt-2.5 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 shadow-xs self-stretch sm:self-end">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{sentMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}