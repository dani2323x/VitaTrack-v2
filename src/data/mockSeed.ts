import { DayLog } from '../types';

export const INITIAL_SEED_LOGS: DayLog[] = [
  {
    id: 'seed-1',
    date: '2026-10-19',
    journalText: 'Caminata de 25 minutos con luz natural matutina. En el trabajo sentí mucho estrés y pedí pizza con refresco azucarado. Por la tarde bebí 1.8L de agua y descansé 7 horas.',
    selectedTags: ['walk', 'water', 'fastfood', 'sugar', 'outdoors'],
    rawMarkdown: `# 📈 REPORTE DE RENDIMIENTO DIARIO

### 📊 MÉTRAME Y SCORES
• **Score de Vitalidad General:** 68
• **Ratio de Hábitos:** 🟢 3 vs 🔴 2
• **Nivel de Carga Dopaminérgica:** Sobrestimulado

### 🔍 DESGLOSE CONDUCTUAL
🟢 **Acciones de Alta Rentabilidad (Positivas):**
• Caminata de 25 min con luz solar matutina ➔ *Efecto:* Sincronización del ritmo circadiano y activación de dopamina tónica saludable según el protocolo Huberman.
• Hidratación de 1.8L de agua ➔ *Efecto:* Mantenimiento de la volemia y prevención de fatiga celular vespertina.
• 7 horas de descanso reparador ➔ *Efecto:* Restauración del sistema glinfático cerebral y consolidación cognitiva.

🔴 **Fugas de Energía y Fricción (Negativas):**
• Almuerzo de pizza con refresco azucarado ➔ *Consecuencia:* Pico glucémico pronunciado seguido de un choque de adenosina y letargo a las 15:30.
• Sedentarismo post-almuerzo frente al monitor ➔ *Consecuencia:* Disminución de la sensibilidad periférica a la insulina y rigidez lumbar.

🧠 **MAPEO DE DISPARADORES Y ENTORNO**
• **Disparador Principal:** Estrés post-reunión de las 13:00 que activó el sistema de recompensa inmediata para aliviar la sobrecarga cognitiva.
• **Falla de Sistema/Entorno:** No tener comida rica en proteína lista en la oficina, facilitando el pedido compulsivo por app en 2 clics (fricción cero para el mal hábito).

⚡ **REDISEÑO PARA MAÑANA (Regla de los 2 Minutos)**
• **Optimización de Entorno:** Deja una botella metálica de agua llena y una porción de frutos secos visible en tu escritorio antes de salir.
• **Micro-Hábito Objetivo:** Al sentir la primera señal de tensión a las 13:00, haz 3 respiraciones con Suspiro Cíclico de 30 segundos antes de tocar el teléfono.`,
    structured: {
      vitalityScore: 68,
      habitsRatio: {
        positiveCount: 3,
        negativeCount: 2,
      },
      dopamineLoad: 'Sobrestimulado',
      highYieldActions: [
        {
          habit: 'Caminata de 25 min con luz solar matutina',
          effectOrConsequence: 'Sincronización del ritmo circadiano y activación de dopamina tónica saludable.',
        },
        {
          habit: 'Hidratación consciente (1.8L)',
          effectOrConsequence: 'Mantenimiento del volumen plasmático y energía mitocondrial.',
        },
        {
          habit: '7 horas de sueño reparador',
          effectOrConsequence: 'Despeje glinfático y recuperación del córtex prefrontal.',
        },
      ],
      energyLeaks: [
        {
          habit: 'Pizza con refresco por estrés laboral',
          effectOrConsequence: 'Pico de glucosa e insulina seguido de desplome de energía vespertina.',
        },
        {
          habit: 'Fricción cero en apps de ultraprocesados',
          effectOrConsequence: 'Refuerzo del bucle de recompensa dopaminérgica artificial ante la frustración.',
        },
      ],
      triggerMapping: {
        mainTrigger: 'Estrés agudo post-reunión laboral de mediodía.',
        systemOrEnvironmentFailure: 'Falta de provisión previa de proteína y apps de delivery en la pantalla de inicio.',
      },
      redesignTomorrow: {
        environmentOptimization: 'Mueve las apps de comida a una carpeta oculta y coloca snacks limpios a la vista.',
        twoMinuteMicroHabit: 'Realiza 3 ciclos de Suspiro Cíclico (30 seg) al sonar el fin de la reunión.',
      },
      identityAffirmation: 'Hoy actuaste como una persona que honra su movimiento matutino incluso en jornadas de alta exigencia.',
    },
    microActionCompleted: true,
    createdAt: Date.now() - 3 * 86400000,
  },
  {
    id: 'seed-2',
    date: '2026-10-20',
    journalText: 'Dormí 8 horas completas. Desayuno con 3 huevos revueltos, espinacas y té verde. 40 minutos de pesas. Por la noche caí en 90 minutos de scroll en TikTok en la cama a oscuras.',
    selectedTags: ['sleep', 'veggies', 'exercise', 'screens_late'],
    rawMarkdown: `# 📈 REPORTE DE RENDIMIENTO DIARIO

### 📊 MÉTRAME Y SCORES
• **Score de Vitalidad General:** 82
• **Ratio de Hábitos:** 🟢 4 vs 🔴 1
• **Nivel de Carga Dopaminérgica:** Balanceado

### 🔍 DESGLOSE CONDUCTUAL
🟢 **Acciones de Alta Rentabilidad (Positivas):**
• 8 horas de sueño profundo ➔ *Efecto:* Optimización de la hormona del crecimiento y regulación de leptina/grelina.
• Desayuno hiperproteico (30g) con té verde ➔ *Efecto:* Saciedad sostenida sin variabilidad glucémica y soporte neuroprotector por L-teanina.
• Entrenamiento de sobrecarga progresiva (40 min) ➔ *Efecto:* Sensibilidad insulínica muscular y liberación de mioquinas antiinflamatorias.
• Hidratación matutina ➔ *Efecto:* Reabastecimiento de electrolitos tras el ayuno nocturno.

🔴 **Fugas de Energía y Fricción (Negativas):**
• 90 minutos de scroll algorítmico en la cama con luz azul ➔ *Consecuencia:* Supresión inmediata de melatonina y activación excesiva de la amígdala antes del sueño.

🧠 **MAPEO DE DISPARADORES Y ENTORNO**
• **Disparador Principal:** Cansancio físico vespertino que busca relajación pasiva sin coste energético en la cama.
• **Falla de Sistema/Entorno:** El cargador del teléfono está situado justo en la mesita de noche junto a la almohada (disparador visible y accesible).

⚡ **REDISEÑO PARA MAÑANA (Regla de los 2 Minutos)**
• **Optimización de Entorno:** Conecta el cargador del smartphone en la cómoda a 3 metros de la cama o en el salón.
• **Micro-Hábito Objetivo:** Deja un libro físico abierto encima de la almohada antes de apagar la luz principal.`,
    structured: {
      vitalityScore: 82,
      habitsRatio: {
        positiveCount: 4,
        negativeCount: 1,
      },
      dopamineLoad: 'Balanceado',
      highYieldActions: [
        {
          habit: '8h de sueño regenerador',
          effectOrConsequence: 'Regulación del eje hipotálamo-hipófisis y óptima reparación neuromuscular.',
        },
        {
          habit: 'Desayuno rico en proteína (3 huevos + espinacas)',
          effectOrConsequence: 'Curva de glucosa plana y síntesis de neurotransmisores matutinos.',
        },
        {
          habit: 'Entrenamiento de fuerza (40 min)',
          effectOrConsequence: 'Aumento del gasto metabólico basal y liberación de endorfinas.',
        },
      ],
      energyLeaks: [
        {
          habit: 'Scroll nocturno en la cama (90 min)',
          effectOrConsequence: 'Desplazamiento del sueño profundo y sobreestimulación de dopamina fasica.',
        },
      ],
      triggerMapping: {
        mainTrigger: 'Transición pasiva a la cama con fatiga física sin desconexión ritual.',
        systemOrEnvironmentFailure: 'Cargador de móvil a menos de 40 cm de la mano en la mesita de noche.',
      },
      redesignTomorrow: {
        environmentOptimization: 'Muda el cargador al otro extremo de la habitación (añade fricción intencional).',
        twoMinuteMicroHabit: 'Lee 1 página de un libro físico apenas apoyes la cabeza en la almohada.',
      },
      identityAffirmation: 'Hoy actuaste como un atleta de la vida cotidiana que alimenta y desafía a su cuerpo con disciplina.',
    },
    microActionCompleted: true,
    createdAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'seed-3',
    date: '2026-10-21',
    journalText: 'Día de maratón laboral sentado 8 horas. 4 tazas de café para compensar el cansancio. A las 20:00 hice 12 minutos de estiramientos conscientes y cené pescado con brócoli al vapor.',
    selectedTags: ['sedentary', 'coffee_excess', 'meditation', 'veggies'],
    rawMarkdown: `# 📈 REPORTE DE RENDIMIENTO DIARIO

### 📊 MÉTRAME Y SCORES
• **Score de Vitalidad General:** 71
• **Ratio de Hábitos:** 🟢 2 vs 🔴 2
• **Nivel de Carga Dopaminérgica:** Sobrestimulado

### 🔍 DESGLOSE CONDUCTUAL
🟢 **Acciones de Alta Rentabilidad (Positivas):**
• 12 minutos de movilidad espinal y respiración diafragmática ➔ *Efecto:* Estimulación del nervio vago y descompresión de discos vertebrales tras la quietud prolongada.
• Cena limpia (pescado blanco y brócoli al vapor) ➔ *Efecto:* Digestión ligera sin carga termogénica excesiva propicia para el descanso nocturno.

🔴 **Fugas de Energía y Fricción (Negativas):**
• Sedentarismo estático de 8 horas ➔ *Consecuencia:* Caída de la enzima lipoproteína lipasa (LPL) y aumento del estancamiento venoso.
• Ingesta de 4 cafés (último a las 17:30) ➔ *Consecuencia:* Bloqueo tardío de los receptores de adenosina, fragmentando la arquitectura del sueño profundo.

🧠 **MAPEO DE DISPARADORES Y ENTORNO**
• **Disparador Principal:** Sensación de somnolencia a media tarde asociada a la postura estática y aire viciado.
• **Falla de Sistema/Entorno:** Taza de café como respuesta automática por defecto en lugar de una pausa de movimiento o ventilación.

⚡ **REDISEÑO PARA MAÑANA (Regla de los 2 Minutos)**
• **Optimización de Entorno:** Coloca una botella de agua fresca en el camino a la cafetera y abre la ventana 2 minutos cada hora.
• **Micro-Hábito Objetivo:** Cada vez que vayas a pulsar la cafetera por la tarde, haz primero 10 elevaciones de talones y bebe medio vaso de agua.`,
    structured: {
      vitalityScore: 71,
      habitsRatio: {
        positiveCount: 2,
        negativeCount: 2,
      },
      dopamineLoad: 'Sobrestimulado',
      highYieldActions: [
        {
          habit: '12 min de estiramientos y respiración vaga',
          effectOrConsequence: 'Activación del sistema parasimpático y alivio de carga postural.',
        },
        {
          habit: 'Cena densa en micronutrientes y baja en grasa saturada',
          effectOrConsequence: 'Optimización de la fase REM sin molestias gastrointestinales.',
        },
      ],
      energyLeaks: [
        {
          habit: '8h de inmovilidad continua',
          effectOrConsequence: 'Disminución de la sensibilidad a la glucosa y sobrecarga de psoas.',
        },
        {
          habit: 'Cafeína después de las 14:00',
          effectOrConsequence: 'Vida media de la cafeína (5-7h) reduce en un 30% el sueño de ondas lentas.',
        },
      ],
      triggerMapping: {
        mainTrigger: 'Caída de energía a las 16:00 interpretada como necesidad de estimulante químico.',
        systemOrEnvironmentFailure: 'Acceso inmediato a la cafetera sin barrera de fricción ni alternativas activas.',
      },
      redesignTomorrow: {
        environmentOptimization: 'Guarda las cápsulas de café con cafeína fuera de la vista a partir de las 14:00.',
        twoMinuteMicroHabit: 'Levántate durante 90 segundos entre llamadas para mirar a lo lejos y estirar la columna.',
      },
      identityAffirmation: 'Hoy actuaste como un profesional consciente que sabe rescatar el autocuidado al caer la tarde.',
    },
    microActionCompleted: false,
    createdAt: Date.now() - 1 * 86400000,
  },
];
