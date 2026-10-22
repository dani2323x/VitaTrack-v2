import React, { useState, useRef } from 'react';
import { PRESET_HABITS, SAMPLE_DAYS_TEXT } from '../data/presetHabits';
import { DayLog, CustomRecurrentHabit } from '../types';
import { getCustomHabits, addCustomHabit, removeCustomHabit } from '../utils/storage';
import {
  Mic,
  MicOff,
  Sparkles,
  Calendar,
  Loader2,
  Image as ImageIcon,
  X,
  AlertTriangle,
  UploadCloud,
  Layers,
  Zap,
  Plus,
  Trash2,
  Check,
  Star,
} from 'lucide-react';

interface DailyLoggerProps {
  onLogCreated: (log: DayLog) => void;
  onOpenSOSModal: () => void;
  onOpenLibraryModal?: () => void;
  onOpenChatWithPrompt?: (prompt: string) => void;
}

export const DailyLogger: React.FC<DailyLoggerProps> = ({
  onLogCreated,
  onOpenSOSModal,
  onOpenLibraryModal,
  onOpenChatWithPrompt,
}) => {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [journalText, setJournalText] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Custom Recurrent Habits (James Clear & Huberman)
  const [customHabits, setCustomHabits] = useState<CustomRecurrentHabit[]>(() => getCustomHabits());
  const [showAddRecurrent, setShowAddRecurrent] = useState(false);
  const [newRecurrentName, setNewRecurrentName] = useState('');
  const [newRecurrentCategory, setNewRecurrentCategory] = useState<'healthy' | 'unhealthy'>('healthy');

  // Image Upload state (MODO 4: Visión)
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageMimeType, setSelectedImageMimeType] = useState<string>('image/jpeg');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const loadSample = (index: number) => {
    const sample = SAMPLE_DAYS_TEXT[index];
    if (sample) {
      setJournalText(sample.text);
      setSelectedTagIds(sample.tags);
    }
  };

  // Image handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
      return;
    }

    setSelectedImageMimeType(file.type);
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setImagePreviewUrl(dataUrl);
      const base64Clean = dataUrl.split(',')[1];
      setSelectedImageBase64(base64Clean);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImageBase64(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Audio Recording & Dictation
  const startRecording = async () => {
    setErrorMsg(null);
    setRecordingStatus('Iniciando micrófono...');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setJournalText((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${currentTranscript.trim()}` : currentTranscript.trim();
          });
        };

        recognition.onerror = () => {
          fallbackMediaRecorder();
        };

        recognition.onend = () => {
          setIsRecording(false);
          setRecordingStatus(null);
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
        setIsRecording(true);
        setRecordingStatus('Escuchando tu voz... (habla con naturalidad)');
        return;
      } catch (err) {
        console.warn('SpeechRecognition fallback:', err);
      }
    }

    fallbackMediaRecorder();
  };

  const fallbackMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        setRecordingStatus('Transcribiendo audio con IA...');

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          try {
            const res = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                base64Audio: base64Data,
                mimeType: 'audio/webm',
              }),
            });
            const data = await res.json();
            if (data.text) {
              setJournalText((prev) =>
                prev ? `${prev.trim()}\n${data.text}` : data.text
              );
            }
          } catch (e) {
            console.error('Transcription error:', e);
            setErrorMsg('No se pudo transcribir el audio automáticamente.');
          } finally {
            setRecordingStatus(null);
            setIsRecording(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingStatus('Grabando nota de voz...');
    } catch (err) {
      console.error('Microphone error:', err);
      setErrorMsg('No se pudo acceder al micrófono. Por favor escribe tu registro.');
      setIsRecording(false);
      setRecordingStatus(null);
    }
  };

  const stopRecording = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleAddRecurrentHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecurrentName.trim()) return;
    const updated = addCustomHabit(newRecurrentName.trim(), newRecurrentCategory);
    setCustomHabits(updated);
    setNewRecurrentName('');
    setShowAddRecurrent(false);
  };

  const handleRemoveRecurrentHabit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeCustomHabit(id);
    setCustomHabits(updated);
    setSelectedTagIds((prev) => prev.filter((t) => t !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim() && selectedTagIds.length === 0 && !selectedImageBase64) {
      setErrorMsg('Por favor escribe sobre tu día, selecciona hábitos o adjunta una foto para analizar.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const activeTagsLabels = selectedTagIds.map((id) => {
      const found = PRESET_HABITS.find((p) => p.id === id);
      if (found) return `${found.icon} ${found.label}`;
      const foundCustom = customHabits.find((c) => c.id === id);
      if (foundCustom) return `⭐ ${foundCustom.name}`;
      return id;
    });

    try {
      const res = await fetch('/api/analyze-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journalText: journalText.trim(),
          tags: activeTagsLabels,
          date,
          base64Image: selectedImageBase64,
          mimeType: selectedImageMimeType,
          recurrentHabits: customHabits.map((h) => h.name),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Fallo al procesar el análisis');
      }

      const data = await res.json();

      const newLog: DayLog = {
        id: `log-${Date.now()}`,
        date,
        journalText: journalText.trim(),
        selectedTags: activeTagsLabels,
        imageDataUrl: imagePreviewUrl || undefined,
        rawMarkdown: data.rawMarkdown,
        structured: data.structured,
        microActionCompleted: false,
        createdAt: Date.now(),
      };

      onLogCreated(newLog);
      setJournalText('');
      setSelectedTagIds([]);
      removeImage();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al conectar con VitaTrack Engine v3.0.');
    } finally {
      setIsLoading(false);
    }
  };

  const healthyPresets = PRESET_HABITS.filter((p) => p.category === 'healthy');
  const unhealthyPresets = PRESET_HABITS.filter((p) => p.category === 'unhealthy');

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-6">
      {/* Top Banner with Engine Version and SOS Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Ingreso Conductual Diario
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Engine v3.0
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Evaluación de Fricción, Dopamina, Disparadores de Entorno e Identidad
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick SOS Trigger button */}
          <button
            type="button"
            onClick={onOpenSOSModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all shadow-xs"
            title="Activar Protocolo DOSA para antojos o procrastinación"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>SOS Antojos & Impulsos</span>
          </button>

          {/* Date Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 1. Selección Rápida de Hábitos con Biblioteca de Referencia */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Selección de Acciones y Señales Científicas
            </span>
            <span className="text-xs text-slate-500">
              ({selectedTagIds.length} seleccionados)
            </span>
          </div>

          {onOpenLibraryModal && (
            <button
              type="button"
              onClick={onOpenLibraryModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
            >
              <span>📚</span>
              <span>Ver Biblioteca Científica Completa</span>
            </button>
          )}
        </div>

        {/* Acciones de Alta Rentabilidad (+) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <span>🟢</span>
              <span>Acciones de Alta Rentabilidad (High ROI Habits)</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-medium hidden sm:inline">
              Luz circadiana, movimiento, proteína y foco profundo
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {healthyPresets.map((tag) => {
              const selected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  title={`${tag.scientificTerm}: ${tag.biologicalWhy}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all text-left ${
                    selected
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold scale-102'
                      : 'bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-900 border border-emerald-200/60'
                  }`}
                >
                  <span>{tag.icon}</span>
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fugas de Energía (-) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
              <span>🔴</span>
              <span>Fugas de Energía y Fricción (Energy Drains & High Friction)</span>
            </div>
            <span className="text-[10px] text-rose-700 font-medium hidden sm:inline">
              Dopamine stacking, cafeína tardía y fricción del entorno
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {unhealthyPresets.map((tag) => {
              const selected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  title={`${tag.scientificTerm}: ${tag.biologicalWhy}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all text-left ${
                    selected
                      ? 'bg-rose-600 text-white shadow-xs font-semibold scale-102'
                      : 'bg-rose-50/70 hover:bg-rose-100/70 text-rose-900 border border-rose-200/60'
                  }`}
                >
                  <span>{tag.icon}</span>
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hábitos Personalizados Recurrentes (James Clear & Huberman) */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
              <Star className="w-3.5 h-3.5 text-indigo-600 fill-indigo-500" />
              <span>Mis Hábitos Diarios Recurrentes</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold">
                {customHabits.length} definidos
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowAddRecurrent(!showAddRecurrent)}
              className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center gap-1 transition-colors border border-indigo-200/80"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddRecurrent ? 'Cancelar' : '+ Definir Hábito Recurrente'}</span>
            </button>
          </div>

          {/* Form to define new recurrent habit */}
          {showAddRecurrent && (
            <form onSubmit={handleAddRecurrentHabit} className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-200 mb-3 space-y-2">
              <div className="text-xs font-bold text-indigo-950">
                Nuevo hábito diario recurrente para tu perfil:
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newRecurrentName}
                  onChange={(e) => setNewRecurrentName(e.target.value)}
                  placeholder="Ej: Tomar creatina 5g, Leer 15 min, Meditar 10 min..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <select
                    value={newRecurrentCategory}
                    onChange={(e: any) => setNewRecurrentCategory(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-white"
                  >
                    <option value="healthy">🟢 Saludable (+)</option>
                    <option value="unhealthy">🔴 A evitar (-)</option>
                  </select>
                  <button
                    type="submit"
                    disabled={!newRecurrentName.trim()}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors shrink-0"
                  >
                    Guardar
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-indigo-700">
                VitaTrack recordará este hábito. Si no lo mencionas hoy, te preguntará al final del día: "¿Cumpliste hoy con tu hábito personalizado: [Nombre]?"
              </p>
            </form>
          )}

          {/* Habit chips */}
          {customHabits.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              No tienes hábitos recurrentes definidos aún. Haz clic en "+ Definir Hábito Recurrente".
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {customHabits.map((habit) => {
                const selected = selectedTagIds.includes(habit.id);
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleTag(habit.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                      selected
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold scale-102'
                        : 'bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-900 border border-indigo-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{selected ? '✅' : '⭐'}</span>
                      <span>{habit.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveRecurrentHabit(habit.id, e)}
                      className={`p-0.5 rounded-md transition-colors ${
                        selected
                          ? 'text-indigo-200 hover:text-white hover:bg-indigo-700'
                          : 'text-indigo-400 hover:text-rose-600 hover:bg-indigo-100'
                      }`}
                      title="Eliminar de hábitos recurrentes"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. Narrativa, Fotos y Dictado por Voz */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            2. Relato, Fotos (Comida / Smartwatch) o Audio
          </span>

          <div className="flex items-center gap-2">
            {/* Foto Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
              title="Adjuntar foto de comida o captura de smartwatch / pantalla"
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Adjuntar Foto / Captura</span>
            </button>

            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Detener</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dictar Audio</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Image Preview Card if attached */}
        {imagePreviewUrl && (
          <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-200 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <img
                src={imagePreviewUrl}
                alt="Vista previa"
                className="w-14 h-14 rounded-xl object-cover border border-indigo-300"
              />
              <div className="text-xs">
                <span className="font-bold text-indigo-950 block">
                  Foto adjuntada para Diagnóstico Visual (MODO 4)
                </span>
                <span className="text-indigo-700">
                  Se evaluará densidad nutricional o métricas de smartwatch (sueño, pasos, pantalla).
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={removeImage}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 transition-colors"
              title="Eliminar foto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {recordingStatus && (
          <div className="text-xs py-1.5 px-3 rounded-lg bg-teal-50 text-teal-800 flex items-center gap-2 border border-teal-200 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
            <span>{recordingStatus}</span>
          </div>
        )}

        <textarea
          rows={4}
          value={journalText}
          onChange={(e) => setJournalText(e.target.value)}
          placeholder="Describe tu día con naturalidad: qué comiste, si tuviste picos o bajones de energía, cuánto descansaste, qué disparó tus ganas de procrastinar o comer dulces... VitaTrack analizará las causas raíz de tu entorno sin juzgarte."
          className="w-full p-4 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 placeholder-slate-400 resize-none transition-all"
        />

        {/* Empathy & Scenario helper presets */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500">Ejemplos reales:</span>
            {SAMPLE_DAYS_TEXT.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadSample(idx)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                title={sample.title}
              >
                {idx === 0 ? 'Día Mixto (Estrés)' : idx === 1 ? 'Día con Culpa' : 'Día Biohacking'}
              </button>
            ))}
          </div>

          {onOpenChatWithPrompt && (
            <button
              type="button"
              onClick={() =>
                onOpenChatWithPrompt(
                  'Hoy me costó mucho ser constante y siento fricción mental. ¿Cómo puedo rediseñar mi entorno para no depender de la fuerza de voluntad?'
                )
              }
              className="text-xs text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1 underline underline-offset-2"
            >
              <span>Consultar psicología del hábito</span>
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200">
            {errorMsg}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-800 to-slate-900 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
              <span>VitaTrack Engine v3.0 analizando rendimiento conductual...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Generar Reporte de Rendimiento Diario (MODO 1)</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
