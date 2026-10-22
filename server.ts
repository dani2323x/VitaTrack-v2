import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '35mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const VITATRACK_V3_SYSTEM_INSTRUCTION = `Eres "VitaTrack Engine v3.0", un sistema avanzado de inteligencia conductual, biohacking accesible y psicología del hábito (basado en James Clear, B.J. Fogg y Andrew Huberman). Tu objetivo es analizar, predecir y optimizar el rendimiento físico, mental y emocional del usuario mediante el seguimiento de sus hábitos diarios.

### 1. ARQUITECTURA DE PROCESAMIENTO
Cada vez que el usuario ingrese datos (texto, audio o fotos), debes evaluar 4 dimensiones clave:
1. Nivel de Fricción (¿Qué tan fácil/difícil fue realizar la acción?).
2. Impacto en Dopamina y Energía (¿Sostuvo la energía o generó un pico seguido de un bajón?).
3. Entorno y Señales (¿Qué elemento del entorno desencadenó la conducta?).
4. Balance de Identidad (¿Esta acción acerca o aleja al usuario de su mejor versión?).

### 2. COMANDOS Y MODOS DE EJECUCIÓN

#### 🔷 MODO 1: REGISTRO DIARIO COMPLETO (Por defecto)
Si el usuario describe su día o envía fotos/capturas, genera este reporte EXACTO:

---
# 📈 REPORTE DE RENDIMIENTO DIARIO

### 📊 MÉTRAME Y SCORES
• **Score de Vitalidad General:** [0 - 100]
• **Ratio de Hábitos:** 🟢 [N° Positivos] vs 🔴 [N° Negativos]
• **Nivel de Carga Dopaminérgica:** [Bajo / Balanceado / Sobrestimulado]

### 🔍 DESGLOSE CONDUCTUAL
🟢 **Acciones de Alta Rentabilidad (Positivas):**
• [Hábito] ➔ *Efecto:* [Impacto biológico/mental inmediato]

🔴 **Fugas de Energía y Fricción (Negativas):**
• [Hábito] ➔ *Consecuencia:* [Impacto en energía, foco o descanso]

🧠 **MAPEO DE DISPARADORES Y ENTORNO**
• **Disparador Principal:** [Ej: Estrés post-reunión / Pantallas antes de dormir]
• **Falla de Sistema/Entorno:** [Ej: Tener dulces a la vista / No preparar la ropa de deporte la noche anterior]

⚡ **REDISEÑO PARA MAÑANA (Regla de los 2 Minutos)**
• **Optimización de Entorno:** [1 cambio físico en su espacio para mañana]
• **Micro-Hábito Objetivo:** [1 acción que tome menos de 2 minutos]
---

#### 🔷 MODO 2: "SOS / CONTROL DE IMPULSOS Y ANTOJOS"
(Se activa si el usuario escribe: "SOS", "Tengo un antojo", "Quiero procrastinar" o "Ansiedad").
Responde con el protocolo **D.O.S.A.**:
1. **Detener:** Ejercicio de respiración guiada de 30 segundos (Suspiro Cíclico).
2. **Observar:** Hazle 1 pregunta clave para separar el hambre/impulso emocional del físico.
3. **Sustituir:** Ofrece 2 alternativas de estimulación limpia e inmediata (ej. agua helada, estiramiento, movimiento de 1 min).
4. **Aplazar:** "Regla de los 10 minutos" (esperar 10 min antes de tomar la decisión).

#### 🔷 MODO 3: "AUDITORÍA SEMANAL Y PATRONES"
(Se activa al pedir "Resumen semanal", "Auditoría" o "Patrones").
1. **Tabla de Frecuencia:** Muestra los hábitos más recurrentes.
2. **Análisis del "Día Fuga":** Identifica el día de la semana con menor rendimiento y su causa raíz.
3. **Ajuste de Algoritmo Personal:** Propón eliminar 1 mal hábito cambiando solo su señal previa.

#### 🔷 MODO 4: "DIAGNÓSTICO DE VISIÓN Y ARCHIVOS (NutriScan)"
Si el usuario adjunta una o varias FOTOS de su comida (desayuno, almuerzo, cena, snack o bebida), activa automáticamente el protocolo **NutriScan** con la siguiente ESTRUCTURA EXACTA:

---
📸 **ANÁLISIS DE NUTRICIÓN VISUAL (NutriScan)**

🍽️ **Identificación del Plato:**
• [Nombre descriptivo del plato y lista detallada de ingredientes visualmente detectados]

📊 **Estimación Nutricional Diaria:**
• **Calorías Totales:** ~[X] kcal

🥑 **Macronutrientes Principales:**
• 🥩 **Proteínas:** ~[X]g
• 🍞 **Carbohidratos:** ~[X]g (de los cuales azúcares: ~[X]g)
• 🥑 **Grasas:** ~[X]g (de las cuales saturadas: ~[X]g)
• 🥗 **Fibra:** ~[X]g

🥦 **Micronutrientes Destacados:**
• [Lista de 3 a 4 vitaminas/minerales clave detectados en la comida, ej: Vitamina C, Potasio, Hierro, Magnesio]

⚠️ **Ajustes y Precauciones de Estimación:**
• [Menciona brevemente si hay ingredientes "ocultos" probables, como aceites de cocina, salsas o azúcares añadidos que no se ven a simple vista].

🎯 **Calificación Nutricional (1 al 10):** [Nota / 10]
• **Sugerencia de Optimización:** [1 consejo rápido para mejorar la densidad nutricional de esta comida la próxima vez].
---

REGLAS NUTRISCAN:
1. Haz la mejor estimación posible basada en las proporciones visibles en el plato (usando cubiertos o tamaño del plato como referencia).
2. Si la foto es borrosa o un ingrediente es ambiguo (ej: tipo de carne o salsa), da la estimación más probable y haz una pregunta aclaratoria rápida al final.
3. Si el usuario sube fotos de etiquetas nutricionales o empaques, lee el OCR y extrae los datos exactos por porción en lugar de estimarlos.
4. Conecta el resultado con el "Score de Vitalidad" diario del usuario.

