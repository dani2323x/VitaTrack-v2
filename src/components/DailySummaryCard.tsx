import React, { useState } from 'react';
import { DayLog, HabitAction, EditConfirmationResult } from '../types';
import confetti from 'canvas-confetti';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  Calendar,
  CheckCircle,
  AlertTriangle,
  FileText,
  Sliders,
  Brain,
  Activity,
  Layers,
  MapPin,
  Zap,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  Send,
  X,
  HelpCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface DailySummaryCardProps {
  log: DayLog;
  onToggleMicroAction?: (id: string) => void;
  onUpdateLog?: (updatedLog: DayLog) => void;
}

export const DailySummaryCard: React.FC<DailySummaryCardProps> = ({
  log,
  onToggleMicroAction,
  onUpdateLog,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'raw'>('visual');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Editing state
  const [isEditingOpen, setIsEditingOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [lastEditResult, setLastEditResult] = useState<EditConfirmationResult | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // Add Habit Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabitText, setNewHabitText] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<'auto' | 'healthy' | 'unhealthy'>('auto');

  // Inline modify state
  const [editingHabit, setEditingHabit] = useState<{
    originalName: string;
    category: 'healthy' | 'unhealthy';
  } | null>(null);
  const [replacementHabitText, setReplacementHabitText] = useState('');

  // Natural language command bar
  const [nlCommandInput, setNlCommandInput] = useState('');

  // Dismissed unmentioned recurrent habits
  const [dismissedRecurrent, setDismissedRecurrent] = useState<string[]>([]);

  const handleCopy = () => {
    navigator.clipboard.writeText(log.rawMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyConfirmation = () => {
    if (lastEditResult?.rawConfirmation) {
      navigator.clipboard.writeText(lastEditResult.rawConfirmation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleMicroActionClick = () => {
    if (onToggleMicroAction) {
      const willBeCompleted = !log.microActionCompleted;
      onToggleMicroAction(log.id);
      if (willBeCompleted) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#3b82f6', '#f59e0b'],
        });
      }
    }
  };

  const playTTS = async () => {
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
      return;
    }

    setAudioError(null);
    setIsPlayingAudio(true);

    const s = log.structured;
    const speechScript = `Reporte de rendimiento diario de VitaTrack Engine. Score de Vitalidad: ${
      s.vitalityScore
    } sobre 100. Carga dopaminérgica: ${s.dopamineLoad}. Rediseño para mañana: ${
      s.redesignTomorrow?.twoMinuteMicroHabit || ''
    }. ${s.identityAffirmation || ''}`;

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: speechScript }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          audio.onended = () => setIsPlayingAudio(false);
          audio.onerror = () => {
            fallbackSpeech(speechScript);
          };
          await audio.play();
          return;
        }
      }
      fallbackSpeech(speechScript);
    } catch {
      fallbackSpeech(speechScript);
    }
  };

  const fallbackSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
      setAudioError('Audio no soportado en este navegador.');
    }
  };

  // Perform Edit / Recalculation API Call
  const executeEdit = async (params: {
    action: 'add' | 'edit' | 'delete' | 'nl_command';
    commandText?: string;
    habitName?: string;
    newHabitName?: string;
    habitCategory?: 'auto' | 'healthy' | 'unhealthy';
  }) => {
    setEditLoading(true);
    setEditError(null);

    try {
      const res = await fetch('/api/edit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: params.action,
          commandText: params.commandText,
          habitName: params.habitName,
          newHabitName: params.newHabitName,
          habitCategory: params.habitCategory || 'auto',
          currentLog: log,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'No se pudo aplicar la modificación.');
      }

      const result: EditConfirmationResult = await res.json();
      setLastEditResult(result);

      if (onUpdateLog && result.updatedLog) {
        onUpdateLog(result.updatedLog);
      }

      // If score improved, celebrate!
      if (result.vitalityScoreChange > 0) {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#14b8a6', '#f59e0b'],
        });
      }

      // Reset forms
      setNewHabitText('');
      setShowAddForm(false);
      setEditingHabit(null);
      setReplacementHabitText('');
      setNlCommandInput('');
    } catch (err: any) {
      console.error('Error in executeEdit:', err);
      setEditError(err?.message || 'Error al actualizar el registro.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitText.trim() || editLoading) return;
    executeEdit({
      action: 'add',
      habitName: newHabitText.trim(),
      habitCategory: newHabitCategory,
    });
  };

  const handleEditInlineSubmit = (originalHabit: string) => {
    if (!replacementHabitText.trim() || editLoading) return;
    executeEdit({
      action: 'edit',
      habitName: originalHabit,
      newHabitName: replacementHabitText.trim(),
    });
  };

  const handleDeleteHabit = (habitName: string) => {
    if (editLoading) return;
    executeEdit({
      action: 'delete',
      habitName,
    });
  };

  const handleNlCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlCommandInput.trim() || editLoading) return;
    executeEdit({
      action: 'nl_command',
      commandText: nlCommandInput.trim(),
    });
  };

  const handleRecurrentHabitConfirm = (habitName: string) => {
    setDismissedRecurrent((prev) => [...prev, habitName]);
    executeEdit({
      action: 'add',
      habitName,
      habitCategory: 'healthy',
    });
  };

  const handleDismissRecurrent = (habitName: string) => {
    setDismissedRecurrent((prev) => [...prev, habitName]);
  };

  const getDopamineBadge = (load: string) => {
    const lower = (load || '').toLowerCase();
    if (lower.includes('sobres')) {
      return 'bg-rose-100 text-rose-800 border-rose-300';
    }
    if (lower.includes('balance')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  const s = log.structured;
  const posCount = s.habitsRatio?.positiveCount ?? s.highYieldActions?.length ?? 0;
  const negCount = s.habitsRatio?.negativeCount ?? s.energyLeaks?.length ?? 0;

  // Active unmentioned recurrent habits
  const pendingRecurrentHabits = (s.unmentionedRecurrentHabits || []).filter(
    (h) => !dismissedRecurrent.includes(h)
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Header Bar */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-sm">
            📈
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base sm:text-lg">
                Reporte de Rendimiento Diario
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Engine v3.0
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{log.date}</span>
              <span>•</span>
              <span>Biohacking & Psicología Conductual</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Edit Toggle Button */}
          <button
            onClick={() => setIsEditingOpen(!isEditingOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isEditingOpen
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title="Abrir módulo de edición y comandos"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingOpen ? 'Cerrar Edición' : 'Editar Hábitos'}</span>
          </button>

          {/* TTS Listen */}
          <button
            onClick={playTTS}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isPlayingAudio
                ? 'bg-emerald-500 text-slate-950 animate-pulse font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title="Escuchar audio de VitaTrack"
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Detener Voz</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Escuchar</span>
              </>
            )}
          </button>

          {/* Copy exact Markdown */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            title="Copiar formato exacto en Markdown"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copiar</span>
              </>
            )}
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-xl text-xs border border-slate-700">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'visual'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Dashboard visual de biohacking"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'raw'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Ver formato oficial exacto Markdown (MODO 1)"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {audioError && (
        <div className="px-6 py-2 bg-amber-50 text-amber-800 text-xs border-b border-amber-200">
          {audioError}
        </div>
      )}

      {/* RECURRENT HABITS REMINDER BANNER (Andrew Huberman / James Clear) */}
      {pendingRecurrentHabits.length > 0 && (
        <div className="bg-indigo-50/90 border-b border-indigo-200 px-4 sm:px-6 py-3.5 text-xs text-indigo-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="font-bold text-indigo-900">Recordatorio de Hábito Personalizado:</span>{' '}
              ¿Cumpliste hoy con: <strong className="text-indigo-950">{pendingRecurrentHabits[0]}</strong>?
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              disabled={editLoading}
              onClick={() => handleRecurrentHabitConfirm(pendingRecurrentHabits[0])}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1 shadow-xs transition-colors"
            >
              {editLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              <span>Sí, cumplido</span>
            </button>
            <button
              onClick={() => handleDismissRecurrent(pendingRecurrentHabits[0])}
              className="px-2.5 py-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              No hoy
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMATION BANNER OF LAST EDIT (Estructura Exacta Solicitada) */}
      {lastEditResult && (
        <div className="bg-emerald-50 border-b border-emerald-200/90 px-4 sm:px-6 py-4 animate-fadeIn">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-950 flex items-center gap-1">
                  ✅ <span>REGISTRO ACTUALIZADO</span>
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    lastEditResult.vitalityScoreChange >= 0
                      ? 'bg-emerald-200/70 text-emerald-900'
                      : 'bg-rose-200/70 text-rose-900'
                  }`}
                >
                  {lastEditResult.vitalityScoreChange >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {lastEditResult.vitalityScoreChange >= 0 ? '+' : ''}
                    {lastEditResult.vitalityScoreChange} pts
                  </span>
                </span>
              </div>

              <div className="text-slate-800 leading-relaxed font-mono text-[11px] sm:text-xs bg-white/80 p-3 rounded-xl border border-emerald-200">
                <div>• <strong>Cambio realizado:</strong> {lastEditResult.actionTaken} ➔ <em>"{lastEditResult.detail}"</em></div>
                <div>• <strong>Nuevo Score de Vitalidad:</strong> {lastEditResult.newVitalityScore} / 100</div>
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <div className="font-bold text-slate-700">📋 Lista Revisada del Día:</div>
                  <div className="text-emerald-800">• 🟢 <strong>Saludables:</strong> {lastEditResult.updatedLog?.structured?.highYieldActions?.map(a => a.habit).join(', ') || 'Ninguno'}</div>
                  <div className="text-rose-800">• 🔴 <strong>No Saludables:</strong> {lastEditResult.updatedLog?.structured?.energyLeaks?.map(a => a.habit).join(', ') || 'Ninguno'}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleCopyConfirmation}
                className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition-colors"
                title="Copiar confirmación"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLastEditResult(null)}
                className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-800 transition-colors"
                title="Cerrar confirmación"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDITING & PERSONALIZATION CONTROL PANEL */}
      {isEditingOpen && (
        <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Módulo de Edición & Personalización de Hábitos</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Control total sin juicios
            </span>
          </div>

          {/* Natural Language Command Bar */}
          <form onSubmit={handleNlCommandSubmit} className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
              Comando en lenguaje natural:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nlCommandInput}
                onChange={(e) => setNlCommandInput(e.target.value)}
                placeholder='Ej: "Añade el hábito: Caminata 20 min" o "Modifica cafeína por infusión"'
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                disabled={editLoading}
              />
              <button
                type="submit"
                disabled={!nlCommandInput.trim() || editLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Ejecutar</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-500 mt-1">
              <span className="font-semibold text-slate-600">Comandos rápidos:</span>
              <button
                type="button"
                onClick={() => setNlCommandInput('Añade el hábito: Exposición solar 15 min')}
                className="px-2 py-0.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
              >
                + Luz solar
              </button>
              <button
                type="button"
                onClick={() => setNlCommandInput('Añade el hábito: Hidratación con electrolitos')}
                className="px-2 py-0.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
              >
                + Hidratación
              </button>
              <button
                type="button"
                onClick={() => setNlCommandInput('Modifica cafeína de tarde por té descafeinado')}
                className="px-2 py-0.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
              >
                Modificar cafeína
              </button>
            </div>
          </form>

          {/* Manual Add Habit button toggle */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-600">
              ¿Deseas agregar un hábito específico de hoy?
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 text-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>{showAddForm ? 'Ocultar formulario' : 'Añadir Hábito Manual'}</span>
            </button>
          </div>

          {/* Add Habit Sub-form */}
          {showAddForm && (
            <form onSubmit={handleAddSubmit} className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-800">
                ➕ Añadir Hábito a Hoy
              </div>
              <input
                type="text"
                value={newHabitText}
                onChange={(e) => setNewHabitText(e.target.value)}
                placeholder="Nombre del hábito (ej: Ducha fría 2 min, Comer galletas ultraprocesadas)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={editLoading}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-medium">Clasificación:</span>
                  <button
                    type="button"
                    onClick={() => setNewHabitCategory('auto')}
                    className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                      newHabitCategory === 'auto' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Auto-detectar
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewHabitCategory('healthy')}
                    className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                      newHabitCategory === 'healthy' ? 'bg-emerald-600 text-white font-bold' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    🟢 Saludable
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewHabitCategory('unhealthy')}
                    className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                      newHabitCategory === 'unhealthy' ? 'bg-rose-600 text-white font-bold' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    🔴 Fuga / No saludable
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!newHabitText.trim() || editLoading}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Guardar y Recalcular</span>
                </button>
              </div>
            </form>
          )}

          {editError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {editError}
            </div>
          )}
        </div>
      )}

      {/* Content Body */}
      {viewMode === 'raw' ? (
        /* EXACT RAW MARKDOWN OUTPUT */
        <div className="p-4 sm:p-6 bg-slate-950 text-slate-100 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
          {log.rawMarkdown}
        </div>
      ) : (
        /* VISUAL BIOHACKING DASHBOARD */
        <div className="p-4 sm:p-6 space-y-6">
          {/* Identity Affirmation (James Clear) */}
          {s.identityAffirmation && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200/80 flex items-center gap-2.5 text-xs sm:text-sm text-emerald-950 font-medium">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{s.identityAffirmation}</span>
            </div>
          )}

          {/* Section 1: Métrica y Scores */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Score Vitalidad */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Vitalidad General
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {s.vitalityScore ?? 75}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base">
                ⚡
              </div>
            </div>

            {/* Ratio de Hábitos */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Ratio de Hábitos
                </span>
                <div className="flex items-center gap-2 mt-1.5 font-bold text-sm sm:text-base">
                  <span className="text-emerald-700">🟢 {posCount} Positivos</span>
                  <span className="text-slate-300">vs</span>
                  <span className="text-rose-700">🔴 {negCount} Negativos</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-base">
                ⚖️
              </div>
            </div>

            {/* Carga Dopaminérgica */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Carga Dopaminérgica
                </span>
                <span
                  className={`inline-block mt-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${getDopamineBadge(
                    s.dopamineLoad
                  )}`}
                >
                  {s.dopamineLoad || 'Balanceado'}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base">
                🧠
              </div>
            </div>
          </div>

          {/* User's Original Note or Uploaded Image preview */}
          {(log.journalText || log.imageDataUrl) && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row gap-3 items-start">
              {log.imageDataUrl && (
                <img
                  src={log.imageDataUrl}
                  alt="Registro visual"
                  className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                />
              )}
              {log.journalText && (
                <div className="text-xs text-slate-600 italic">
                  <span className="font-semibold text-slate-700 not-italic block mb-0.5">
                    Registro de entrada:
                  </span>
                  "{log.journalText}"
                </div>
              )}
            </div>
          )}

          {/* Section 2: Desglose Conductual with INLINE EDITING */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Desglose Conductual (Fricción & Rendimiento)
              </h4>
              <button
                onClick={() => {
                  setIsEditingOpen(true);
                  setShowAddForm(true);
                }}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Añadir hábito a hoy</span>
              </button>
            </div>

            {/* 🟢 Acciones de Alta Rentabilidad */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <span>🟢</span>
                <h5>Acciones de Alta Rentabilidad (Positivas)</h5>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {s.highYieldActions?.length || 0}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {(s.highYieldActions || []).map((action, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 hover:bg-emerald-50 transition-colors group relative"
                  >
                    {editingHabit?.originalName === action.habit ? (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-800">
                          Modificar hábito:
                        </div>
                        <input
                          type="text"
                          value={replacementHabitText}
                          onChange={(e) => setReplacementHabitText(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Nuevo nombre o ajuste"
                          autoFocus
                          disabled={editLoading}
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setEditingHabit(null)}
                            className="text-xs px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleEditInlineSubmit(action.habit)}
                            disabled={!replacementHabitText.trim() || editLoading}
                            className="text-xs px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                          >
                            {editLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            <span>Guardar</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-xs sm:text-sm text-slate-900">
                              {action.habit}
                            </div>
                            <div className="text-xs text-emerald-900/90 mt-1 flex items-start gap-1">
                              <span className="font-bold shrink-0">Efecto:</span>
                              <span>{action.effectOrConsequence}</span>
                            </div>
                          </div>
                        </div>

                        {/* Inline Edit & Delete Buttons */}
                        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => {
                              setEditingHabit({
                                originalName: action.habit,
                                category: 'healthy',
                              });
                              setReplacementHabitText(action.habit);
                            }}
                            className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-emerald-100/60 transition-colors"
                            title="Modificar este hábito"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteHabit(action.habit)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Eliminar este hábito del día"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 🔴 Fugas de Energía y Fricción */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <span>🔴</span>
                <h5>Fugas de Energía y Fricción (Negativas)</h5>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  {s.energyLeaks?.length || 0}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {(s.energyLeaks || []).map((leak, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-200/80 hover:bg-rose-50/70 transition-colors group relative"
                  >
                    {editingHabit?.originalName === leak.habit ? (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-800">
                          Modificar fuga / hábito:
                        </div>
                        <input
                          type="text"
                          value={replacementHabitText}
                          onChange={(e) => setReplacementHabitText(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                          placeholder="Nuevo nombre o ajuste"
                          autoFocus
                          disabled={editLoading}
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setEditingHabit(null)}
                            className="text-xs px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleEditInlineSubmit(leak.habit)}
                            disabled={!replacementHabitText.trim() || editLoading}
                            className="text-xs px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                          >
                            {editLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            <span>Guardar</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-xs sm:text-sm text-slate-900">
                              {leak.habit}
                            </div>
                            <div className="text-xs text-rose-900/90 mt-1 flex items-start gap-1">
                              <span className="font-bold shrink-0">Consecuencia:</span>
                              <span>{leak.effectOrConsequence}</span>
                            </div>
                          </div>
                        </div>

                        {/* Inline Edit & Delete Buttons */}
                        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => {
                              setEditingHabit({
                                originalName: leak.habit,
                                category: 'unhealthy',
                              });
                              setReplacementHabitText(leak.habit);
                            }}
                            className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-rose-100/60 transition-colors"
                            title="Modificar este hábito"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteHabit(leak.habit)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-100/60 transition-colors"
                            title="Eliminar este hábito del día"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Mapeo de Disparadores y Entorno */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
              <Brain className="w-4 h-4 text-indigo-600" />
              <span>🧠 Mapeo de Disparadores y Entorno (Señales Previas)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Disparador Principal:</span>
                </span>
                <p className="text-slate-600">
                  {s.triggerMapping?.mainTrigger || 'No detectado'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Falla de Sistema/Entorno:</span>
                </span>
                <p className="text-slate-600">
                  {s.triggerMapping?.systemOrEnvironmentFailure || 'No detectada'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Rediseño para Mañana (Regla de los 2 Minutos) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-amber-50/40 to-yellow-50/30 border border-amber-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-sm sm:text-base">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>⚡ Rediseño para Mañana (Regla de los 2 Minutos)</span>
              </div>
              <span className="text-xs font-semibold text-amber-800">
                James Clear & B.J. Fogg
              </span>
            </div>

            {/* Optimización de Entorno */}
            <div className="p-3.5 bg-white/90 rounded-xl border border-amber-200/80 flex items-start gap-2.5 text-xs text-slate-800">
              <Layers className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block mb-0.5">
                  Optimización de Entorno (Cambio Físico):
                </span>
                <p className="text-slate-700">
                  {s.redesignTomorrow?.environmentOptimization ||
                    'Ajusta las señales visuales de tu espacio para facilitar el hábito saludable.'}
                </p>
              </div>
            </div>

            {/* Micro-Hábito Objetivo (<2 Min) */}
            <div
              onClick={handleMicroActionClick}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                log.microActionCompleted
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 line-through opacity-90'
                  : 'bg-white hover:bg-amber-100/40 border-amber-300/80 text-slate-800 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    log.microActionCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-slate-300 hover:border-emerald-500'
                  }`}
                >
                  {log.microActionCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                    Micro-Hábito Objetivo (&lt; 2 minutos)
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900">
                    {s.redesignTomorrow?.twoMinuteMicroHabit ||
                      '1 acción simple que tome menos de 2 minutos.'}
                  </span>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${
                  log.microActionCompleted
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {log.microActionCompleted ? '¡Cumplida!' : 'Pendiente'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
