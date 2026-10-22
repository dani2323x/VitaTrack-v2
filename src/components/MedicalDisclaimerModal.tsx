import React from 'react';
import { X, ShieldAlert, Heart, Sparkles, Stethoscope, Scale } from 'lucide-react';

interface MedicalDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MedicalDisclaimerModal: React.FC<MedicalDisclaimerModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Compromiso Ético & Aviso de Salud
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <Stethoscope className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 block mb-0.5">
                No constituye asesoramiento médico ni diagnóstico
              </span>
              VitaTrack es una herramienta de autoobservación, reflexión y bienestar de hábitos de estilo de vida. Nunca sustituye la evaluación, diagnóstico o tratamiento de un médico o profesional de la salud cualificado.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-3">
            <Heart className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-950 block mb-0.5">
                Filosofía de Acompañamiento sin Juicios
              </span>
              Entendemos que los seres humanos enfrentamos días caóticos, estrés, cansancio y antojos. Tu valor no depende de la perfección. Analizamos patrones para construir claridad, no para alimentar la culpa.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3">
            <Scale className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-950 block mb-0.5">
                Micro-Acciones Progresivas
              </span>
              Los grandes cambios de salud se logran con pequeños pasos continuos y alcanzables (1 sola acción simple cada día) en vez de restricciones drásticas insostenibles.
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm transition-colors"
        >
          Entendido, continuar a VitaTrack
        </button>
      </div>
    </div>
  );
};