Si adjunta capturas de Smartwatch/Pantalla: Extrae métricas clave (sueño REM, tiempo en redes, pasos) e intégralas al Score del día.

### 3. BIBLIOTECA DE REFERENCIA: HÁBITOS DE ALTA RENTABILIDAD Y FUGAS DE ENERGÍA
Utiliza la siguiente clasificación científica para identificar, etiquetar y priorizar los hábitos detectados en el texto o fotos del usuario:

🟢 ACCIONES DE ALTA RENTABILIDAD (High ROI Habits)
Identifica estas acciones como impulsadores de energía, enfoque y longevidad:
1. Salud Circadiana y Luz:
   - Exposición a luz solar en los primeros 30-60 min tras despertar (regulación de cortisol/melatonina).
   - Bloqueo o reducción de luz azul 2 horas antes de dormir.
2. Dinámica de Energía y Movimiento:
   - "Pausas activas" o micro-movimientos (2 min de caminata por cada 45 min sentado).
   - Entrenamiento de fuerza o resistencia zona 2.
   - Duchas de agua fría o exposición al frío (sube dopamina de forma sostenida).
3. Nutrición y Digestión:
   - Desayuno alto en proteína/grasas saludables y bajo en carbohidratos refinados (evita picos de glucosa).
   - Ventana de ayuno nocturno de al menos 12 horas.
   - Hidratación con electrolitos o una pizca de sal marina al despertar.
4. Enfoque Cognitivo y Mente:
   - Bloques de trabajo profundo (Deep Work) sin teléfono visible.
   - Práctica de respiración corta o "Suspiro Cíclico" (reducir activación simpática).
   - Desconexión digital consciente (Phone-free mornings/evenings).

🔴 FUGAS DE ENERGÍA Y FRICCIÓN (Energy Drains & High Friction)
Identifica estos patrones como penalizadores de vitalidad, enfoque y descanso:
1. Fugas por Sobrestimulación Dopaminérgica:
   - "Dopamine Stacking" (ej: comer mientras miras pantallas o escuchar podcasts mientras respondes mensajes).
   - Scroll infinito al despertar (pone al cerebro en modo reactivo y eleva la ansiedad).
   - Consumo de azúcar o carbohidratos simples a primera hora del día (causa crash glucémico a mediodía).
2. Fugas de Energía Inaudita y Fricción:
   - Multitarea o interrupciones frecuentes (genera "residuo de atención").
   - Consumo de cafeína pasadas las 14:00 PM (bloquea la adenosina y destruye la fase de sueño profundo).
   - Cenar pesado o muy cerca de la hora de dormir (eleva la frecuencia cardíaca nocturna).
3. Fricción del Entorno (Obstáculos pasivos):
   - Dejar alimentos ultraprocesados en lugares visibles o al alcance de la mano.
   - Dormir con el teléfono al lado de la cama (fricción cero para caer en la tentación nocturna/matutina).
   - Entorno desordenado en el área de trabajo (aumenta la carga cognitiva subconsciente).

INSTRUCCIÓN DE APLICACIÓN OBLIGATORIA:
Cuando el usuario mencione una acción relacionada, nómbrala explícitamente usando estos términos y explícale en 1 frase breve el "Por qué" biológico o psicológico.

### 4. REGLAS CORE Y TONO
1. **Cero Juicios, 100% Datos:** Trata los "errores" o "fallos" como experimentos científicos de los que aprender.
2. **Sin Lenguaje Genérico:** Sé ultra-específico. No digas "come mejor", di "añade una fuente de proteína al almuerzo".
3. **Psicología de Identidad:** Refuerza la identidad del usuario con frases tipo: "Hoy actuaste como una persona que prioriza su descanso".
4. **Seguridad:** Si se detectan conductas extremas o trastornos alimentarios/ansiedad severa, recomienda derivación profesional.

### 5. MÓDULO DE EDICIÓN Y PERSONALIZACIÓN DE HÁBITOS POR EL USUARIO
El usuario tiene control total sobre su registro. Reconoce los siguientes comandos de edición y responde ejecutando la acción indicada de forma clara, directa y actualizada:

---

#### 1. COMANDOS DE AÑADIR HÁBITOS MANUALES
Si el usuario escribe frases como: 
• "Añade el hábito: [Nombre]" 
• "Registra también que [Hábito/Acción]"
• "Suma [X] a mis hábitos de hoy"

👉 **Acción de la IA:**
1. Clasifica automáticamente el nuevo hábito como 🟢 **Saludable** o 🔴 **No Saludable**.
2. Calcula su impacto instantáneo en el **Score de Vitalidad** diario (ej: "+5 puntos" o "-10 puntos").
3. Muestra una confirmación rápida y presenta la lista del día **recalculada e integrada**.

---

#### 2. COMANDOS DE EDICIÓN Y CORRECCIÓN
Si el usuario escribe frases como: 
• "Modifica [Hábito A] por [Hábito B]"
• "En lugar de [X], en realidad hice [Y]"
• "Ajusta la cantidad de [Hábito] a [Nueva cantidad]"

👉 **Acción de la IA:**
1. Corrige la entrada sin pedir explicaciones ni juzgar.
2. Recalcula los macronutrientes, calorías, nivel de dopamina o Score de Vitalidad según corresponda.
3. Devuelve los datos corregidos.

---

#### 3. COMANDOS DE ELIMINACIÓN
Si el usuario escribe frases como: 
• "Borra el hábito [X]" 
• "Elimina [X] de mi registro de hoy"

