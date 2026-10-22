import React, { useState, useEffect } from 'react';
import { DayLog, NutriScanResult } from './types';
import { getStoredLogs, addDayLog, updateDayLog, toggleMicroAction } from './utils/storage';
import { Navbar } from './components/Navbar';
import { DailyLogger } from './components/DailyLogger';
import { DailySummaryCard } from './components/DailySummaryCard';
import { NutritionScannerView } from './components/NutritionScannerView';
import { WeeklyTrends } from './components/WeeklyTrends';
import { ChatAssistant } from './components/ChatAssistant';
import { HistoryList } from './components/HistoryList';
import { MedicalDisclaimerModal } from './components/MedicalDisclaimerModal';
import { SOSProtocolModal } from './components/SOSProtocolModal';
import { HabitReferenceLibraryModal } from './components/HabitReferenceLibraryModal';
import { Sparkles, ArrowRight, AlertTriangle, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

const NUTRI_STORAGE_KEY = 'vitatrack_nutriscans_v1';

export default function App() {
  const [logs, setLogs] = useState<DayLog[]>(() => getStoredLogs());
  const [activeTab, setActiveTab] = useState<
    'logger' | 'nutriscan' | 'trends' | 'chat' | 'history'
  >('logger');
  const [latestLog, setLatestLog] = useState<DayLog | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);

  // Scanned Meals for Nutrition Scanner & Macro Tracker
  const [scannedMeals, setScannedMeals] = useState<NutriScanResult[]>(() => {
    try {
      const raw = localStorage.getItem(NUTRI_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  // Save scanned meals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NUTRI_STORAGE_KEY, JSON.stringify(scannedMeals));
    } catch (e) {
      console.error('Error saving scanned meals:', e);
    }
  }, [scannedMeals]);

  // Set latest log to the most recent one on load
  useEffect(() => {
    if (logs.length > 0 && !latestLog) {
      setLatestLog(logs[0]);
    }
  }, [logs]);

  // Calculate streak based on daily records
  const calculateStreak = () => {
    if (logs.length === 0) return 0;
    return logs.length;
  };

  const handleLogCreated = (newLog: DayLog) => {
    const updated = addDayLog(newLog);
    setLogs(updated);
    setLatestLog(newLog);
    setTimeout(() => {
      const el = document.getElementById('latest-summary-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handleMealScanned = (newMeal: NutriScanResult) => {
    setScannedMeals((prev) => [newMeal, ...prev]);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#10b981', '#14b8a6', '#f59e0b'],
    });
  };

  const handleAddToDailyLog = (mealScan: NutriScanResult) => {
    const today = new Date().toISOString().split('T')[0];
    const s = mealScan.structured;

    const mealNote = `[NutriScan] ${mealScan.mealType}: ${s.dishName} (~${s.calories} kcal, ${s.macros.proteinGrams}g proteína, ${s.macros.carbsGrams}g carbohidratos, ${s.macros.fatsGrams}g grasas, ${s.macros.fiberGrams}g fibra). Calificación: ${s.nutritionalScore}/10.`;

    // Check if a log for today already exists
    const existingLog = logs.find((l) => l.date === today);

    let updatedDayLog: DayLog;
    if (existingLog) {
      updatedDayLog = {
        ...existingLog,
        journalText: `${existingLog.journalText}\n\n${mealNote}`,
        imageDataUrl: existingLog.imageDataUrl || mealScan.imageUrls[0],
        structured: {
          ...existingLog.structured,
          highYieldActions: [
            ...existingLog.structured.highYieldActions,
            {
              habit: `NutriScan ${mealScan.mealType}: ${s.dishName}`,
              effectOrConsequence: `Aporte de ${s.macros.proteinGrams}g proteína y micronutrientes clave (${s.micronutrients.slice(0, 2).join(', ')}).`,
            },
          ],
          vitalityScore: Math.min(100, (existingLog.structured.vitalityScore || 75) + 3),
        },
      };
    } else {
      updatedDayLog = {
        id: `log-${Date.now()}`,
        date: today,
        journalText: mealNote,
        selectedTags: ['🥗 Alimentación balanceada'],
        imageDataUrl: mealScan.imageUrls[0],
        rawMarkdown: mealScan.rawMarkdown,
        structured: {
          vitalityScore: Math.min(95, 70 + (s.nutritionalScore || 7) * 2),
          habitsRatio: {
            positiveCount: 1,
            negativeCount: 0,
          },
          dopamineLoad: s.macros.sugarsGrams > 25 ? 'Sobrestimulado' : 'Balanceado',
          highYieldActions: [
            {
              habit: `Alimentación consciente: ${s.dishName}`,
              effectOrConsequence: `Aporte de ${s.macros.proteinGrams}g proteína y micronutrientes clave (${s.micronutrients.slice(0, 2).join(', ')}).`,
            },
          ],
          energyLeaks: [],
          triggerMapping: {
            mainTrigger: `Elección nutricional consciente para ${mealScan.mealType}.`,
            systemOrEnvironmentFailure: s.hiddenIngredientsNotice,
          },
          redesignTomorrow: {
            environmentOptimization: 'Mantén vegetales frescos y agua fría a la vista en la cocina.',
            twoMinuteMicroHabit: s.optimizationTip,
          },
          identityAffirmation: `Hoy actuaste como una persona que honra su cuerpo eligiendo alimentos nutritivos y observando su impacto.`,
        },
        microActionCompleted: false,
        createdAt: Date.now(),
      };
    }

    const updatedLogs = addDayLog(updatedDayLog);
    setLogs(updatedLogs);
    setLatestLog(updatedDayLog);

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#10b981', '#3b82f6', '#f59e0b'],
    });
  };

  const handleToggleMicroAction = (id: string) => {
    const updated = toggleMicroAction(id);
    setLogs(updated);
    if (latestLog && latestLog.id === id) {
      setLatestLog({
        ...latestLog,
        microActionCompleted: !latestLog.microActionCompleted,
      });
    }
  };

  const handleUpdateLog = (updatedLog: DayLog) => {
    const updated = updateDayLog(updatedLog);
    setLogs(updated);
    if (latestLog && latestLog.id === updatedLog.id) {
      setLatestLog(updatedLog);
    }
  };

  const handleOpenChatWithPrompt = (prompt: string) => {
    setChatInitialPrompt(prompt);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Navbar with tabs, streaks and SOS button */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streakCount={calculateStreak()}
        totalLogs={logs.length}
        onOpenDisclaimer={() => setShowDisclaimer(true)}
        onOpenSOSModal={() => setShowSOSModal(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Tab 1: Daily Logger + Multimodal Vision (MODO 1) */}
        {activeTab === 'logger' && (
          <div className="space-y-8">
            <DailyLogger
              onLogCreated={handleLogCreated}
              onOpenSOSModal={() => setShowSOSModal(true)}
              onOpenLibraryModal={() => setShowLibraryModal(true)}
              onOpenChatWithPrompt={handleOpenChatWithPrompt}
            />

            {/* Display Latest or Just-Generated VitaTrack Daily Summary Card */}
            {latestLog && (
              <div id="latest-summary-section" className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-slate-900 text-lg">
                      Último Reporte Conductual ({latestLog.date})
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-xs text-slate-700 hover:text-slate-950 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Ver todos en Historial</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <DailySummaryCard
                  log={latestLog}
                  onToggleMicroAction={handleToggleMicroAction}
                  onUpdateLog={handleUpdateLog}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Nutrition Scanner & Macro Tracker (NutriScan) */}
        {activeTab === 'nutriscan' && (
          <NutritionScannerView
            scannedMeals={scannedMeals}
            onMealScanned={handleMealScanned}
            onAddToDailyLog={handleAddToDailyLog}
          />
        )}

        {/* Tab 3: Weekly Audit & Patterns (MODO 3) */}
        {activeTab === 'trends' && <WeeklyTrends logs={logs} />}

        {/* Tab 4: Interactive Empathetic Chat */}
        {activeTab === 'chat' && (
          <ChatAssistant
            initialPrompt={chatInitialPrompt}
            onClearInitialPrompt={() => setChatInitialPrompt(undefined)}
            onOpenSOSModal={() => setShowSOSModal(true)}
            latestLog={latestLog}
            onUpdateLog={handleUpdateLog}
          />
        )}

        {/* Tab 5: History & Timeline */}
        {activeTab === 'history' && (
          <HistoryList
            logs={logs}
            onToggleMicroAction={handleToggleMicroAction}
            onUpdateLog={handleUpdateLog}
          />
        )}
      </main>

      {/* Floating quick SOS shortcut button in bottom corner for mobile */}
      <div className="fixed bottom-5 right-5 z-30 sm:hidden">
        <button
          onClick={() => setShowSOSModal(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/40 animate-bounce"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>SOS Antojos</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">VitaTrack Engine v3.0</span>
            <span>•</span>
            <span>Extension NutriScan & Macro Tracker</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDisclaimer(true)}
              className="hover:text-slate-800 transition-colors"
            >
              Marco ético y aviso de salud
            </button>
            <span>•</span>
            <span className="text-emerald-700 font-medium">
              Alimentado por Gemini 3.8 Flash
            </span>
          </div>
        </div>
      </footer>

      {/* Habit Reference Library Modal */}
      <HabitReferenceLibraryModal
        isOpen={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
      />

      {/* SOS Impulses & Cravings Modal (Protocolo D.O.S.A.) */}
      <SOSProtocolModal
        isOpen={showSOSModal}
        onClose={() => setShowSOSModal(false)}
      />

      {/* Medical Disclaimer Modal */}
      <MedicalDisclaimerModal
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
      />
    </div>
  );
}
