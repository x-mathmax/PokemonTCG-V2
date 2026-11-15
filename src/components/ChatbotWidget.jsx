import { useState } from 'react';
import { Bot, Send, User, Sparkles, X, MessageSquareText } from 'lucide-react';
import { api } from '../services/api';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: '¡Hola! Soy tu asistente de estrategia Pokémon TCG. Preguntame qué mazo o carta querés frenar y te sugiero los mejores counters.',
      counters: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await api.sendChatQuery(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply,
          counters: data.suggested_counters || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `No pude conectarme con el motor de IA (${err.message}). Verificá que el backend esté corriendo.`,
          counters: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Ventana Flotante del Chat */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-3rem)] sm:w-96 h-[500px] max-h-[75vh] bg-white rounded-2xl shadow-2xl border-2 border-[#134074]/30 flex flex-col overflow-hidden">
          {/* Header del Chat (Azul Marino + Borde Amarillo) */}
          <div className="p-4 bg-gradient-to-r from-[#0B2545] to-[#134074] border-b-4 border-[#FFCB05] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FFCB05] text-[#0B2545] shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-pokemon text-base text-[#FFCB05] leading-tight tracking-wide">
                  AI COUNTER STRATEGIST
                </h2>
                <p className="text-[11px] text-blue-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FFCB05]" /> Conectado a n8n + IA
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              title="Cerrar chat"
              className="p-1.5 text-blue-200 hover:text-[#FFCB05] hover:bg-white/10 rounded-lg transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Historial de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F0F4F8]/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                    msg.role === 'user'
                      ? 'bg-[#0B2545] text-[#FFCB05]'
                      : 'bg-[#FFCB05] text-[#0B2545]'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                    msg.role === 'user'
                      ? 'bg-[#134074] text-white rounded-tr-xs'
                      : 'bg-white text-slate-700 border border-[#134074]/15 rounded-tl-xs'
                  }`}
                >
                  <p>{msg.text}</p>

                  {msg.counters?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200/80">
                      <span className="block text-[10px] font-bold text-[#134074] mb-1">
                        Counters sugeridos:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {msg.counters.map((c, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold bg-[#F0F4F8] border border-[#134074]/20 text-[#0B2545] px-2 py-0.5 rounded-md"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-xs text-[#134074] font-medium italic pl-9">
                Analizando estrategias y counters...
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej: ¿Cómo le gano a Charizard ex?"
              className="flex-1 text-xs bg-[#F0F4F8] border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#134074]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-[#FFCB05] hover:bg-[#ffd633] text-[#0B2545] font-bold rounded-xl transition cursor-pointer disabled:opacity-50 border-b-2 border-[#B48A00]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Botón Flotante (FAB estilo Pokébola Rojo + Borde Azul Marino) */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-[#DC2626] hover:bg-[#b91c1c] text-white font-bold text-xs shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-[#0B2545]"
      >
        {isOpen ? (
          <>
            <X className="w-5 h-5 text-[#FFCB05]" />
            <span>Cerrar Asistente</span>
          </>
        ) : (
          <>
            <div className="relative">
              <MessageSquareText className="w-5 h-5 text-[#FFCB05]" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FFCB05] animate-ping" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FFCB05]" />
            </div>
            <span>Consultar Counters IA</span>
          </>
        )}
      </button>
    </div>
  );
}