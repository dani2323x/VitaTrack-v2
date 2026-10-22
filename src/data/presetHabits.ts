export interface PresetTag {
  id: string;
  label: string;
  scientificTerm: string;
  category: 'healthy' | 'unhealthy';
  subCategory: string;
  biologicalWhy: string;
  icon: string;
}

export const PRESET_HABITS: PresetTag[] = [
  // 🟢 ACCIONES DE ALTA RENTABILIDAD (High ROI Habits)
  // 1. Salud Circadiana y Luz
  {
    id: 'sunlight_morning',
    label: 'Luz solar matutina (30-60 min)',
    scientificTerm: 'Anclaje Circadiano Fotónico',
    category: 'healthy',
    subCategory: 'Salud Circadiana y Luz',
    biologicalWhy: 'Sincroniza el núcleo supraquiasmático para regular el pico de cortisol matutino y la liberación nocturna de melatonina.',
    icon: '☀️',
  },
  {
    id: 'blue_light_block',
    label: 'Bloqueo de luz azul (2h pre-sueño)',
    scientificTerm: 'Atenuación Espectral Nocturna',
    category: 'healthy',
    subCategory: 'Salud Circadiana y Luz',
    biologicalWhy: 'Evita la supresión artificial de melatonina y prepara la arquitectura del sueño profundo de ondas lentas.',
    icon: '🕶️',
  },

  // 2. Dinámica de Energía y Movimiento
  {
    id: 'active_breaks',
    label: 'Pausas activas (2m cada 45m)',
    scientificTerm: 'Micro-Movimientos Anti-Sedentarismo',
    category: 'healthy',
    subCategory: 'Dinámica de Energía y Movimiento',
    biologicalWhy: 'Reactiva la enzima lipoproteína lipasa (LPL) y previene la resistencia periférica a la insulina por inmovilidad prolongada.',
    icon: '🚶',
  },
  {
    id: 'strength_zone2',
    label: 'Entrenamiento fuerza / Zona 2',
    scientificTerm: 'Sobrecarga y Densidad Mitocondrial',
    category: 'healthy',
    subCategory: 'Dinámica de Energía y Movimiento',
    biologicalWhy: 'Aumenta la biogénesis mitocondrial, la masa muscular metabólicamente activa y la liberación de mioquinas antiinflamatorias.',
    icon: '🏋️',
  },
  {
    id: 'cold_exposure',
    label: 'Ducha fría / Exposición al frío',
    scientificTerm: 'Crioterapia Hormética',
    category: 'healthy',
    subCategory: 'Dinámica de Energía y Movimiento',
    biologicalWhy: 'Eleva la dopamina y la noradrenalina plasmática de forma sostenida (hasta un 250%) sin el posterior bajón de los estimulantes.',
    icon: '❄️',
  },

  // 3. Nutrición y Digestión
  {
    id: 'protein_breakfast',
    label: 'Desayuno alto en proteína y grasas saludables',
    scientificTerm: 'Saciedad y Homeostasis Glucémica',
    category: 'healthy',
    subCategory: 'Nutrición y Digestión',
    biologicalWhy: 'Aplana la curva de glucosa en sangre y activa la secreción de PYY y GLP-1, evitando el letargo postprandial.',
    icon: '🍳',
  },
  {
    id: 'intermittent_fast',
    label: 'Ventana de ayuno nocturno de 12 horas',
    scientificTerm: 'Ritmo Metabólico y Autofagia',
    category: 'healthy',
    subCategory: 'Nutrición y Digestión',
    biologicalWhy: 'Permite el descanso del sistema digestivo, optimiza la sensibilidad a la insulina y promueve el reciclaje celular.',
    icon: '⏳',
  },
  {
    id: 'electrolytes_morning',
    label: 'Hidratación con electrolitos / sal marina',
    scientificTerm: 'Reposición Electrolítica Matutina',
    category: 'healthy',
    subCategory: 'Nutrición y Digestión',
    biologicalWhy: 'Restaura el volumen plasmático y suministra sodio/potasio esenciales para la conducción neuromuscular tras el ayuno nocturno.',
    icon: '🧂',
  },

  // 4. Enfoque Cognitivo y Mente
  {
    id: 'deep_work',
    label: 'Deep Work sin teléfono visible',
    scientificTerm: 'Atención Plena Monotarea',
    category: 'healthy',
    subCategory: 'Enfoque Cognitivo y Mente',
    biologicalWhy: 'Elimina el "coste de conmutación" y el drenaje cognitivo inconsciente provocado por la mera proximidad visual del smartphone.',
    icon: '🎯',
  },
  {
    id: 'cyclic_sigh',
    label: 'Suspiro Cíclico de 30 segundos',
    scientificTerm: 'Regulación Neurovegetativa Vagal',
    category: 'healthy',
    subCategory: 'Enfoque Cognitivo y Mente',
    biologicalWhy: 'Desinfla los alvéolos hiperinsuflados y estimula el nervio vago para desacelerar la frecuencia cardíaca casi instantáneamente.',
    icon: '🫁',
  },
  {
    id: 'phone_free_routines',
    label: 'Desconexión digital consciente (Phone-free)',
    scientificTerm: 'Higiene Dopaminérgica Matutina/Nocturna',
    category: 'healthy',
    subCategory: 'Enfoque Cognitivo y Mente',
    biologicalWhy: 'Protege la corteza prefrontal del modo reactivo inducido por notificaciones antes de consolidar el descanso o el foco del día.',
    icon: '📵',
  },

  // 🔴 FUGAS DE ENERGÍA Y FRICCIÓN (Energy Drains & High Friction)
  // 1. Fugas por Sobrestimulación Dopaminérgica
  {
    id: 'dopamine_stacking',
    label: 'Dopamine Stacking (pantalla + comida/mensajes)',
    scientificTerm: 'Sobrecarga Sensorial Compuesta',
    category: 'unhealthy',
    subCategory: 'Fugas por Sobrestimulación Dopaminérgica',
    biologicalWhy: 'Satura los receptores D2 de dopamina al combinar múltiples estímulos artificiales, provocando apatía y anhedonia basal posterior.',
    icon: '🥞',
  },
  {
    id: 'morning_scroll',
    label: 'Scroll infinito al despertar en cama',
    scientificTerm: 'Activación Reactiva Límbica',
    category: 'unhealthy',
    subCategory: 'Fugas por Sobrestimulación Dopaminérgica',
    biologicalWhy: 'Inunda el cerebro de dopamina fásica barata antes de activar el sistema motor, generando ansiedad y desmotivación ejecutiva.',
    icon: '📱',
  },
  {
    id: 'morning_sugar',
    label: 'Azúcar o carbohidratos simples a 1ª hora',
    scientificTerm: 'Pico Glucémico y Crash de Adenosina',
    category: 'unhealthy',
    subCategory: 'Fugas por Sobrestimulación Dopaminérgica',
    biologicalWhy: 'Provoca un hiperinsulinismo compensatorio que desencadena hipoglucemia reactiva, fatiga profunda y antojos hacia las 11:30.',
    icon: '🍩',
  },

  // 2. Fugas de Energía Inaudita y Fricción
  {
    id: 'multitasking',
    label: 'Multitarea o interrupciones frecuentes',
    scientificTerm: 'Residuo de Atención Cognitiva',
    category: 'unhealthy',
    subCategory: 'Fugas de Energía Inaudita y Fricción',
    biologicalWhy: 'Cada cambio de tarea deja restos de atención en la actividad anterior, agotando rápidamente la glucosa del lóbulo frontal.',
    icon: '🤹',
  },
  {
    id: 'late_caffeine',
    label: 'Cafeína pasadas las 14:00 PM',
    scientificTerm: 'Bloqueo Tardío de Adenosina',
    category: 'unhealthy',
    subCategory: 'Fugas de Energía Inaudita y Fricción',
    biologicalWhy: 'La vida media de la cafeína (5-7 horas) impide que la adenosina active los centros somnolientos, destruyendo el sueño profundo.',
    icon: '☕',
  },
  {
    id: 'heavy_dinner',
    label: 'Cenar pesado o muy cerca de dormir',
    scientificTerm: 'Termogénesis y Taquicardia Nocturna',
    category: 'unhealthy',
    subCategory: 'Fugas de Energía Inaudita y Fricción',
    biologicalWhy: 'Eleva la temperatura corporal central y la frecuencia cardíaca basal nocturna, fragmentando las fases cruciales de sueño REM.',
    icon: '🍕',
  },

  // 3. Fricción del Entorno (Obstáculos pasivos)
  {
    id: 'visible_junkfood',
    label: 'Ultraprocesados visibles o al alcance',
    scientificTerm: 'Fricción Nula para Hábitos Adictivos',
    category: 'unhealthy',
    subCategory: 'Fricción del Entorno',
    biologicalWhy: 'Cada señal visual de comida hiperpalatable activa el sistema dopaminérgico mesolímbico, agotando la reserva finita de voluntad.',
    icon: '🍪',
  },
  {
    id: 'phone_bedside',
    label: 'Teléfono en la mesita de noche junto a la cama',
    scientificTerm: 'Proximidad de Fricción Cero',
    category: 'unhealthy',
    subCategory: 'Fricción del Entorno',
    biologicalWhy: 'Elimina cualquier barrera de esfuerzo para ceder al impulso de mirar la pantalla antes de levantarse o al desvelarse.',
    icon: '🛏️',
  },
  {
    id: 'cluttered_workspace',
    label: 'Entorno desordenado en el área de trabajo',
    scientificTerm: 'Sobrecarga Cognitiva Subconsciente',
    category: 'unhealthy',
    subCategory: 'Fricción del Entorno',
    biologicalWhy: 'El campo visual desordenado satura los circuitos corticales parietales compitiendo por recursos atencionales continuos.',
    icon: '🌪️',
  },
];