👉 **Acción de la IA:**
1. Confirma la eliminación del hábito.
2. Actualiza los totales del día omitiendo dicho elemento.

---

#### 4. CREACIÓN DE HÁBITOS PERSONALIZADOS RECURRENTES
Si el usuario escribe frases como:
• "Quiero definir un nuevo hábito diario: [Ej: Tomar creatina 5g / Leer 15 min]"

👉 **Acción de la IA:**
1. Confirma que este hábito ha sido guardado en el perfil del usuario para sus registros futuros.
2. Si el usuario no lo menciona en su relato diario, VitaTrack le preguntará al final del día:
   "¿Cumpliste hoy con tu hábito personalizado: [Nombre del hábito]?"

---

#### 5. ESTRUCTURA EXACTA DE CONFIRMACIÓN DE EDICIÓN
Siempre que se ejecute una modificación (añadir, editar, borrar), responde utilizando EXACTAMENTE esta plantilla limpia:

---
✅ **REGISTRO ACTUALIZADO**
• **Cambio realizado:** [Añadido / Editado / Eliminado] ➔ *"[Detalle del cambio]"*
• **Nuevo Score de Vitalidad:** [Puntuación actualizada / 100]

📋 **Lista Revisada del Día:**
• 🟢 **Saludables:** [Lista actualizada de hábitos saludables]
• 🔴 **No Saludables:** [Lista actualizada de hábitos no saludables o fugas de energía]
---
`;

// Helper: Call Gemini with fallback models if 503 or transient failure occurs
async function generateWithFallback(params: {
  contents: any;
  config?: any;
  models?: string[];
}) {
  const modelsToTry = params.models || ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      console.warn(`Attempt with ${model} failed:`, err?.message || err);
      lastError = err;
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  throw lastError || new Error('No se pudo conectar con los modelos de Gemini.');
}

// Endpoint 1: Analyze Day (MODO 1: Registro Diario Completo + MODO 4: Visión integrada si hay imagen)
app.post('/api/analyze-day', async (req, res) => {
  try {
    const { journalText, tags = [], date, base64Image, mimeType, recurrentHabits = [] } = req.body;

    if (!journalText && (!tags || tags.length === 0) && !base64Image) {
      return res.status(400).json({ error: 'Por favor proporciona notas, hábitos o una imagen para analizar.' });
    }

    const recurrentContext = recurrentHabits.length > 0
      ? `\nHábitos personalizados recurrentes del usuario: ${recurrentHabits.join(', ')}.\nREGLA: Si alguno de estos hábitos NO fue mencionado ni marcado en el día, identifícalo en "unmentionedRecurrentHabits" y añade al final del "rawMarkdown" la pregunta exacta:\n"¿Cumpliste hoy con tu hábito personalizado: [Nombre del hábito]?"`
      : '';

    const textPrompt = `Fecha del registro: ${date || 'Hoy'}
Hábitos rápidos seleccionados: ${tags.length > 0 ? tags.join(', ') : 'Ninguno'}
Relato o notas del usuario:
"""
${journalText || 'Sin relato textual adicional.'}
"""
${base64Image ? 'NOTA: El usuario adjuntó una imagen (comida o captura de smartwatch/pantalla). Aplica también el MODO 4 (Diagnóstico de visión) e integra sus hallazgos biológicos en el Score de Vitalidad y en el desglose conductual.' : ''}
${recurrentContext}

Actúa como VitaTrack Engine v3.0.
Genera la respuesta oficial en el campo "rawMarkdown" siguiendo EXACTAMENTE la estructura del MODO 1:
# 📈 REPORTE DE RENDIMIENTO DIARIO
...
Y rellena simultáneamente el objeto "structured" para alimentar la interfaz visual de biohacking y psicología del hábito.`;

    let contentPayload: any = textPrompt;
    if (base64Image) {
      const imagePart = {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: base64Image,
        },
      };
      contentPayload = {
        parts: [imagePart, { text: textPrompt }],
      };
    }

    const response = await generateWithFallback({
      contents: contentPayload,
      config: {
        systemInstruction: VITATRACK_V3_SYSTEM_INSTRUCTION,
        temperature: 0.6,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rawMarkdown: {
              type: Type.STRING,
              description: 'Texto exacto en Markdown siguiendo la plantilla del MODO 1: # 📈 REPORTE DE RENDIMIENTO DIARIO...',
            },
            structured: {
              type: Type.OBJECT,
              properties: {
                vitalityScore: {
                  type: Type.INTEGER,
                  description: 'Score de Vitalidad General de 0 a 100',
                },
                habitsRatio: {
                  type: Type.OBJECT,
                  properties: {
                    positiveCount: { type: Type.INTEGER },
                    negativeCount: { type: Type.INTEGER },
                  },
                  required: ['positiveCount', 'negativeCount'],
                },
                dopamineLoad: {
                  type: Type.STRING,
                  description: 'Bajo | Balanceado | Sobrestimulado',
                },
                highYieldActions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      habit: { type: Type.STRING },
                      effectOrConsequence: { type: Type.STRING },
                    },
                    required: ['habit', 'effectOrConsequence'],
                  },
                },
                energyLeaks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      habit: { type: Type.STRING },
                      effectOrConsequence: { type: Type.STRING },
                    },
                    required: ['habit', 'effectOrConsequence'],
                  },
                },
                triggerMapping: {
                  type: Type.OBJECT,
                  properties: {
                    mainTrigger: { type: Type.STRING },
                    systemOrEnvironmentFailure: { type: Type.STRING },
                  },
                  required: ['mainTrigger', 'systemOrEnvironmentFailure'],
                },
                redesignTomorrow: {
                  type: Type.OBJECT,
                  properties: {
                    environmentOptimization: { type: Type.STRING },
                    twoMinuteMicroHabit: { type: Type.STRING },
                  },
                  required: ['environmentOptimization', 'twoMinuteMicroHabit'],
                },
                identityAffirmation: {
                  type: Type.STRING,
                  description: 'Frase que refuerza la identidad del usuario basada en James Clear (ej: "Hoy actuaste como alguien que...")',
                },
                unmentionedRecurrentHabits: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Lista de hábitos recurrentes que no fueron mencionados en el registro',
                },
              },
              required: [
                'vitalityScore',
                'habitsRatio',
                'dopamineLoad',
                'highYieldActions',
                'energyLeaks',
                'triggerMapping',
                'redesignTomorrow',
              ],
            },
          },
          required: ['rawMarkdown', 'structured'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    // Build rawMarkdown fallback if missing
    let rawMarkdown = parsed.rawMarkdown;
    if (!rawMarkdown && parsed.structured) {
      const s = parsed.structured;
      const posLines = (s.highYieldActions || [])
        .map((a: any) => `• ${a.habit} ➔ *Efecto:* ${a.effectOrConsequence}`)
        .join('\n');
      const negLines = (s.energyLeaks || [])
        .map((a: any) => `• ${a.habit} ➔ *Consecuencia:* ${a.effectOrConsequence}`)
        .join('\n');

      rawMarkdown = `# 📈 REPORTE DE RENDIMIENTO DIARIO

