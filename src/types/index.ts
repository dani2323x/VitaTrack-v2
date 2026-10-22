export interface HabitAction {
  habit: string;
  effectOrConsequence: string;
}

export interface DayLog {
  id: string;
  date: string; // YYYY-MM-DD
  journalText: string;
  selectedTags: string[];
  imageDataUrl?: string;
  imageAnalysis?: {
    type: 'food' | 'smartwatch' | 'general';
    summary: string;
    metrics?: Record<string, string | number>;
  };
  rawMarkdown: string;
  structured: {
    vitalityScore: number; // 0 - 100
    habitsRatio: {
      positiveCount: number;
      negativeCount: number;
    };
    dopamineLoad: 'Bajo' | 'Balanceado' | 'Sobrestimulado';
    highYieldActions: HabitAction[]; // 🟢 Acciones de Alta Rentabilidad
    energyLeaks: HabitAction[]; // 🔴 Fugas de Energía y Fricción
    triggerMapping: {
      mainTrigger: string;
      systemOrEnvironmentFailure: string;
    };
    redesignTomorrow: {
      environmentOptimization: string; // 1 cambio físico en su espacio
      twoMinuteMicroHabit: string; // 1 acción < 2 min
    };
    identityAffirmation?: string; // "Hoy actuaste como una persona que..."
    unmentionedRecurrentHabits?: string[];
  };
  microActionCompleted?: boolean;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  updatedLog?: DayLog; // Optional if this message modified today's log
}

export interface DOSAResponse {
  detener: {
    title: string;
    instructions: string;
    durationSeconds: number;
  };
  observar: {
    question: string;
    diagnosticNote: string;
  };
  sustituir: {
    alternative1: string;
    alternative2: string;
  };
  aplazar: {
    rule: string;
    recommendedMinutes: number;
  };
  fullText: string;
}

export interface VisionAnalysisResult {
  category: 'food' | 'smartwatch' | 'environment' | 'general';
  title: string;
  keyFindings: string[];
  nutritionalOrMetricEvaluation: string;
  recommendedIntegration: string;
  rawMarkdown: string;
}

export interface NutriScanResult {
  id: string;
  mealType: 'Desayuno' | 'Almuerzo' | 'Cena' | 'Snack' | 'Bebida' | 'General';
  imageUrls: string[];
  rawMarkdown: string;
  structured: {
    dishName: string;
    detectedIngredients: string[];
    calories: number;
    macros: {
      proteinGrams: number;
      carbsGrams: number;
      sugarsGrams: number;
      fatsGrams: number;
      saturatedFatsGrams: number;
      fiberGrams: number;
    };
    micronutrients: string[];
    hiddenIngredientsNotice: string;
    nutritionalScore: number; // 1 to 10
    optimizationTip: string;
    clarificationQuestion?: string;
    vitalityConnection: string;
  };
  createdAt: number;
}

export interface CustomRecurrentHabit {
  id: string;
  name: string;
  category: 'healthy' | 'unhealthy';
  createdAt: number;
}

export interface EditConfirmationResult {
  rawConfirmation: string;
  actionTaken: 'Añadido' | 'Editado' | 'Eliminado';
  detail: string;
  vitalityScoreChange: number;
  newVitalityScore: number;
  updatedLog: DayLog;
}
