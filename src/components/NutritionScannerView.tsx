import React, { useState, useRef } from 'react';
import { NutriScanResult } from '../types';
import { SAMPLE_MEALS } from '../data/sampleMeals';
import { NutriScanCard } from './NutriScanCard';
import {
  Camera,
  UploadCloud,
  Sparkles,
  Loader2,
  Trash2,
  X,
  Plus,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface NutritionScannerViewProps {
  scannedMeals: NutriScanResult[];
  onMealScanned: (result: NutriScanResult) => void;
  onAddToDailyLog: (scan: NutriScanResult) => void;
}

export const NutritionScannerView: React.FC<NutritionScannerViewProps> = ({
  scannedMeals,
  onMealScanned,
  onAddToDailyLog,
}) => {
  const [selectedMealType, setSelectedMealType] = useState<
    'Desayuno' | 'Almuerzo' | 'Cena' | 'Snack' | 'Bebida'
  >('Almuerzo');
  const [notes, setNotes] = useState('');
  const [imagesList, setImagesList] = useState<
    Array<{ base64Image: string; mimeType: string; previewUrl: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [latestScan, setLatestScan] = useState<NutriScanResult | null>(
    scannedMeals.length > 0 ? scannedMeals[0] : null
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // File handling for multiple photos
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);

    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setErrorMsg('Por favor selecciona archivos de imagen válidos.');
      return;
    }

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64Clean = dataUrl.split(',')[1];
        setImagesList((prev) => [
          ...prev,
          {
            base64Image: base64Clean,
            mimeType: file.type,
            previewUrl: dataUrl,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImageAt = (index: number) => {
    setImagesList((prev) => prev.filter((_, i) => i !== index));
  };

  const loadSample = (index: number) => {
    const sample = SAMPLE_MEALS[index];
    if (sample) {
      // Convert SVG DataUrl to base64
      const base64Clean = sample.svgDataUrl.includes('base64,')
        ? sample.svgDataUrl.split('base64,')[1]
        : btoa(sample.svgDataUrl.replace('data:image/svg+xml;utf8,', ''));

      setImagesList([
        {
          base64Image: base64Clean,
          mimeType: 'image/svg+xml',
          previewUrl: sample.svgDataUrl,
        },
      ]);
      setSelectedMealType(sample.mealType as any);
      setNotes(sample.description);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imagesList.length === 0) {
      setErrorMsg('Por favor sube o toma al menos una foto de tu plato o etiqueta nutricional.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const payloadImages = imagesList.map((img) => ({
        base64Image: img.base64Image,
        mimeType: img.mimeType,
      }));

      const res = await fetch('/api/nutriscan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: payloadImages,
          mealType: selectedMealType,
          notes: notes.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Fallo al procesar el escaneo nutricional.');
      }

      const data = await res.json();
      const newScanResult: NutriScanResult = {
        id: `nutri-${Date.now()}`,
        mealType: selectedMealType,
        imageUrls: imagesList.map((img) => img.previewUrl),
        rawMarkdown: data.rawMarkdown,
        structured: data.structured,
        createdAt: Date.now(),
      };

      onMealScanned(newScanResult);
      setLatestScan(newScanResult);
      setImagesList([]);
      setNotes('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error en la conexión con NutriScan.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate daily totals from today's scanned meals
  const dailyTotals = scannedMeals.reduce(
    (acc, meal) => {
      acc.calories += meal.structured?.calories || 0;
      acc.protein += meal.structured?.macros?.proteinGrams || 0;
      acc.carbs += meal.structured?.macros?.carbsGrams || 0;
      acc.fats += meal.structured?.macros?.fatsGrams || 0;
      acc.fiber += meal.structured?.macros?.fiberGrams || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
  );

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl sm:text-3xl">🥑</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Nutrition Scanner & Macro Tracker
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                NutriScan
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Sube una o varias fotos de tu comida (plato, empaque o bebida) para estimar macros, densidad nutricional y micronutrientes.
            </p>
          </div>
        </div>

        {/* Daily Macros Accumulated Summary */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              <span>Totales Acumulados de Comidas Escaneadas</span>
            </span>
            <span className="text-xs text-slate-400">
              {scannedMeals.length} {scannedMeals.length === 1 ? 'comida' : 'comidas'} hoy
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Calorías</span>
              <span className="text-lg font-black text-white">~{Math.round(dailyTotals.calories)}</span>
              <span className="text-[10px] text-slate-400 block">kcal</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
              <span className="text-[10px] uppercase text-rose-400 block font-bold">Proteínas</span>
              <span className="text-lg font-black text-rose-300">~{Math.round(dailyTotals.protein)}g</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
              <span className="text-[10px] uppercase text-amber-400 block font-bold">Carbohidratos</span>
              <span className="text-lg font-black text-amber-300">~{Math.round(dailyTotals.carbs)}g</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
              <span className="text-[10px] uppercase text-blue-400 block font-bold">Grasas</span>
              <span className="text-lg font-black text-blue-300">~{Math.round(dailyTotals.fats)}g</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
              <span className="text-[10px] uppercase text-emerald-400 block font-bold">Fibra</span>
              <span className="text-lg font-black text-emerald-300">~{Math.round(dailyTotals.fiber)}g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Upload and Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-6">
        <form onSubmit={handleScan} className="space-y-5">
          {/* Meal Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Tipo de Comida
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'Desayuno', icon: '🌅' },
                { id: 'Almuerzo', icon: '🥗' },
                { id: 'Cena', icon: '🌙' },
                { id: 'Snack', icon: '🍎' },
                { id: 'Bebida', icon: '🥤' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMealType(m.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedMealType === m.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="mr-1.5">{m.icon}</span>
                  <span>{m.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Photo Dropzone & Multi-image picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Fotos de la Comida (Plato, laterales o etiqueta nutricional)
              </label>
              <span className="text-xs text-slate-400">
                {imagesList.length} {imagesList.length === 1 ? 'foto lista' : 'fotos listas'}
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
              accept="image/*"
              multiple
              className="hidden"
            />

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFiles(e.dataTransfer.files);
              }}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl p-6 sm:p-8 text-center cursor-pointer bg-slate-50/60 hover:bg-emerald-50/30 transition-all space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Haz clic para subir o arrastra una o varias fotos
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Soporta platos completos, bebidas y fotos de tablas nutricionales para lectura OCR
                </p>
              </div>
            </div>

            {/* Preview Strip */}
            {imagesList.length > 0 && (
              <div className="flex items-center gap-3 overflow-x-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                {imagesList.map((img, idx) => (
                  <div key={idx} className="relative group shrink-0">
                    <img
                      src={img.previewUrl}
                      alt={`Foto ${idx + 1}`}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageAt(idx)}
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md hover:bg-rose-700 transition-colors"
                      title="Eliminar foto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 text-slate-400 hover:text-emerald-600 flex flex-col items-center justify-center text-xs font-semibold shrink-0 transition-colors"
                >
                  <Plus className="w-5 h-5 mb-1" />
                  <span>Añadir otra</span>
                </button>
              </div>
            )}
          </div>

          {/* Notes Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              3. Notas Opcionales (Ingredientes ocultos, marcas o preparación)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Cocinado con 1 cucharada de aceite de oliva, café con leche de soja sin azúcar..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Sample quick test presets */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs text-slate-500 font-medium">Probar con ejemplos:</span>
            {SAMPLE_MEALS.map((meal, idx) => (
              <button
                key={meal.id}
                type="button"
                onClick={() => loadSample(idx)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
              >
                {meal.name}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200">
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || imagesList.length === 0}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-emerald-300" />
                <span>NutriScan analizando proporciones y macronutrientes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-emerald-300" />
                <span>Escanear Comida con NutriScan</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Latest Scan Result Display */}
      {latestScan && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-lg">
                Resultado de Análisis Visual Reciente
              </h3>
            </div>
          </div>

          <NutriScanCard
            scan={latestScan}
            onAddToDailyLog={onAddToDailyLog}
          />
        </div>
      )}

      {/* Previously Scanned Meals Today */}
      {scannedMeals.length > 1 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-4">
          <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Otras Comidas Escaneadas ({scannedMeals.length})</span>
          </h4>

          <div className="space-y-4">
            {scannedMeals.slice(1).map((scan) => (
              <NutriScanCard
                key={scan.id}
                scan={scan}
                onAddToDailyLog={onAddToDailyLog}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