### 📊 MÉTRAME Y SCORES
• **Score de Vitalidad General:** ${s.vitalityScore || 75}
• **Ratio de Hábitos:** 🟢 ${s.habitsRatio?.positiveCount || 0} vs 🔴 ${s.habitsRatio?.negativeCount || 0}
• **Nivel de Carga Dopaminérgica:** ${s.dopamineLoad || 'Balanceado'}

### 🔍 DESGLOSE CONDUCTUAL
🟢 **Acciones de Alta Rentabilidad (Positivas):**
${posLines || '• Sin acciones registradas'}

🔴 **Fugas de Energía y Fricción (Negativas):**
${negLines || '• Sin fugas detectadas'}

🧠 **MAPEO DE DISPARADORES Y ENTORNO**
• **Disparador Principal:** ${s.triggerMapping?.mainTrigger || 'No especificado'}
• **Falla de Sistema/Entorno:** ${s.triggerMapping?.systemOrEnvironmentFailure || 'No especificado'}

⚡ **REDISEÑO PARA MAÑANA (Regla de los 2 Minutos)**
• **Optimización de Entorno:** ${s.redesignTomorrow?.environmentOptimization || 'Ajusta tu espacio de descanso'}
• **Micro-Hábito Objetivo:** ${s.redesignTomorrow?.twoMinuteMicroHabit || '1 acción de menos de 2 minutos'}`;

      if (parsed.structured.unmentionedRecurrentHabits?.length) {
        rawMarkdown += `\n\n❓ **RECORDATORIO DE HÁBITOS PERSONALIZADOS:**\n${parsed.structured.unmentionedRecurrentHabits
          .map((h: string) => `• ¿Cumpliste hoy con tu hábito personalizado: **${h}**?`)
          .join('\n')}`;
      }
    }

    res.json({
      rawMarkdown,
      structured: parsed.structured,
    });
  } catch (error: any) {
    console.error('Error in /api/analyze-day:', error);
    res.status(500).json({ error: error?.message || 'Error procesando el análisis con VitaTrack Engine v3.0.' });
  }
});

// Endpoint 1B: MÓDULO DE EDICIÓN Y PERSONALIZACIÓN DE HÁBITOS
// Permite añadir, editar, corregir o eliminar hábitos con recálculo instantáneo y confirmación exacta
app.post('/api/edit-log', async (req, res) => {
  try {
    const {
      action, // 'add' | 'edit' | 'delete' | 'nl_command'
      commandText = '',
      habitName = '',
      newHabitName = '',
      habitCategory = 'auto', // 'healthy' | 'unhealthy' | 'auto'
      currentLog,
    } = req.body;

    if (!currentLog || !currentLog.structured) {
      return res.status(400).json({ error: 'Se requiere el registro actual (currentLog) para aplicar modificaciones.' });
    }

    const editPrompt = `El usuario desea modificar su registro diario de hábitos siguiendo el:
"MÓDULO DE EDICIÓN Y PERSONALIZACIÓN DE HÁBITOS POR EL USUARIO"

Datos de la modificación:
- Tipo de acción: ${action}
- Comando textual ingresado por el usuario: "${commandText}"
- Nombre del hábito objetivo: "${habitName}"
- Nuevo nombre o reemplazo: "${newHabitName}"
- Categoría indicada: ${habitCategory}

Estado ACTUAL del registro del día:
- Score de Vitalidad actual: ${currentLog.structured.vitalityScore}
- Ratio actual: 🟢 ${currentLog.structured.highYieldActions?.length || 0} vs 🔴 ${currentLog.structured.energyLeaks?.length || 0}
- Hábitos Saludables actuales: ${(currentLog.structured.highYieldActions || []).map((h: any) => h.habit).join(' | ') || 'Ninguno'}
- Fugas de Energía / No Saludables actuales: ${(currentLog.structured.energyLeaks || []).map((h: any) => h.habit).join(' | ') || 'Ninguno'}
- Disparador principal actual: ${currentLog.structured.triggerMapping?.mainTrigger || ''}
- Rediseño actual: ${currentLog.structured.redesignTomorrow?.twoMinuteMicroHabit || ''}

REGLAS DE PROCESAMIENTO:
1. Si la acción es "add" (Añadir):
   - Clasifica automáticamente como 🟢 Saludable o 🔴 No Saludable (salvo si se forzó la categoría).
   - Estima el impacto instantáneo en el Score de Vitalidad: hábitos saludables suman (+3 a +10 pts); hábitos no saludables restan (-4 a -12 pts).
   - Genera una explicación concisa del Efecto biológico/mental (para saludable) o Consecuencia (para no saludable) basada en la biblioteca científica de VitaTrack (Huberman/Clear).
   - Agrega la acción a la lista correspondiente y actualiza el ratio.
   - Detalle del cambio: ej. 'Añadido "Caminata 20 min" (+6 pts al Score)'.

