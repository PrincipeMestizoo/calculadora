/**
 * Configuración del dominio (método de Puntos de Función IFPUG).
 * Solo datos: ninguna lógica vive aquí (principio de responsabilidad única).
 */

export const COMPLEXITY = Object.freeze({ BAJA: 'BAJA', MEDIA: 'MEDIA', ALTA: 'ALTA' });

export const COMPLEXITY_ORDER = Object.freeze([COMPLEXITY.BAJA, COMPLEXITY.MEDIA, COMPLEXITY.ALTA]);

export const COMPLEXITY_LABELS = Object.freeze({ BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta' });

/** Tipos de función IFPUG con sus pesos por complejidad. */
export const FP_TYPES = Object.freeze({
  EI: {
    code: 'EI',
    name: 'Entrada externa',
    hint: 'Pantallas donde el usuario ingresa, modifica o elimina datos.',
    weights: { BAJA: 3, MEDIA: 4, ALTA: 6 },
  },
  EO: {
    code: 'EO',
    name: 'Salida externa',
    hint: 'Informes, gráficos o listados con cálculos o totales.',
    weights: { BAJA: 4, MEDIA: 5, ALTA: 7 },
  },
  EQ: {
    code: 'EQ',
    name: 'Consulta externa',
    hint: 'Buscar, consultar o mostrar datos sin cálculos.',
    weights: { BAJA: 3, MEDIA: 4, ALTA: 6 },
  },
  ILF: {
    code: 'ILF',
    name: 'Archivo lógico interno',
    hint: 'Tablas o archivos que mantiene el propio sistema.',
    weights: { BAJA: 7, MEDIA: 10, ALTA: 15 },
  },
  EIF: {
    code: 'EIF',
    name: 'Archivo de interfaz externo',
    hint: 'Datos de otros sistemas que esta aplicación solo consulta.',
    weights: { BAJA: 5, MEDIA: 7, ALTA: 10 },
  },
});

/**
 * Matrices de complejidad IFPUG.
 * rowLimits: límites superiores de las filas (FTR o RET); colLimits: límites de DET.
 * Ej. EI → FTR: 0‑1 | 2 | 3+ ; DET: 1‑4 | 5‑15 | 16+
 */
const STANDARD_MATRIX = [
  [COMPLEXITY.BAJA, COMPLEXITY.BAJA, COMPLEXITY.MEDIA],
  [COMPLEXITY.BAJA, COMPLEXITY.MEDIA, COMPLEXITY.ALTA],
  [COMPLEXITY.MEDIA, COMPLEXITY.ALTA, COMPLEXITY.ALTA],
];

const TRANSACTION_OUT = { refLabel: 'FTR (archivos referenciados)', refMin: 0, rowLimits: [1, 3], colLimits: [5, 19], matrix: STANDARD_MATRIX };
const DATA_FILE = { refLabel: 'RET (subgrupos de datos)', refMin: 1, rowLimits: [1, 5], colLimits: [19, 50], matrix: STANDARD_MATRIX };

export const COMPLEXITY_MATRICES = Object.freeze({
  EI: { refLabel: 'FTR (archivos referenciados)', refMin: 0, rowLimits: [1, 2], colLimits: [4, 15], matrix: STANDARD_MATRIX },
  EO: TRANSACTION_OUT,
  EQ: TRANSACTION_OUT,
  ILF: DATA_FILE,
  EIF: DATA_FILE,
});

/** Verbos que sugieren el tipo de función (son una pista, no una regla). */
export const TYPE_KEYWORDS = Object.freeze([
  { type: 'EIF', words: ['archivo externo', 'interfaz externa', 'servicio externo', 'importado de'] },
  { type: 'ILF', words: ['tabla', 'tablas', 'entidad', 'entidades', 'archivo interno'] },
  { type: 'EO', words: ['informe', 'reporte', 'generar', 'calcular', 'totalizar', 'imprimir', 'indicador', 'graficar', 'grafico', 'estadistica'] },
  { type: 'EI', words: ['agregar', 'crear', 'registrar', 'insertar', 'ingresar', 'modificar', 'cambiar', 'actualizar', 'eliminar', 'anular', 'cargar', 'activar', 'editar', 'guardar'] },
  { type: 'EQ', words: ['buscar', 'consultar', 'ver', 'seleccionar', 'listar', 'mostrar', 'recuperar', 'filtrar'] },
]);

/** Características generales del sistema (GSC) y sus niveles de influencia. */
export const GSC_CATALOG = Object.freeze([
  {
    name: 'Comunicación de datos',
    question: '¿Cuántos protocolos y medios de comunicación usa?',
    levels: [
      'Aplicación batch o en un computador aislado.',
      'Batch con entrada o impresión remota.',
      'Batch con entrada e impresión remota.',
      'Entrada de datos en línea que alimenta procesos batch o consultas.',
      'Más que entrada en línea; soporta un solo protocolo (ej. aplicación web).',
      'Más que entrada en línea; soporta más de un protocolo.',
    ],
  },
  {
    name: 'Procesamiento distribuido',
    question: '¿Se transfieren datos o funciones a otros equipos?',
    levels: [
      'No transfiere datos ni funciones entre procesadores.',
      'Prepara datos para el usuario final en otra CPU.',
      'Prepara y transfiere datos que se procesan en otro equipo.',
      'Procesamiento distribuido en línea, en una sola dirección.',
      'Procesamiento distribuido en línea, en ambas direcciones.',
      'Las funciones se ejecutan dinámicamente en el equipo más adecuado.',
    ],
  },
  {
    name: 'Objetivos de rendimiento',
    question: '¿Hay requisitos de tiempo de respuesta?',
    levels: [
      'Sin requisitos especiales de rendimiento.',
      'Requisitos establecidos, sin acciones especiales.',
      'Tiempo de respuesta crítico en horas pico.',
      'Tiempo de respuesta crítico durante todo el horario comercial.',
      'Requiere análisis de rendimiento en análisis y diseño.',
      'Además, usa herramientas de análisis de rendimiento.',
    ],
  },
  {
    name: 'Configuración del equipamiento',
    question: '¿El hardware tiene restricciones especiales?',
    levels: [
      'Sin restricciones operacionales.',
      'Restricciones leves; no exigen esfuerzo especial.',
      'Requiere ajustes de rendimiento y seguridad.',
      'Especificaciones especiales de procesador para un módulo.',
      'Cuidados especiales en el procesador central o dedicado.',
      'Además, consideraciones en la distribución del sistema.',
    ],
  },
  {
    name: 'Tasa de transacciones',
    question: '¿Con qué frecuencia hay picos de uso?',
    levels: [
      'Sin picos de transacciones previstos.',
      'Picos mensuales, trimestrales o anuales.',
      'Picos semanales.',
      'Picos diarios.',
      'Alto volumen que exige análisis de rendimiento y diseño.',
      'Además, herramientas de análisis de rendimiento.',
    ],
  },
  {
    name: 'Entrada de datos en línea',
    question: '¿Qué porcentaje de las transacciones se ingresa en línea?',
    levels: [
      'Todas las transacciones en modo batch.',
      'Del 1 % al 7 % en línea.',
      'Del 8 % al 15 % en línea.',
      'Del 16 % al 23 % en línea.',
      'Del 24 % al 30 % en línea.',
      'Más del 30 % en línea.',
    ],
  },
  {
    name: 'Interfaz con el usuario',
    question: '¿Cuántas facilidades de uso tiene? (menús, ayuda en línea, mouse, pop‑ups, scroll, mínimo de pantallas, bilingüe = 4 ítems, multilingüe = 6 ítems…)',
    levels: [
      'Ninguno de los ítems.',
      'De 1 a 3 ítems.',
      'De 4 a 5 ítems.',
      'Más de 5 ítems, sin requisitos específicos de amigabilidad.',
      'Más de 5 ítems y requisitos de amigabilidad (ej. minimizar digitación).',
      'Más de 5 ítems y herramientas especiales para demostrar la usabilidad.',
    ],
  },
  {
    name: 'Actualización en línea',
    question: '¿Cuántos archivos lógicos internos (ILF) se actualizan en línea?',
    levels: [
      'Ninguno.',
      'De 1 a 3 ILF.',
      'Más de 3 ILF.',
      'La mayoría de los ILF.',
      'Además, protección esencial contra pérdida de datos.',
      'Además, recuperación automatizada por altos volúmenes.',
    ],
  },
  {
    name: 'Procesamiento complejo',
    question: 'Cuenta: seguridad o auditoría especial, lógica extensa, cálculo matemático extenso, muchas excepciones, múltiples entradas/salidas (multimedia).',
    levels: ['Ninguno de los ítems.', 'Un ítem.', 'Dos ítems.', 'Tres ítems.', 'Cuatro ítems.', 'Los cinco ítems.'],
  },
  {
    name: 'Reusabilidad del código',
    question: '¿Se diseña código para reutilizar en otras aplicaciones?',
    levels: [
      'Sin código reutilizable.',
      'Código reutilizado solo dentro de la aplicación.',
      'Menos del 10 % pensado para reutilizarse.',
      '10 % o más pensado para reutilizarse.',
      'Diseñada para reutilizarse; se configura en el código fuente.',
      'Diseñada para reutilizarse; se configura por parámetros del usuario.',
    ],
  },
  {
    name: 'Facilidad de implementación',
    question: '¿Hay conversión o migración de datos?',
    levels: [
      'Sin consideraciones ni procedimientos especiales.',
      'Sin requisitos del usuario, pero con procedimientos especiales.',
      'Conversión requerida y probada; impacto bajo.',
      'Conversión requerida y probada; impacto importante.',
      'Nivel 2 más herramientas de conversión automática.',
      'Nivel 3 más herramientas de conversión automática.',
    ],
  },
  {
    name: 'Facilidad de operación',
    question: 'Cuenta: respaldo con operador (1), inicio/respaldo/recuperación sin operador (2), minimiza cintas (1), minimiza papel (1).',
    levels: [
      'Solo el respaldo normal.',
      'Cumple 1 punto de la lista.',
      'Cumple 2 puntos de la lista.',
      'Cumple 3 puntos de la lista.',
      'Cumple 4 puntos de la lista.',
      'Operación desatendida con recuperación automática.',
    ],
  },
  {
    name: 'Instalaciones múltiples',
    question: '¿Se instalará en varios sitios u organizaciones?',
    levels: [
      'Un solo sitio.',
      'Varios sitios con el mismo hardware y software.',
      'Varios sitios con ambientes similares.',
      'Varios sitios con ambientes diferentes.',
      'Documentación y mantenimiento probados + niveles 1‑2.',
      'Documentación y mantenimiento probados + nivel 3.',
    ],
  },
  {
    name: 'Facilidad de cambios',
    question: 'Cuenta: informes flexibles simples (1), medios (2), complejos (3); parámetros del usuario con efecto al día siguiente (1) o inmediato (2).',
    levels: ['Ninguno de los ítems.', 'Un ítem.', 'Dos ítems.', 'Tres ítems.', 'Cuatro ítems.', 'Cinco o más ítems.'],
  },
]);

export const GSC_MAX_LEVEL = 5;
export const ADJUSTMENT_BASE = 0.65;
export const ADJUSTMENT_STEP = 0.01;

/**
 * Parámetros económicos sugeridos (editables por el usuario).
 * Cada campo se describe una vez; la vista y el validador se generan a partir de aquí.
 */
export const PARAM_GROUPS = Object.freeze([
  {
    title: 'Esfuerzo y tiempo',
    fields: [
      { key: 'hoursPerFP', label: 'Horas por punto de función', unit: 'h/PF', min: 0.5, max: 100, step: 0.5, default: 8,
        help: '8 h/PF es un valor de referencia. Usa tu promedio histórico si lo tienes.' },
      { key: 'developers', label: 'Programadores', unit: 'personas', min: 1, max: 200, step: 1, integer: true, default: 2 },
      { key: 'hoursPerMonth', label: 'Horas laborales al mes', unit: 'h/mes', min: 1, max: 240, step: 1, default: 140,
        help: 'Horas productivas efectivas por persona al mes.' },
    ],
  },
  {
    title: 'Salarios',
    fields: [
      { key: 'salary', label: 'Salario mensual por programador', unit: 'COP', money: true, min: 1, max: 1_000_000_000, step: 50_000, default: 5_500_000 },
      { key: 'benefitFactor', label: 'Factor prestacional', unit: '×', min: 1, max: 3, step: 0.01, default: 1.52,
        help: 'Cubre salud, pensión, ARL, parafiscales, prima, cesantías y vacaciones (≈52 %).' },
    ],
  },
  {
    title: 'Gastos generales',
    fields: [
      { key: 'otherMonthly', label: 'Otros costos mensuales', unit: 'COP/mes', money: true, min: 0, max: 1_000_000_000, step: 50_000, default: 1_700_000,
        help: 'Arriendo, servicios, internet, licencias, impuestos…' },
    ],
  },
  {
    title: 'Márgenes e IVA',
    fields: [
      { key: 'contingencyPct', label: 'Contingencia', unit: '%', min: 0, max: 100, step: 1, default: 10, help: 'Reserva para imprevistos.' },
      { key: 'profitPct', label: 'Utilidad', unit: '%', min: 0, max: 300, step: 1, default: 20 },
      { key: 'ivaPct', label: 'IVA', unit: '%', min: 0, max: 100, step: 1, default: 19, help: 'Tarifa general del IVA en Colombia: 19 %.' },
    ],
  },
]);

export const PARAM_OPTIONS = Object.freeze([
  { key: 'roundPfa', label: 'Redondear PFA a entero', default: true },
  { key: 'roundDuration', label: 'Redondear duración a 2 decimales', default: true },
]);

export const DEFAULT_PARAMS = Object.freeze(Object.fromEntries([
  ...PARAM_GROUPS.flatMap((g) => g.fields).map((f) => [f.key, f.default]),
  ...PARAM_OPTIONS.map((o) => [o.key, o.default]),
]));

export const STORAGE_KEY = 'calculadora-costos-software:v1';
