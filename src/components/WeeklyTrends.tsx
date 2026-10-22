import React, { useState } from 'react';
import { DayLog } from '../types';
import {
  TrendingUp,
  Sparkles,
  Loader2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Layers,
  RefreshCw,
  Brain,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface WeeklyTrendsProps {
  logs: DayLog[];
}

export const WeeklyTrends: React.FC<WeeklyTrendsProps> = ({ logs }) => {
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compute aggregate metrics
  const totalLogs = logs.length;
  const avgVitality = totalLogs > 0
    ? Math.round(
        logs.reduce((acc, l) => acc + (l.structured?.vitalityScore ?? 75), 0) / totalLogs
      )
    : 0;

  const totalHighYield = logs.reduce(
    (acc, log) => acc + (log.structured?.highYieldActions?.length || log.structured?.habitsRatio?.positiveCount || 0),
    0
  );

  const totalEnergyLeaks = logs.reduce(
    (acc, log) => acc + (log.structured?.energyLeaks?.length || log.structured?.habitsRatio?.negativeCount || 0),
    0
  );

  const completedMicroHabits = logs.filter((l) => l.microActionCompleted).length;

  const handleRunAudit = async () => {
    if (logs.length === 0) {
      setErrorMsg('Registra al menos 1 día para que VitaTrack ejecute la auditoría semanal.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const historyPayload = logs.slice(0, 7).map((l) => ({
        date: l.date,
        vitalityScore: l.structured?.vitalityScore,
        dopamineLoad: l.structured?.dopamineLoad,
        highYieldActions: l.structured?.highYieldActions,
        energyLeaks: l.structured?.energyLeaks,
        triggerMapping: l.structured?.triggerMapping,
        redesignTomorrow: l.structured?.redesignTomorrow,
      }));

      const res = await fetch('/api/weekly-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: historyPayload }),
      });

      if (!res.ok) {
        throw new Error('Fallo al solicitar la auditoría semanal.');
      }

      const data = await res.json();
      setAnalysisText(data.analysis);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al conectar con la auditoría semanal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Auditoría Semanal & Patrones Conductuales
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              MODO 3: Detección del "Día Fuga", tabla de frecuencia y ajuste de señales previas.
            </p>
          </div>

          <button
            onClick={handleRunAudit}
            disabled={isLoading || logs.length === 0}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-all disabled:opacity-50 shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Auditoría en proceso...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-300" />
                <span>Ejecutar MODO 3: Auditoría Semanal</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200">
            {errorMsg}
          </div>
        )}

        {/* Aggregate KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Vitalidad Promedio</span>
              <Activity className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {avgVitality}/100
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Media de energía</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-medium">
              <span>Alta Rentabilidad</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-950 mt-1">
              {totalHighYield}
            </div>
            <div className="text-[11px] text-emerald-700/80 mt-0.5">Votos a tu identidad</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/80">
            <div className="flex items-center justify-between text-rose-800 text-xs font-medium">
              <span>Fugas de Energía</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-rose-950 mt-1">
              {totalEnergyLeaks}
            </div>
            <div className="text-[11px] text-rose-700/80 mt-0.5">Puntos de fricción</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80">
            <div className="flex items-center justify-between text-amber-800 text-xs font-medium">
              <span>Micro-Hábitos (&lt;2m)</span>
              <Zap className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-amber-950 mt-1">
              {completedMicroHabits}/{totalLogs}
            </div>
            <div className="text-[11px] text-amber-700/80 mt-0.5">Consolidados con éxito</div>
          </div>
        </div>
      </div>

      {/* AI Weekly Audit Output */}
      {analysisText && (
        <div className="bg-white rounded-3xl border border-indigo-200 shadow-sm p-6 sm:p-8 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-indigo-400 flex items-center justify-center font-bold text-lg shadow-sm">
                🔍
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Reporte de Auditoría Conductual (VitaTrack Engine v3.0)
                </h3>
                <p className="text-xs text-slate-500">
                  Tabla de frecuencia, análisis del Día Fuga y ajuste de algoritmo personal
                </p>
              </div>
            </div>

            <button
              onClick={handleRunAudit}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerar</span>
            </button>
          </div>

          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
            {analysisText}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              La auditoría conductual utiliza marcos de James Clear y Andrew Huberman para optimización del estilo de vida. No sustituye la atención médica clínica.
            </span>
          </div>
        </div>
      )}

      {/* Evolution Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Historial de Registros Auditables</span>
        </h3>

        <div className="divide-y divide-slate-100">
          {logs.map((log) => (
            <div
              key={log.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                  {log.date}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Score: {log.structured?.vitalityScore ?? 75}/100
                </span>
                <span className="text-xs text-slate-500">
                  • Carga: {log.structured?.dopamineLoad || 'Balanceado'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="text-emerald-700 font-medium">
                  🟢 {log.structured?.highYieldActions?.length || 0} alta rentabilidad
                </span>
                <span className="text-rose-700 font-medium">
                  🔴 {log.structured?.energyLeaks?.length || 0} fugas
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                    log.microActionCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {log.microActionCompleted ? 'Micro-hábito ✓' : 'Micro-hábito pendiente'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