2. Si la acción es "edit" (Modificar / Corregir):
   - Reemplaza el hábito indicado por el nuevo hábito sin juzgar.
   - Recalcula el Score de Vitalidad (la diferencia entre el impacto del hábito previo y el nuevo).
   - Actualiza la lista y los ratios.
   - Detalle del cambio: ej. 'Modificado "Cafeína a las 18:00" por "Té de manzanilla" (+8 pts al Score)'.

3. Si la acción es "delete" (Eliminar / Borrar):
   - Elimina el hábito de la lista correspondiente.
   - Si se eliminó un hábito no saludable, el Score de Vitalidad sube (+3 a +8 pts). Si se eliminó uno saludable, el Score baja (-3 a -8 pts).
   - Actualiza los ratios.
   - Detalle del cambio: ej. 'Eliminado "Fumar 2 cigarrillos" (+7 pts al Score)'.

4. Si la acción es "nl_command" (Comando en lenguaje natural):
   - Detecta automáticamente si el usuario quiso añadir, modificar o borrar.
   - Aplica las reglas anteriores correspondientes.

5. ESTRUCTURA EXACTA DE CONFIRMACIÓN OBLIGATORIA (campo "rawConfirmation"):
Debes generar EXACTAMENTE este formato Markdown:
✅ **REGISTRO ACTUALIZADO**
• **Cambio realizado:** [Añadido / Editado / Eliminado] ➔ *"[Detalle del cambio]"*
• **Nuevo Score de Vitalidad:** [Puntuación actualizada / 100]

📋 **Lista Revisada del Día:**
• 🟢 **Saludables:** [Lista actualizada separada por comas o viñetas cortas]
• 🔴 **No Saludables:** [Lista actualizada separada por comas o viñetas cortas]

6. Reconstruye el objeto "updatedLog" manteniendo la estructura completa del DayLog con los nuevos valores recalculados.`;

    const response = await generateWithFallback({
      contents: editPrompt,
      config: {
        systemInstruction: VITATRACK_V3_SYSTEM_INSTRUCTION,
        temperature: 0.4,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            actionTaken: {
              type: Type.STRING,
              description: 'Añadido | Editado | Eliminado',
            },
            detail: {
              type: Type.STRING,
              description: 'Detalle exacto del cambio realizado',
            },
            vitalityScoreChange: {
              type: Type.INTEGER,
              description: 'Diferencia en puntos respecto al score anterior (ej: +5, -10)',
            },
            newVitalityScore: {
              type: Type.INTEGER,
              description: 'Nuevo Score de Vitalidad entre 0 y 100',
            },
            rawConfirmation: {
              type: Type.STRING,
              description: 'Texto exacto con la estructura obligatoria de confirmación de edición',
            },
            updatedStructured: {
              type: Type.OBJECT,
              properties: {
                vitalityScore: { type: Type.INTEGER },
                habitsRatio: {
                  type: Type.OBJECT,
                  properties: {
                    positiveCount: { type: Type.INTEGER },
                    negativeCount: { type: Type.INTEGER },
                  },
                  required: ['positiveCount', 'negativeCount'],
                },
                dopamineLoad: { type: Type.STRING },
                highYieldActions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      habit: { type: Type.STRING },
                      effectOrConsequence: { type: Type.STRING },
                    },
                    required: ['habit', 'effectOrConsequence'],
                  },
                },
                energyLeaks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      habit: { type: Type.STRING },
                      effectOrConsequence: { type: Type.STRING },
                    },
                    required: ['habit', 'effectOrConsequence'],
                  },
                },
                triggerMapping: {
                  type: Type.OBJECT,
                  properties: {
                    mainTrigger: { type: Type.STRING },
                    systemOrEnvironmentFailure: { type: Type.STRING },
                  },
                  required: ['mainTrigger', 'systemOrEnvironmentFailure'],
                },
                redesignTomorrow: {
                  type: Type.OBJECT,
                  properties: {
                    environmentOptimization: { type: Type.STRING },
                    twoMinuteMicroHabit: { type: Type.STRING },
                  },
                  required: ['environmentOptimization', 'twoMinuteMicroHabit'],
                },
                identityAffirmation: { type: Type.STRING },
              },
              required: [
                'vitalityScore',
                'habitsRatio',
                'dopamineLoad',
                'highYieldActions',
                'energyLeaks',
                'triggerMapping',
                'redesignTomorrow',
              ],
            },
          },
          required: [
            'actionTaken',
            'detail',
            'vitalityScoreChange',
            'newVitalityScore',
            'rawConfirmation',
            'updatedStructured',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    // Build or refine rawConfirmation
    let rawConfirmation = parsed.rawConfirmation;
    const u = parsed.updatedStructured;
    const posList = (u.highYieldActions || []).map((h: any) => h.habit).join(', ') || 'Ninguno';
    const negList = (u.energyLeaks || []).map((h: any) => h.habit).join(', ') || 'Ninguno';

    if (!rawConfirmation) {
      rawConfirmation = `✅ **REGISTRO ACTUALIZADO**
• **Cambio realizado:** ${parsed.actionTaken || 'Actualizado'} ➔ *"${parsed.detail || 'Modificación aplicada'}"*
• **Nuevo Score de Vitalidad:** ${parsed.newVitalityScore || u.vitalityScore} / 100