export const SAMPLE_DAYS_TEXT = [
  {
    title: 'Día con balance mixto y Dopamine Stacking',
    text: 'Hoy me desperté e hice scroll en TikTok en la cama durante 30 minutos. Desayuné cereales azucarados con café. En el trabajo estuve en multitarea constante y a las 15:00 sentí un bajón tremendo, así que tomé otro café con una chocolatina. Al salir caminé 35 minutos y cené ensalada con salmón, pero me dormí con el móvil en la mesita de noche.',
    tags: ['morning_scroll', 'morning_sugar', 'multitasking', 'late_caffeine', 'active_breaks', 'phone_bedside'],
  },
  {
    title: 'Día de Fricción Cero y Desconexión',
    text: 'Me levanté a las 6:30am y salí al balcón a tomar 15 minutos de luz solar directa mientras bebía un vaso de agua con una pizca de sal marina. Hice un bloque de 90 minutos de Deep Work sin el móvil en la habitación. Desayuné 3 huevos con espinacas y aguacate. A media tarde hice pausas activas y desconecté pantallas 2 horas antes de dormir.',
    tags: ['sunlight_morning', 'electrolytes_morning', 'deep_work', 'protein_breakfast', 'active_breaks', 'blue_light_block', 'phone_free_routines'],
  },
  {
    title: 'Día con cena tardía y cafeína vespertina',
    text: 'Día de teletrabajo sentado 8 horas. Tomé café a las 16:30 para aguantar. Tenía dulces visibles en la mesa y piqué galletas. Cené pizza a las 22:30 viendo una serie en el iPad (Dopamine Stacking) y me costó conciliar el sueño.',
    tags: ['active_breaks', 'late_caffeine', 'visible_junkfood', 'heavy_dinner', 'dopamine_stacking'],
  },
];
