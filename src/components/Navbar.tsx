import React from 'react';
import { Sparkles, Calendar, TrendingUp, MessageSquareHeart, CheckCircle2, ShieldAlert, AlertTriangle, Utensils } from 'lucide-react';

interface NavbarProps {
  activeTab: 'logger' | 'nutriscan' | 'trends' | 'chat' | 'history';
  setActiveTab: (tab: 'logger' | 'nutriscan' | 'trends' | 'chat' | 'history') => void;
  streakCount: number;
  totalLogs: number;
  onOpenDisclaimer: () => void;
  onOpenSOSModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  streakCount,
  totalLogs,
  onOpenDisclaimer,
  onOpenSOSModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Version */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-800 to-emerald-600 flex items-center justify-center text-emerald-400 shadow-md shadow-slate-900/10">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Vita<span className="text-emerald-600">Track</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900 text-emerald-400 border border-slate-800">
                  Engine v3.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Inteligencia Conductual, Biohacking y Psicología del Hábito
              </p>
            </div>
          </div>

          {/* Right side stats, SOS trigger & disclaimer */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct SOS Button in Navbar */}
            <button
              onClick={onOpenSOSModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/30 transition-all animate-pulse"
              title="Protocolo DOSA ante impulsos, antojos o procrastinación"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>SOS Antojos</span>
            </button>

            <div className="hidden md:flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                <span className="text-base">🔥</span>
                <span>{streakCount} {streakCount === 1 ? 'día' : 'días'} racha</span>
              </div>
              <div className="w-px h-4 bg-slate-300" />
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{totalLogs} registros</span>
              </div>
            </div>

            <button
              onClick={onOpenDisclaimer}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
              title="Aviso de salud y marco ético"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Ética & Salud</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('logger')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'logger'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>📝</span>
            <span>Registro Diario (MODO 1)</span>
          </button>

          <button
            onClick={() => setActiveTab('nutriscan')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'nutriscan'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Utensils className="w-4 h-4 text-emerald-400" />
            <span>NutriScan & Macros</span>
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'trends'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Auditoría & Patrones (MODO 3)</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquareHeart className="w-4 h-4 text-emerald-400" />
            <span>Consultar Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Historial ({totalLogs})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