📋 **Lista Revisada del Día:**
• 🟢 **Saludables:** ${posList}
• 🔴 **No Saludables:** ${negList}`;
    }

    // Build the updated full DayLog
    const posLines = (u.highYieldActions || [])
      .map((a: any) => `• ${a.habit} ➔ *Efecto:* ${a.effectOrConsequence}`)
      .join('\n');
    const negLines = (u.energyLeaks || [])
      .map((a: any) => `• ${a.habit} ➔ *Consecuencia:* ${a.effectOrConsequence}`)
      .join('\n');

    const updatedRawMarkdown = `# 📈 REPORTE DE RENDIMIENTO DIARIO

### 📊 MÉTRAME Y SCORES
• **Score de Vitalidad General:** ${u.vitalityScore}
• **Ratio de Hábitos:** 🟢 ${u.habitsRatio?.positiveCount || 0} vs 🔴 ${u.habitsRatio?.negativeCount || 0}
• **Nivel de Carga Dopaminérgica:** ${u.dopamineLoad || 'Balanceado'}

### 🔍 DESGLOSE CONDUCTUAL
🟢 **Acciones de Alta Rentabilidad (Positivas):**
${posLines || '• Sin acciones registradas'}

🔴 **Fugas de Energía y Fricción (Negativas):**
${negLines || '• Sin fugas detectadas'}

🧠 **MAPEO DE DISPARADORES Y ENTORNO**
• **Disparador Principal:** ${u.triggerMapping?.mainTrigger || 'No especificado'}
• **Falla de Sistema/Entorno:** ${u.triggerMapping?.systemOrEnvironmentFailure || 'No especificado'}

⚡ **REDISEÑO PARA MAÑANA (Regla de los 2 Minutos)**
• **Optimización de Entorno:** ${u.redesignTomorrow?.environmentOptimization || 'Ajusta tu entorno'}
• **Micro-Hábito Objetivo:** ${u.redesignTomorrow?.twoMinuteMicroHabit || '1 acción de menos de 2 minutos'}`;

    const updatedLog: any = {
      ...currentLog,
      rawMarkdown: updatedRawMarkdown,
      structured: u,
    };

    res.json({
      rawConfirmation,
      actionTaken: parsed.actionTaken,
      detail: parsed.detail,
      vitalityScoreChange: parsed.vitalityScoreChange,
      newVitalityScore: parsed.newVitalityScore,
      updatedLog,
    });
  } catch (error: any) {
    console.error('Error in /api/edit-log:', error);
    res.status(500).json({ error: error?.message || 'Error al modificar el registro de hábitos.' });
  }
});


// Endpoint 2: MODO 2 - "SOS / CONTROL DE IMPULSOS Y ANTOJOS" (Protocolo D.O.S.A.)
app.post('/api/sos-impulse', async (req, res) => {
  try {
    const { impulseType = 'antojo', notes = '' } = req.body;

    const prompt = `El usuario ha presionado el botón de emergencia conductual MODO 2: SOS / CONTROL DE IMPULSOS Y ANTOJOS.
Tipo de impulso: ${impulseType} (Antojo / Procrastinación / Ansiedad / Impulso digital).
Detalles proporcionados por el usuario:
"""
${notes || 'Necesito ayuda inmediata para no ceder al impulso.'}
"""

Aplica rigurosamente el protocolo **D.O.S.A.** de VitaTrack Engine v3.0:
1. **Detener:** Ejercicio de respiración guiada de 30 segundos (Suspiro Cíclico de Andrew Huberman: dos inhalaciones nasales, una exhalación bucal prolongada).
2. **Observar:** Hazle 1 pregunta clave ultra-específica para separar el impulso emocional (dopamina barata / escape) de la necesidad física real.
3. **Sustituir:** Ofrece 2 alternativas de estimulación limpia e inmediata (ej. choque térmico con agua helada, 10 sentadillas, estiramiento espinal).
4. **Aplazar:** La regla de los 10 minutos (esperar 10 min antes de actuar, explicando la neurobiología del deseo en la corteza prefrontal).`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction: VITATRACK_V3_SYSTEM_INSTRUCTION,
        temperature: 0.6,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detener: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                instructions: { type: Type.STRING },
                durationSeconds: { type: Type.INTEGER },
              },
              required: ['title', 'instructions', 'durationSeconds'],
            },
            observar: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                diagnosticNote: { type: Type.STRING },
              },
              required: ['question', 'diagnosticNote'],
            },
            sustituir: {
              type: Type.OBJECT,
              properties: {
                alternative1: { type: Type.STRING },
                alternative2: { type: Type.STRING },
              },
              required: ['alternative1', 'alternative2'],
            },
            aplazar: {
              type: Type.OBJECT,
              properties: {
                rule: { type: Type.STRING },
                recommendedMinutes: { type: Type.INTEGER },
              },
              required: ['rule', 'recommendedMinutes'],
            },
            fullText: {
              type: Type.STRING,
              description: 'Explicación motivadora y neurobiológica completa del protocolo DOSA para este momento.',
            },
          },
          required: ['detener', 'observar', 'sustituir', 'aplazar', 'fullText'],
        },
      },
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error: any) {
    console.error('Error in /api/sos-impulse:', error);
    res.status(500).json({ error: error?.message || 'Error activando el protocolo SOS.' });
  }
});

// Endpoint 3: MODO 3 - "AUDITORÍA SEMANAL Y PATRONES"
app.post('/api/weekly-summary', async (req, res) => {
  try {
    const { history = [] } = req.body;

    if (!Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ error: 'No hay suficientes días registrados para la auditoría.' });
    }

    const historyPrompt = history
      .map(
        (entry: any, i: number) =>
          `Día ${i + 1} (${entry.date || 'Reciente'}):
- Score Vitalidad: ${entry.vitalityScore ?? entry.balance ?? 'N/A'}
- Nivel Dopaminérgico: ${entry.dopamineLoad || 'Balanceado'}
- Acciones Alta Rentabilidad: ${(entry.highYieldActions || entry.healthyHabits || [])
            .map((h: any) => (typeof h === 'string' ? h : h.habit || h))
            .join(', ')}
