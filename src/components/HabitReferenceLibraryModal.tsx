import React, { useState } from 'react';
import { PRESET_HABITS, PresetTag } from '../data/presetHabits';
import {
  BookOpen,
  X,
  Sparkles,
  Zap,
  AlertTriangle,
  Brain,
  Sun,
  Activity,
  Utensils,
  Eye,
  Check,
  Copy,
} from 'lucide-react';

interface HabitReferenceLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHabit?: (habitId: string) => void;
}

export const HabitReferenceLibraryModal: React.FC<HabitReferenceLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectHabit,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'healthy' | 'unhealthy'>('all');
  const [selectedSubCat, setSelectedSubCat] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredHabits = PRESET_HABITS.filter((h) => {
    if (filterType !== 'all' && h.category !== filterType) return false;
    if (selectedSubCat !== 'all' && h.subCategory !== selectedSubCat) return false;
    return true;
  });

  const highROI = PRESET_HABITS.filter((h) => h.category === 'healthy');
  const energyDrains = PRESET_HABITS.filter((h) => h.category === 'unhealthy');

  const subCategories = Array.from(new Set(PRESET_HABITS.map((h) => h.subCategory)));

  const handleCopyScientificWhy = (h: PresetTag) => {
    const text = `• ${h.label} (${h.scientificTerm}) -> Por qué: ${h.biologicalWhy}`;
    navigator.clipboard.writeText(text);
    setCopiedId(h.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-900 to-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-slate-900/15">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                  Biblioteca Científica de Referencia
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-slate-900 text-emerald-400 uppercase tracking-wider">
                  Huberman & Clear
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Clasificación de Hábitos de Alta Rentabilidad (High ROI) y Fugas de Energía & Fricción
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Primary Category Filters */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setFilterType('all');
                  setSelectedSubCat('all');
                }}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  filterType === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({PRESET_HABITS.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterType('healthy');
                  setSelectedSubCat('all');
                }}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                  filterType === 'healthy'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <span>🟢 Alta Rentabilidad ({highROI.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterType('unhealthy');
                  setSelectedSubCat('all');
                }}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                  filterType === 'unhealthy'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-800 hover:bg-rose-50'
                }`}
              >
                <span>🔴 Fugas de Energía ({energyDrains.length})</span>
              </button>
            </div>

            {/* Subcategory Pills */}
            <select
              value={selectedSubCat}
              onChange={(e) => setSelectedSubCat(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Todas las dimensiones ({subCategories.length})</option>
              {subCategories.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Habits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredHabits.map((habit) => {
            const isHighROI = habit.category === 'healthy';
            return (
              <div
                key={habit.id}
                className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                  isHighROI
                    ? 'bg-emerald-50/40 border-emerald-200/90 hover:bg-emerald-50/70'
                    : 'bg-rose-50/40 border-rose-200/90 hover:bg-rose-50/70'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl shrink-0">{habit.icon}</span>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                        {habit.label}
                      </h4>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isHighROI ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {habit.scientificTerm}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md shrink-0 border ${
                      isHighROI
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {habit.subCategory.split(' ')[0]}
                  </span>
                </div>

                {/* Biological / Psychological WHY */}
                <div className="p-3 bg-white/90 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-slate-900 block text-[11px] flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Por qué biológico / psicológico:</span>
                  </span>
                  <p className="leading-relaxed text-[11px] sm:text-xs text-slate-600">
                    {habit.biologicalWhy}
                  </p>
                </div>

                {/* Quick Action Button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    {habit.subCategory}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyScientificWhy(habit)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white text-xs font-medium transition-colors"
                      title="Copiar término y explicación científica"
                    >
                      {copiedId === habit.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {onSelectHabit && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectHabit(habit.id);
                          onClose();
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          isHighROI
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-rose-600 text-white hover:bg-rose-700'
                        }`}
                      >
                        Registrar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              VitaTrack Engine v3.0 nombra explícitamente estos términos y explica su mecanismo de acción al analizar tus días.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shrink-0 ml-2"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
