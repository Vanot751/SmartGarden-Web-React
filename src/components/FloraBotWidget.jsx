import React, { useState, useRef, useEffect } from 'react';
import { 
  Sprout, 
  Send, 
  X, 
  RotateCcw, 
  Sparkles, 
  Bot, 
  ChevronDown,
  User,
  AlertCircle
} from 'lucide-react';
import { marked } from 'marked';
import api from '../api/axiosConfig';
import { useTheme } from '../context/ThemeContext';

// Configuración de Marked para formato botánico impecable
marked.setOptions({
  breaks: true,
  gfm: true
});

const QUICK_CHIPS = [
  "¿Cómo está mi planta ahora mismo?",
  "¿Por qué amarillean las hojas?",
  "¿Cómo dosificar el riego de mi planta?",
  "Plagas comunes y remedios orgánicos",
  "Condiciones de luz y temperatura ideales"
];

function formatMarkdown(text) {
  if (!text) return '';
  try {
    let html = marked.parse(text);
    // Envolver tablas en contenedor con scroll y estilo equilibrado
    html = html.replace(/<table/g, '<div class="overflow-x-auto my-2 rounded-xl border border-inherit/20"><table class="w-full text-[11.5px] border-collapse min-w-[300px]"');
    html = html.replace(/<\/table>/g, '</table></div>');
    html = html.replace(/<th/g, '<th class="px-2.5 py-1.5 bg-[#2ECC71]/15 text-[#2ECC71] font-bold text-left whitespace-nowrap text-[11.5px]"');
    html = html.replace(/<td/g, '<td class="px-2.5 py-1.5 border-t border-inherit/15 align-top text-[11.5px] leading-snug"');

    // Escalar títulos equilibrados para el chat
    html = html.replace(/<h1/g, '<h4 class="text-[13.5px] font-bold text-[#2ECC71] mt-2.5 mb-1"');
    html = html.replace(/<\/h1>/g, '</h4>');
    html = html.replace(/<h2/g, '<h4 class="text-[13.5px] font-bold text-[#2ECC71] mt-2.5 mb-1"');
    html = html.replace(/<\/h2>/g, '</h4>');
    html = html.replace(/<h3/g, '<h5 class="text-[12.5px] font-bold text-[#2ECC71] mt-2 mb-0.5"');
    html = html.replace(/<\/h3>/g, '</h5>');
    html = html.replace(/<h4/g, '<h5 class="text-[12.5px] font-bold text-[#2ECC71] mt-2 mb-0.5"');
    html = html.replace(/<\/h4>/g, '</h5>');

    // Párrafos y listas con lectura cómoda
    html = html.replace(/<p>/g, '<p class="my-1.5 text-[12.5px] leading-relaxed">');
    html = html.replace(/<ul>/g, '<ul class="my-1.5 pl-4 list-disc space-y-1 text-[12.5px]">');
    html = html.replace(/<ol>/g, '<ol class="my-1.5 pl-4 list-decimal space-y-1 text-[12.5px]">');
    html = html.replace(/<li>/g, '<li class="text-[12.5px] leading-relaxed">');
    return html;
  } catch (e) {
    return text;
  }
}