- Fugas de Energía / Fricción: ${(entry.energyLeaks || entry.unhealthyHabits || [])
            .map((h: any) => (typeof h === 'string' ? h : h.habit || h))
            .join(', ')}
- Disparador / Falla de entorno: ${entry.triggerMapping?.mainTrigger || 'N/A'}`
      )
      .join('\n\n');

    const prompt = `Aplica el MODO 3: "AUDITORÍA SEMANAL Y PATRONES" de VitaTrack Engine v3.0 con la siguiente base de datos:

${historyPrompt}

Estructura tu reporte con:
1. **Tabla de Frecuencia:** Hábitos más recurrentes clasificados por rentabilidad dopaminérgica y fricción.
2. **Análisis del "Día Fuga":** Identifica el día de la semana con menor rendimiento y su causa raíz (ej. fatiga acumulada, sobreestimulación de pantallas, omisión de señal).
3. **Ajuste de Algoritmo Personal:** Propón eliminar 1 mal hábito cambiando únicamente su señal previa o reduciendo la fricción del hábito alternativo deseado.
4. Recuerda: Cero juicios, 100% datos y ciencia del hábito (James Clear, Huberman, Fogg).`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction: VITATRACK_V3_SYSTEM_INSTRUCTION,
        temperature: 0.6,
      },
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error('Error in /api/weekly-summary:', error);
    res.status(500).json({ error: error?.message || 'Error al generar la auditoría semanal.' });
  }
});

// Endpoint 4: MODO 4 - "DIAGNÓSTICO DE VISIÓN Y ARCHIVOS" (Standalone Food / Smartwatch Analysis)
app.post('/api/vision-diagnostic', async (req, res) => {
  try {
    const { base64Image, mimeType = 'image/jpeg', userNotes = '' } = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: 'Se requiere una imagen para el diagnóstico de visión.' });
    }

    const prompt = `Analiza esta imagen con el MODO 4 de VitaTrack Engine v3.0:
- Si es COMIDA: Evalúa densidad nutricional, índice glucémico estimado, presencia de micronutrientes, balance de macronutrientes (proteína, fibra, grasas buenas, carbohidratos complejos) y su impacto proyectado en la energía y glucosa.
- Si es SMARTWATCH / TIEMPO EN PANTALLA: Extrae métricas clave (sueño REM/profundo, tiempo total de uso de redes, pasos, frecuencia cardíaca en reposo) y evalúa su impacto en el sistema nervioso autónomo.
- Notas del usuario: "${userNotes}"

Sé ultra-específico, analítico y constructivo. Cero juicios de valor.`;

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Image,
      },
    };

    const response = await generateWithFallback({
      contents: {
        parts: [imagePart, { text: prompt }],
      },
      config: {
        systemInstruction: VITATRACK_V3_SYSTEM_INSTRUCTION,
        temperature: 0.5,
      },
    });

    res.json({ diagnosis: response.text });
  } catch (error: any) {
    console.error('Error in /api/vision-diagnostic:', error);
    res.status(500).json({ error: error?.message || 'Error en el diagnóstico visual.' });
  }
});

// Endpoint: MÓDULO EXTENSIÓN: NUTRITION SCANNER & MACRO TRACKER (NutriScan)
app.post('/api/nutriscan', async (req, res) => {
  try {
    const { images = [], base64Image, mimeType, mealType = 'Almuerzo', notes = '' } = req.body;

    const imageList: Array<{ base64Image: string; mimeType: string }> = [];
    if (Array.isArray(images) && images.length > 0) {
      imageList.push(...images);
    } else if (base64Image) {
      imageList.push({ base64Image, mimeType: mimeType || 'image/jpeg' });
    }

    if (imageList.length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos una foto de la comida para NutriScan.' });
    }

    const nutriscanPrompt = `Activa el protocolo oficial "NutriScan" de VitaTrack Extension para esta comida (${mealType}).
Notas adicionales del usuario: "${notes}"

Instrucciones y reglas:
1. Haz la mejor estimación posible basada en las proporciones visibles en el plato (usando cubiertos o el tamaño del plato como referencia de escala).
2. Si la foto es borrosa o un ingrediente es ambiguo (ej: tipo de carne o salsa), da la estimación más probable y haz una pregunta aclaratoria rápida al final.
3. Si el usuario sube fotos de etiquetas nutricionales o empaques, lee el OCR y extrae los datos exactos por porción en lugar de estimarlos.
4. Conecta el resultado con el "Score de Vitalidad" diario del usuario.

Genera en el campo "rawMarkdown" la respuesta con la siguiente ESTRUCTURA EXACTA:

📸 **ANÁLISIS DE NUTRICIÓN VISUAL (NutriScan)**

🍽️ **Identificación del Plato:**
• [Nombre descriptivo del plato y lista detallada de ingredientes visualmente detectados]

📊 **Estimación Nutricional Diaria:**
• **Calorías Totales:** ~[X] kcal

🥑 **Macronutrientes Principales:**
• 🥩 **Proteínas:** ~[X]g
• 🍞 **Carbohidratos:** ~[X]g (de los cuales azúcares: ~[X]g)
• 🥑 **Grasas:** ~[X]g (de las cuales saturadas: ~[X]g)
• 🥗 **Fibra:** ~[X]g

🥦 **Micronutrientes Destacados:**
• [Lista de 3 a 4 vitaminas/minerales clave detectados en la comida, ej: Vitamina C, Potasio, Hierro, Magnesio]

⚠️ **Ajustes y Precauciones de Estimación:**
• [Menciona brevemente si hay ingredientes "ocultos" probables, como aceites de cocina, salsas o azúcares añadidos que no se ven a simple vista].

🎯 **Calificación Nutricional (1 al 10):** [Nota / 10]
• **Sugerencia de Optimización:** [1 consejo rápido para mejorar la densidad nutricional de esta comida la próxima vez].

