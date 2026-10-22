import React, { useState, useEffect } from 'react';
import { DOSAResponse } from '../types';
import {
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Timer,
  CheckCircle2,
  Wind,
  Eye,
  Zap,
  Clock,
  X,
  Loader2,
  Brain,
} from 'lucide-react';

interface SOSProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SOSProtocolModal: React.FC<SOSProtocolModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedImpulse, setSelectedImpulse] = useState<string>('antojo');
  const [customNote, setCustomNote] = useState<string>('');
  const [dosaData, setDosaData] = useState<DOSAResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Breathing Guide State (Cyclic Sigh)
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale1' | 'inhale2' | 'exhale'>('inhale1');
  const [breathSecondsLeft, setBreathSecondsLeft] = useState(30);

  // 10-minute timer state
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Fetch or trigger default DOSA on open
  useEffect(() => {
    if (isOpen && !dosaData) {
      triggerDOSA('antojo');
    }
  }, [isOpen]);

  // Breathing timer loop
  useEffect(() => {
    let interval: any = null;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsBreathingActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive]);

  // Breathing rhythm animation phase (Cycle: 2s inhale1, 1s inhale2, 6s exhale = 9s cycle)
  useEffect(() => {
    let phaseTimeout: any = null;
    if (isBreathingActive) {
      const cycleBreathing = () => {
        setBreathPhase('inhale1');
        phaseTimeout = setTimeout(() => {
          setBreathPhase('inhale2');
          phaseTimeout = setTimeout(() => {
            setBreathPhase('exhale');
            phaseTimeout = setTimeout(() => {
              if (isBreathingActive) cycleBreathing();
            }, 5500);
          }, 1500);
        }, 2000);
      };
      cycleBreathing();
    }
    return () => clearTimeout(phaseTimeout);
  }, [isBreathingActive]);

  // 10-minute countdown loop
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const triggerDOSA = async (type: string) => {
    setIsLoading(true);
    setSelectedImpulse(type);
    try {
      const res = await fetch('/api/sos-impulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          impulseType: type,
          notes: customNote,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDosaData(data);
      }
    } catch (err) {
      console.error('Error fetching DOSA:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startBreathing = () => {
    setBreathSecondsLeft(30);
    setIsBreathingActive(true);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-rose-200/60 space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-rose-500/20">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                  Protocolo D.O.S.A.
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold uppercase tracking-wider">
                  Modo SOS
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Control de impulsos, antojos y procrastinación basado en neurobiología
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

        {/* Impulse Selector Chips */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-rose-500" />
            <span>¿Qué impulso estás experimentando en este instante?</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'antojo', label: '🍩 Antojo Dulce / Azúcar' },
              { id: 'procrastinacion', label: '📱 Procrastinación / Pantalla' },
              { id: 'comida_emocional', label: '🍕 Comida Chatarra' },
              { id: 'ansiedad', label: '⚡ Ansiedad / Estrés' },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => triggerDOSA(chip.id)}
                className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-all border ${
                  selectedImpulse === chip.id
                    ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs ring-1 ring-rose-400'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-10 flex flex-col items-center justify-center space-y-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            <p className="text-xs font-medium">VitaTrack calculando respuesta neurobiológica...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* PASO 1: DETENER (Suspiro Cíclico) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-teal-50/80 via-emerald-50/40 to-white border border-teal-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                  <Wind className="w-4 h-4 text-teal-600" />
                  <span>1. D - DETENER: Suspiro Cíclico (30 seg)</span>
                </div>
                <span className="text-xs font-semibold text-teal-700">Protocolo Huberman</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {dosaData?.detener.instructions ||
                  'Inhala profundamente por la nariz, toma una segunda inhalación corta adicional para colapsar los alvéolos, y exhala lento por la boca.'}
              </p>

              {/* Breath visualizer widget */}
              <div className="p-4 rounded-xl bg-white/80 border border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Expanding breathing orb */}
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <div
                      className={`absolute rounded-full transition-all duration-1000 ${
                        !isBreathingActive
                          ? 'w-10 h-10 bg-teal-200'
                          : breathPhase === 'inhale1'
                          ? 'w-12 h-12 bg-teal-400 scale-110'
                          : breathPhase === 'inhale2'
                          ? 'w-14 h-14 bg-emerald-500 scale-125'
                          : 'w-8 h-8 bg-teal-300 scale-90'
                      }`}
                    />
                    <span className="relative z-10 text-[10px] font-bold text-white text-center leading-tight">
                      {isBreathingActive
                        ? breathPhase === 'inhale1'
                          ? 'Inhala'
                          : breathPhase === 'inhale2'
                          ? '+Inhala'
                          : 'Exhala...'
                        : 'Calma'}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {isBreathingActive
                        ? `Tiempo restante: ${breathSecondsLeft}s`
                        : 'Ejercicio de 30 segundos'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Activa el nervio vago y desactiva el pico de adrenalina
                    </div>
                  </div>
                </div>

                <button
                  onClick={isBreathingActive ? () => setIsBreathingActive(false) : startBreathing}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isBreathingActive
                      ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      : 'bg-teal-600 text-white hover:bg-teal-700 shadow-xs'
                  }`}
                >
                  {isBreathingActive ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Detener</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Iniciar 30s de Respiración</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* PASO 2: OBSERVAR */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Eye className="w-4 h-4 text-amber-600" />
                <span>2. O - OBSERVAR: Separación Emocional vs Biológica</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs sm:text-sm font-semibold text-slate-800">
                ❓ {dosaData?.observar.question ||
                  '¿Te comerías una manzana entera o unas verduras ahora mismo? Si la respuesta es no, tu cerebro busca dopamina rápida, no combustible celular.'}
              </div>
              <p className="text-[11px] text-amber-800/80 italic pl-1">
                {dosaData?.observar.diagnosticNote ||
                  'La dopamina fásica crea urgencia artificial. Reconocerlo devuelve el control a tu corteza prefrontal.'}
              </p>
            </div>

            {/* PASO 3: SUSTITUIR */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>3. S - SUSTITUIR: Estimulación Limpia e Inmediata</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-start gap-2">
                  <span className="font-bold text-emerald-600">A:</span>
                  <span className="text-slate-800 font-medium">
                    {dosaData?.sustituir.alternative1 ||
                      'Bebe un vaso de agua muy fría con una pizca de sal o limón para un choque somatosensorial.'}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-start gap-2">
                  <span className="font-bold text-emerald-600">B:</span>
                  <span className="text-slate-800 font-medium">
                    {dosaData?.sustituir.alternative2 ||
                      'Haz 10 sentadillas o 1 minuto de estiramiento para reclutar glucógeno y liberar endorfinas.'}
                  </span>
                </div>
              </div>
            </div>

            {/* PASO 4: APLAZAR (Regla de los 10 minutos) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-100">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>4. A - APLAZAR: Regla de los 10 Minutos</span>
                </div>
                <span className="text-xs text-amber-400 font-mono">
                  {formatTimer(timerSeconds)}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {dosaData?.aplazar.rule ||
                  'No te prohibas la acción; simplemente aplázala 10 minutos. En el 80% de los casos, la ola dopaminérgica desciende y el deseo compulsivo desaparece.'}
              </p>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pausar Cuenta</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Iniciar 10 Minutos</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(600);
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white transition-colors"
                    title="Reiniciar a 10 min"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {timerSeconds === 0 && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡10 minutos superados! Evalúa ahora tu deseo.</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end border-t border-slate-100 pt-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors"
          >
            Listo, regresar al panel
          </button>
        </div>
      </div>
    </div>
  );
};
