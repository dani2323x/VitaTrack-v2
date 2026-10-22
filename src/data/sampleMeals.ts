export interface SampleMeal {
  id: string;
  name: string;
  mealType: 'Desayuno' | 'Almuerzo' | 'Cena' | 'Snack';
  description: string;
  // SVG representation for mock instant demonstration if user doesn't have an uploaded photo
  svgDataUrl: string;
}

// Crisp modern food illustrations as inline SVGs so user can test instant multi-photo upload
export const SAMPLE_MEALS: SampleMeal[] = [
  {
    id: 'salmon_bowl',
    name: 'Bowl de Salmón con Quinoa y Aguacate',
    mealType: 'Almuerzo',
    description: 'Filete de salmón a la plancha, quinoa cocida, medio aguacate en rodajas, edamames, espinacas tiernas y semillas de sésamo.',
    svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%230f172a"/><circle cx="200" cy="200" r="170" fill="%23f1f5f9" stroke="%23cbd5e1" stroke-width="8"/><circle cx="200" cy="200" r="145" fill="%23ffffff"/><ellipse cx="160" cy="170" rx="45" ry="30" fill="%23fb923c"/><ellipse cx="160" cy="170" rx="35" ry="20" fill="%23f97316"/><rect x="210" y="140" width="55" height="55" rx="15" fill="%23a3e635"/><ellipse cx="180" cy="240" rx="60" ry="35" fill="%23cbd5e1"/><circle cx="240" cy="230" r="22" fill="%234ade80"/><circle cx="270" cy="210" r="18" fill="%2322c55e"/><text x="200" y="320" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23334155" text-anchor="middle">Bowl Salmon & Quinoa</text></svg>`,
  },
  {
    id: 'oatmeal_berries',
    name: 'Bowl de Avena con Frutos Rojos y Chía',
    mealType: 'Desayuno',
    description: 'Avena integral cocida en bebida de almendras, arándanos silvestres, frambuesas frescas, semillas de chía y un toque de canela.',
    svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%230f172a"/><circle cx="200" cy="200" r="165" fill="%23fef3c7" stroke="%23fde68a" stroke-width="8"/><circle cx="200" cy="200" r="140" fill="%23fffbeb"/><ellipse cx="200" cy="200" rx="120" ry="100" fill="%23f5ebe0"/><circle cx="160" cy="170" r="15" fill="%234338ca"/><circle cx="190" cy="150" r="14" fill="%233730a3"/><circle cx="230" cy="165" r="18" fill="%23e11d48"/><circle cx="210" cy="195" r="16" fill="%23be123c"/><circle cx="160" cy="220" r="6" fill="%231e293b"/><circle cx="175" cy="230" r="5" fill="%231e293b"/><text x="200" y="320" font-family="sans-serif" font-size="16" font-weight="bold" fill="%2378350f" text-anchor="middle">Avena & Frutos Rojos</text></svg>`,
  },
  {
    id: 'pizza_pepperoni',
    name: 'Porción de Pizza Pepperoni con Refresco',
    mealType: 'Cena',
    description: '2 porciones de pizza de masa tradicional con queso mozzarella fundido, pepperoni y una lata de refresco cola azucarado.',
    svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%230f172a"/><circle cx="170" cy="200" r="130" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="6"/><path d="M 170 100 L 250 250 L 90 250 Z" fill="%23fef08a" stroke="%23f59e0b" stroke-width="5"/><circle cx="160" cy="180" r="15" fill="%23b91c1c"/><circle cx="190" cy="210" r="14" fill="%23991b1b"/><circle cx="140" cy="225" r="13" fill="%23b91c1c"/><rect x="275" y="140" width="60" height="110" rx="10" fill="%23dc2626"/><rect x="290" y="125" width="30" height="15" fill="%23cbd5e1"/><text x="200" y="360" font-family="sans-serif" font-size="15" font-weight="bold" fill="%23f8fafc" text-anchor="middle">Pizza & Refresco Ultraprocesado</text></svg>`,
  },
];