Simultáneamente, genera el objeto "structured" en JSON para alimentar los componentes visuales de macronutrientes.`;

    const parts: any[] = imageList.map((img) => ({
      inlineData: {
        mimeType: img.mimeType || 'image/jpeg',
        data: img.base64Image,
      },
    }));
    parts.push({ text: nutriscanPrompt });

    const response = await generateWithFallback({
      contents: { parts },
      config: {
        systemInstruction: VITATRACK_V3_SYSTEM_INSTRUCTION,
        temperature: 0.4,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rawMarkdown: {
              type: Type.STRING,
              description: 'Texto exacto formateado según la plantilla NutriScan.',
            },
            structured: {
              type: Type.OBJECT,
              properties: {
                dishName: { type: Type.STRING },
                detectedIngredients: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                calories: { type: Type.INTEGER },
                macros: {
                  type: Type.OBJECT,
                  properties: {
                    proteinGrams: { type: Type.NUMBER },
                    carbsGrams: { type: Type.NUMBER },
                    sugarsGrams: { type: Type.NUMBER },
                    fatsGrams: { type: Type.NUMBER },
                    saturatedFatsGrams: { type: Type.NUMBER },
                    fiberGrams: { type: Type.NUMBER },
                  },
                  required: ['proteinGrams', 'carbsGrams', 'sugarsGrams', 'fatsGrams', 'saturatedFatsGrams', 'fiberGrams'],
                },
                micronutrients: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                hiddenIngredientsNotice: { type: Type.STRING },
                nutritionalScore: { type: Type.INTEGER },
                optimizationTip: { type: Type.STRING },
                clarificationQuestion: { type: Type.STRING },
                vitalityConnection: { type: Type.STRING },
              },
              required: [
                'dishName',
                'detectedIngredients',
                'calories',
                'macros',
                'micronutrients',
                'hiddenIngredientsNotice',
                'nutritionalScore',
                'optimizationTip',
                'vitalityConnection',
              ],
            },
          },
          required: ['rawMarkdown', 'structured'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    // Build rawMarkdown fallback if missing
    let rawMarkdown = parsed.rawMarkdown;
    if (!rawMarkdown && parsed.structured) {
      const s = parsed.structured;
      rawMarkdown = `📸 **ANÁLISIS DE NUTRICIÓN VISUAL (NutriScan)**

🍽️ **Identificación del Plato:**
• ${s.dishName || 'Plato detectado'}: ${(s.detectedIngredients || []).join(', ')}

📊 **Estimación Nutricional Diaria:**
• **Calorías Totales:** ~${s.calories || 0} kcal

🥑 **Macronutrientes Principales:**
• 🥩 **Proteínas:** ~${s.macros?.proteinGrams || 0}g
• 🍞 **Carbohidratos:** ~${s.macros?.carbsGrams || 0}g (de los cuales azúcares: ~${s.macros?.sugarsGrams || 0}g)
• 🥑 **Grasas:** ~${s.macros?.fatsGrams || 0}g (de las cuales saturadas: ~${s.macros?.saturatedFatsGrams || 0}g)
• 🥗 **Fibra:** ~${s.macros?.fiberGrams || 0}g

🥦 **Micronutrientes Destacados:**
• ${(s.micronutrients || []).join(', ')}

⚠️ **Ajustes y Precauciones de Estimación:**
• ${s.hiddenIngredientsNotice || 'Estimación visual sujeta a aceites o condimentos ocultos.'}

🎯 **Calificación Nutricional (1 al 10):** ${s.nutritionalScore || 8} / 10
• **Sugerencia de Optimización:** ${s.optimizationTip || 'Añade una fuente adicional de fibra o vegetales frescos.'}`;
    }

    res.json({
      rawMarkdown,
      structured: parsed.structured,
    });
  } catch (error: any) {
    console.error('Error in /api/nutriscan:', error);
    res.status(500).json({ error: error?.message || 'Error procesando el análisis de NutriScan.' });
  }
});

// Endpoint 5: Chat interactivo con detección de modos
app.post('/api/chat', async (req, res) => {
  try {
    const { messages = [] } = req.body;

    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await generateWithFallback({
      contents: formattedContents,
      config: {
        systemInstruction: VITATRACK_V3_SYSTEM_INSTRUCTION,
        temperature: 0.6,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: error?.message || 'Error en la conversación con VitaTrack Engine.' });
  }
});

// Endpoint 6: Transcripción de audio (Gemini 3.5 Transcribe)
app.post('/api/transcribe', async (req, res) => {
  try {
    const { base64Audio, mimeType = 'audio/webm' } = req.body;

    if (!base64Audio) {
      return res.status(400).json({ error: 'No se recibió audio para transcribir.' });
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Audio,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'Transcribe exactamente lo que dice el usuario en este audio en español. Devuelve únicamente el texto transcrito sin explicaciones adicionales.',
          },
        ],
      },
    });

    res.json({ text: response.text?.trim() || '' });
  } catch (error: any) {
    console.error('Error in /api/transcribe:', error);
    res.status(500).json({ error: error?.message || 'Error al transcribir el audio.' });
  }
});

// Endpoint 7: Text-to-Speech (Gemini 3.8 Flash Lite TTS)
app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Texto requerido.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 450),
              speechMetadata: {
                style: 'Calm, clear, analytical, scientifically grounded behavioral mentor',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No se pudo generar el audio.' });
    }

    res.json({ audioBase64: base64Audio });
  } catch (error: any) {
    console.error('Error in /api/tts:', error);
    res.status(500).json({ error: error?.message || 'Error al generar la voz.' });
  }
});

// Mount Vite in dev or static in prod
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

if (!isProd) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`VitaTrack Engine v3.0 running on http://0.0.0.0:${PORT}`);
});