export default function FloraBotWidget({ activePlant, activeTelemetry }) {
  const { isOled } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy **FloraBot**, tu asesor botánico inteligente. 🌿\n\nPuedo responder cualquier duda sobre riego, salud de hojas, control orgánico de plagas y condiciones óptimas para tus plantas.\n\n¿En qué te puedo asesorar hoy?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isThinking) return;

    const userTurn = { role: 'user', content: text };
    const newHistory = [...messages, userTurn];
    setMessages(newHistory);
    setInputMessage('');
    setIsThinking(true);

    // Preparar contexto botánico de la planta actualmente monitoreada
    const plantContext = activePlant ? {
      name: activePlant.name || activePlant.nickname,
      scientific_name: activePlant.scientific_name,
      temp_min: activePlant.temp_min,
      temp_max: activePlant.temp_max,
      humedad_min: activePlant.humedad_min,
      dosis_riego_ml: activePlant.dosis_riego_ml,
      soil_moisture: activeTelemetry?.moisture ?? activeTelemetry?.soil_moisture,
      temperature: activeTelemetry?.temperature,
      humidity: activeTelemetry?.humidity,
      light_lux: activeTelemetry?.light ?? activeTelemetry?.light_lux
    } : null;

    try {
      const formattedHistory = newHistory.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.post('/api/chat/', {
        message: text,
        history: formattedHistory,
        plant_context: plantContext
      });

      if (res.data?.response) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: res.data.response
        }]);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      console.error('Error al consultar FloraBot:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ No pude conectar con el servicio botánico en este momento. Por favor verifica que el backend esté en ejecución e inténtalo nuevamente.'
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Conversación reiniciada. ¿Sobre qué planta o cuidado te gustaría consultar ahora? 🌱'
      }
    ]);
  };

  // Clases dependientes del tema visual
  const modalBg = isOled ? 'bg-[#121212] border-[#2A2A2A]' : 'bg-[#FAF9F5] border-[#E2E8F0]';
  const headerBg = isOled ? 'bg-[#181818] border-[#262626]' : 'bg-white border-[#E6E4DC]';
  const chatAreaBg = isOled ? 'bg-[#0E0E0E]' : 'bg-[#F4F3ED]';
  const userBubbleBg = isOled ? 'bg-[#1F2937] text-white border-[#374151]' : 'bg-[#2ECC71] text-white';
  const botBubbleBg = isOled ? 'bg-[#1A1A1A] text-[#E0E0E0] border-[#2C2C2C]' : 'bg-white text-[#2D3748] border-[#E2E8F0]';
  const inputBg = isOled ? 'bg-[#161616] border-[#333333] text-white placeholder-[#777]' : 'bg-white border-[#CBD5E1] text-[#1E293B] placeholder-[#94A3B8]';

  const subtitleText = activePlant?.name ? `Asesorando: ${activePlant.name}` : 'Asesor Botánico Inteligente';

  return (
    <>
      {/* Botón Flotante (FAB) */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Abrir asistente botánico inteligente FloraBot"
            className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-[#2ECC71] to-[#27AE60] text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            <div className="relative">
              <Sprout className="w-5 h-5 text-white transition-transform duration-300 group-hover:rotate-12" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            </div>
            <span className="font-semibold text-xs tracking-wide">FloraBot IA</span>

            {unreadCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-amber-400 text-stone-900 text-[10px] font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Ventana de Chat Flotante Mejorada y Más Amplia */}
      {isOpen && (
        <aside
          role="dialog"
          aria-label="Panel de Asistente Botánico Inteligente FloraBot"
          className={`fixed bottom-6 right-6 z-50 w-[450px] max-w-[calc(100vw-1.5rem)] h-[620px] max-h-[calc(100vh-4rem)] ${modalBg} border rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5`}
        >
          {/* Cabecera */}
          <div className={`p-4 border-b ${headerBg} flex items-center justify-between`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#2ECC71] to-[#27AE60] flex items-center justify-center text-white shadow-md shrink-0">
                <Sprout className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-bold tracking-tight ${isOled ? 'text-white' : 'text-[#1E293B]'}`}>
                    FloraBot
                  </h3>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#2ECC71]/15 text-[#2ECC71]">
                    En línea
                  </span>
                </div>
                <p 
                  title={subtitleText}
                  className={`text-[11px] truncate max-w-[250px] ${isOled ? 'text-[#888]' : 'text-[#64748B]'}`}
                >
                  {subtitleText}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleResetChat}
                title="Reiniciar chat"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isOled ? 'text-[#888] hover:text-white hover:bg-[#222]' : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#E2E8F0]'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Cerrar"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isOled ? 'text-[#888] hover:text-white hover:bg-[#222]' : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#E2E8F0]'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Área de Mensajes */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-3.5 ${chatAreaBg}`}>
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div 
                  key={index} 
                  className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-xl bg-[#2ECC71]/15 text-[#2ECC71] flex items-center justify-center shrink-0 mt-0.5">
                      <Sprout className="w-4 h-4" />
                    </div>
                  )}

                  <div 
                    className={`max-w-[94%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed border shadow-xs ${
                      isUser 
                        ? `${userBubbleBg} rounded-tr-none border-transparent` 
                        : `${botBubbleBg} rounded-tl-none`
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed">{msg.content}</p>
                    ) : (
                      <div 
                        className="prose prose-xs max-w-none break-words text-[12.5px] leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {isThinking && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#2ECC71]/15 text-[#2ECC71] flex items-center justify-center shrink-0">
                  <Sprout className="w-4 h-4 animate-spin text-[#2ECC71]" />
                </div>
                <div className={`px-4 py-2.5 rounded-2xl rounded-tl-none border ${botBubbleBg} flex items-center gap-1.5`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  <span className={`text-[11px] ml-1.5 ${isOled ? 'text-[#888]' : 'text-[#64748B]'}`}>
                    Consultando con FloraBot...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chips de Consultas Rápidas Sugeridas */}
          {messages.length <= 2 && !isThinking && (
            <div className={`px-3 py-2 border-t ${headerBg} flex items-center gap-1.5 overflow-x-auto no-scrollbar`}>
              {QUICK_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    isOled 
                      ? 'bg-[#1C1C1C] border-[#333] text-[#CCC] hover:border-[#2ECC71] hover:text-[#2ECC71]' 
                      : 'bg-white border-[#E2E8F0] text-[#475569] hover:border-[#2ECC71] hover:text-[#2ECC71]'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Barra de Entrada de Texto */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className={`p-3 border-t ${headerBg} flex items-center gap-2`}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Consulta sobre riego, plagas, hojas..."
              disabled={isThinking}
              className={`flex-1 text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2ECC71]/40 transition-all ${inputBg}`}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isThinking}
              aria-label="Enviar mensaje"
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#2ECC71] to-[#27AE60] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
