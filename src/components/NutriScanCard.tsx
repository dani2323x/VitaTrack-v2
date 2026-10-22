import React, { useState } from 'react';
import { NutriScanResult } from '../types';
import {
  Camera,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  FileText,
  AlertTriangle,
  Lightbulb,
  PlusCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';

interface NutriScanCardProps {
  scan: NutriScanResult;
  onAddToDailyLog?: (scan: NutriScanResult) => void;
}

export const NutriScanCard: React.FC<NutriScanCardProps> = ({
  scan,
  onAddToDailyLog,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'raw'>('visual');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [added, setAdded] = useState(false);

  const s = scan.structured;

  const handleCopy = () => {
    navigator.clipboard.writeText(scan.rawMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdd = () => {
    if (onAddToDailyLog) {
      onAddToDailyLog(scan);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    }
  };

  const playTTS = () => {
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if ('speechSynthesis' in window) {
      const speechScript = `Análisis de NutriScan para ${s.dishName}. Estimación de ${s.calories} kilocalorías. Proteínas: ${s.macros.proteinGrams} gramos. Carbohidratos: ${s.macros.carbsGrams} gramos. Grasas: ${s.macros.fatsGrams} gramos. Fibra: ${s.macros.fiberGrams} gramos. Calificación nutricional: ${s.nutritionalScore} sobre 10. Sugerencia: ${s.optimizationTip}`;
      const utterance = new SpeechSynthesisUtterance(speechScript);
      utterance.lang = 'es-ES';
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (score >= 6) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-sm">
            🥑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base sm:text-lg">
                NutriScan: {s.dishName}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {scan.mealType}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Escaneo visual de densidad nutricional & macros
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={playTTS}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isPlayingAudio
                ? 'bg-emerald-500 text-slate-950 font-bold animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title="Escuchar audio de NutriScan"
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Detener</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Escuchar</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            title="Copiar texto exacto de NutriScan"
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

          <div className="flex items-center bg-slate-800 p-0.5 rounded-xl text-xs border border-slate-700">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'visual'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
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
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      {viewMode === 'raw' ? (
        <div className="p-4 sm:p-6 bg-slate-950 text-slate-100 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
          {scan.rawMarkdown}
        </div>
      ) : (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Images Strip if available */}
          {scan.imageUrls && scan.imageUrls.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
              {scan.imageUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Comida ${i + 1}`}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
                />
              ))}
            </div>
          )}

          {/* 🍽️ Identificación del Plato & Ingredientes Detectados */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <span>🍽️</span>
              <span>Identificación del Plato & Ingredientes:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(s.detectedIngredients || []).map((ing, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>

          {/* 📊 Calorías Totales & 🥑 Macronutrientes Principales */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Macronutrientes Principales & Calorías
              </span>
              <div className="flex items-baseline gap-1 text-slate-900">
                <span className="text-xs font-semibold text-slate-500">Estimación:</span>
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-600">
                  ~{s.calories}
                </span>
                <span className="text-xs font-bold text-slate-600">kcal</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Proteínas */}
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                  <span>🥩</span>
                  <span>Proteínas</span>
                </div>
                <div className="text-xl font-extrabold text-rose-950">
                  ~{s.macros.proteinGrams}g
                </div>
                <div className="text-[10px] text-rose-700/80">Estructura & saciedad</div>
              </div>

              {/* Carbohidratos */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <span>🍞</span>
                  <span>Carbohidratos</span>
                </div>
                <div className="text-xl font-extrabold text-amber-950">
                  ~{s.macros.carbsGrams}g
                </div>
                <div className="text-[10px] text-amber-700/80">
                  Azúcares: ~{s.macros.sugarsGrams}g
                </div>
              </div>

              {/* Grasas */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800">
                  <span>🥑</span>
                  <span>Grasas</span>
                </div>
                <div className="text-xl font-extrabold text-blue-950">
                  ~{s.macros.fatsGrams}g
                </div>
                <div className="text-[10px] text-blue-700/80">
                  Saturadas: ~{s.macros.saturatedFatsGrams}g
                </div>
              </div>

              {/* Fibra */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <span>🥗</span>
                  <span>Fibra</span>
                </div>
                <div className="text-xl font-extrabold text-emerald-950">
                  ~{s.macros.fiberGrams}g
                </div>
                <div className="text-[10px] text-emerald-700/80">Microbiota & glucosa</div>
              </div>
            </div>
          </div>

          {/* 🥦 Micronutrientes Destacados */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Micronutrientes Destacados
            </span>
            <div className="flex flex-wrap gap-2">
              {(s.micronutrients || []).map((micro, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-900 text-xs font-semibold"
                >
                  <span>✨</span>
                  <span>{micro}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ⚠️ Ajustes y Precauciones de Estimación */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">
                Ajustes y Precauciones de Estimación:
              </span>
              <span>{s.hiddenIngredientsNotice}</span>
            </div>
          </div>

          {/* 🎯 Calificación Nutricional & Sugerencia */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <span>🎯</span>
                <span>Calificación Nutricional:</span>
              </div>
              <span
                className={`px-3 py-1 rounded-xl text-xs font-bold border ${getScoreColor(
                  s.nutritionalScore
                )}`}
              >
                Nota: {s.nutritionalScore} / 10
              </span>
            </div>

            {/* Barra visual de score */}
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  s.nutritionalScore >= 8
                    ? 'bg-emerald-500'
                    : s.nutritionalScore >= 6
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, s.nutritionalScore * 10)}%` }}
              />
            </div>

            {/* Sugerencia de Optimización */}
            <div className="flex items-start gap-2 text-xs text-slate-700 pt-1">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">
                  Sugerencia de Optimización:{' '}
                </span>
                <span>{s.optimizationTip}</span>
              </div>
            </div>

            {/* Conexión con el Score de Vitalidad */}
            {s.vitalityConnection && (
              <div className="flex items-start gap-2 text-xs text-emerald-800 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/70">
                <Zap className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Impacto en Vitalidad Diaria: </span>
                  <span>{s.vitalityConnection}</span>
                </div>
              </div>
            )}

            {/* Pregunta aclaratoria si hubo ambigüedad */}
            {s.clarificationQuestion && (
              <div className="flex items-start gap-2 text-xs text-indigo-800 bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-200/70">
                <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Aclaración: </span>
                  <span>{s.clarificationQuestion}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action: Add to Daily Log */}
          {onAddToDailyLog && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAdd}
                disabled={added}
                className={`w-full py-3 px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Comida añadida al Registro Diario de Hoy!</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    <span>Añadir esta comida al Registro Diario de Hoy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
