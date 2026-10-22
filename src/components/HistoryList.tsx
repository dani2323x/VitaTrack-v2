import React, { useState } from 'react';
import { DayLog } from '../types';
import { DailySummaryCard } from './DailySummaryCard';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Download,
  Zap,
} from 'lucide-react';

interface HistoryListProps {
  logs: DayLog[];
  onToggleMicroAction: (id: string) => void;
  onClearLogs?: () => void;
  onUpdateLog?: (updatedLog: DayLog) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  logs,
  onToggleMicroAction,
  onUpdateLog,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(
    logs.length > 0 ? logs[0].id : null
  );

  const getLogSummaryTitle = (log: DayLog) => {
    if (log.structured?.vitalityScore !== undefined) {
      return `Score Vitalidad: ${log.structured.vitalityScore}/100 (${log.structured.dopamineLoad || 'Balanceado'})`;
    }
    return (log.structured as any)?.balanceScore || 'Día Registrado';
  };

  const getMicroHabitText = (log: DayLog) => {
    return (
      log.structured?.redesignTomorrow?.twoMinuteMicroHabit ||
      (log.structured as any)?.microAction ||
      'Micro-hábito objetivo'
    );
  };

  const filteredLogs = logs.filter((log) => {
    const title = getLogSummaryTitle(log).toLowerCase();
    const microText = getMicroHabitText(log).toLowerCase();
    const journal = (log.journalText || '').toLowerCase();

    const matchesSearch =
      log.date.includes(searchTerm) ||
      journal.includes(searchTerm.toLowerCase()) ||
      title.includes(searchTerm.toLowerCase()) ||
      microText.includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === 'all') return true;
    if (filterMode === 'altos') {
      const score = log.structured?.vitalityScore ?? (log.structured as any)?.healthScoreNumeric ?? 7;
      return score >= 75;
    }
    if (filterMode === 'friccion') {
      const score = log.structured?.vitalityScore ?? (log.structured as any)?.healthScoreNumeric ?? 7;
      return score < 75;
    }
    if (filterMode === 'cumplidos') {
      return !!log.microActionCompleted;
    }

    return true;
  });

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vitatrack-historial-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Historial Conductual</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Revisa tus reportes de rendimiento, rediseño de entorno y micro-hábitos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar JSON</span>
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por fecha, hábito, disparador o micro-acción..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {[
              { id: 'all', label: 'Todos' },
              { id: 'altos', label: 'Vitalidad Alta (75+)' },
              { id: 'friccion', label: 'Con Fricción (<75)' },
              { id: 'cumplidos', label: 'Micro-Hábito Cumplido' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id)}
                className={`text-xs px-3 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
                  filterMode === f.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Accordion / List */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <p className="text-slate-500 text-sm">
            No se encontraron registros que coincidan con tu búsqueda.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div key={log.id} className="space-y-2">
                {/* Header preview row */}
                <div
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:border-slate-300 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-slate-900 text-emerald-400 font-mono">
                      {log.date}
                    </span>
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-slate-900">
                        {getLogSummaryTitle(log)}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        Micro-hábito (&lt;2m): {getMicroHabitText(log)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        log.microActionCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.microActionCompleted ? 'Micro-hábito ✓' : 'Pendiente'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Card */}
                {isExpanded && (
                  <div className="pt-1">
                    <DailySummaryCard
                      log={log}
                      onToggleMicroAction={onToggleMicroAction}
                      onUpdateLog={onUpdateLog}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
