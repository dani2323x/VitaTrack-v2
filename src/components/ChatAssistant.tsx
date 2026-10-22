import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import {
  Send,
  Sparkles,
  Bot,
  User,
  HeartHandshake,
  Loader2,
  Volume2,
  VolumeX,
  Compass,
  AlertTriangle,
  Zap,
} from 'lucide-react';

import { DayLog } from '../types';
import { addCustomHabit } from '../utils/storage';
import confetti from 'canvas-confetti';

interface ChatAssistantProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  onOpenSOSModal?: () => void;
  latestLog?: DayLog | null;
  onUpdateLog?: (updatedLog: DayLog) => void;
}

const PRESET_QUESTIONS = [
  '➕ Añade el hábito: Caminata 20 min',
  '✏️ Modifica cafeína por té de manzanilla',
  '🗑️ Borra el hábito azúcar ultraprocesada',
  '⭐ Quiero definir un nuevo hábito diario: Tomar creatina 5g',
  '🚨 SOS: Tengo un antojo incontrolable de dulce',
  '🚨 SOS: Quiero procrastinar y tengo resistencia a empezar',
];

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  initialPrompt,
  onClearInitialPrompt,
  onOpenSOSModal,
  latestLog,
  onUpdateLog,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '¡Hola! Soy **VitaTrack Engine v3.0**, tu sistema de inteligencia conductual y biohacking accesible. \n\nPuedes ingresar tus hábitos, consultar sobre neurobiología de la dopamina, pedirme un análisis de fricción, modificar tu registro actual (ej: *"Añade el hábito: ...", "Modifica [X] por [Y]", "Borra el hábito [X]"*) o escribir **"SOS"** para activar el protocolo D.O.S.A.',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt) {
      sendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    // Check if user is typing SOS to optionally open interactive modal
    if (trimmed.toUpperCase() === 'SOS' && onOpenSOSModal) {
      onOpenSOSModal();
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // 1. RECURRENT HABIT CREATION DETECTION (James Clear / B.J. Fogg)
    const recurrentMatch = trimmed.match(/(?:quiero\s+definir\s+un\s+nuevo\s+h[áa]bito\s+diario|definir\s+h[áa]bito\s+diario|nuevo\s+h[áa]bito\s+recurrente)[:\s]+(.+)/i);
    if (recurrentMatch && recurrentMatch[1]) {
      const habitName = recurrentMatch[1].trim().replace(/^["']|["']$/g, '');
      addCustomHabit(habitName, 'healthy');
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: `🎯 **HÁBITO PERSONALIZADO REGISTRADO EN TU PERFIL**

• **Hábito añadido:** *"${habitName}"*
• **Monitoreo conductual:** Ha sido guardado en tus hábitos diarios recurrentes.
• **Regla de recordatorio:** Si en tu registro de hoy no mencionas este hábito, VitaTrack te preguntará al final del día:
  *"¿Cumpliste hoy con tu hábito personalizado: ${habitName}?"*`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
      return;
    }

    // 2. HABIT EDIT / ADD / DELETE COMMANDS (Módulo de Edición)
    const isEditCommand = /(?:a[ñn]ade\s+el\s+h[áa]bito|registra\s+tambi[ée]n\s+que|suma\s+.+\s+a\s+mis\s+h[áa]bitos|modifica\s+.+\s+por|en\s+lugar\s+de\s+.+\s+hice|ajusta\s+la\s+cantidad|borra\s+el\s+h[áa]bito|elimina\s+.+\s+de\s+mi\s+registro)/i.test(trimmed);

    if (isEditCommand && latestLog) {
      try {
        const res = await fetch('/api/edit-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'nl_command',
            commandText: trimmed,
            currentLog: latestLog,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (onUpdateLog && data.updatedLog) {
            onUpdateLog(data.updatedLog);
          }

          if (data.vitalityScoreChange > 0) {
            confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
          }

          const botMessage: ChatMessage = {
            id: `bot-${Date.now()}`,
            role: 'assistant',
            content: data.rawConfirmation,
            timestamp: Date.now(),
            updatedLog: data.updatedLog,
          };
          setMessages((prev) => [...prev, botMessage]);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Fallback to standard chat endpoint:', err);
      }
    }

    // 3. STANDARD CHAT WITH VITATRACK ENGINE V3.0
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error('Error al conectar con VitaTrack Engine.');
      }

      const data = await res.json();
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          'Error momentáneo de comunicación. Recuerda: cada obstáculo es un experimento científico del que aprender.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const playTTS = (msgId: string, text: string) => {
    if (playingId === msgId) {
      window.speechSynthesis?.cancel();
      setPlayingId(null);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleaned = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = 'es-ES';
      utterance.rate = 0.95;
      utterance.onend = () => setPlayingId(null);
      utterance.onerror = () => setPlayingId(null);
      setPlayingId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col h-[75vh] max-h-[800px] overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              <span>Diálogo con VitaTrack Engine v3.0</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Huberman & Clear
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Psicología de identidad, rediseño de entorno y regulación dopaminérgica
            </p>
          </div>
        </div>

        {onOpenSOSModal && (
          <button
            onClick={onOpenSOSModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>SOS D.O.S.A.</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                  isUser
                    ? 'bg-slate-700'
                    : 'bg-gradient-to-tr from-slate-900 to-emerald-800 shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-emerald-400" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-slate-50 text-slate-900 border border-slate-200/80 rounded-tl-none space-y-2'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{m.content}</div>

                {!isUser && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>VitaTrack Engine</span>
                    <button
                      onClick={() => playTTS(m.id, m.content)}
                      className="hover:text-emerald-700 flex items-center gap-1 transition-colors"
                      title="Escuchar audio"
                    >
                      {playingId === m.id ? (
                        <>
                          <VolumeX className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-medium">Detener</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Escuchar</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs">
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>VitaTrack Engine v3.0 analizando dimensiones conductuales...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-[11px] font-semibold text-slate-400 shrink-0 uppercase tracking-wider">
          Comandos:
        </span>
        {PRESET_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(q)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-slate-200/70 border border-slate-200 text-slate-700 whitespace-nowrap transition-colors shrink-0 font-medium"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe 'SOS', 'Auditoría' o consulta sobre tus hábitos, fricción y dopamina..."
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 sm:px-5 sm:py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs sm:text-sm hover:bg-slate-800 transition-colors disabled:opacity-40 flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
