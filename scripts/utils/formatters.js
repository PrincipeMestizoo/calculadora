const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0,
});

/** $ 82.751.629 — redondea al peso. */
export const formatCOP = (value) => copFormatter.format(Math.round(value));

/** 2,86 — separadores colombianos. */
export const formatNumber = (value, decimals = 2) => new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 0, maximumFractionDigits: decimals,
}).format(value);

export const formatPercent = (value) => `${formatNumber(value)} %`;

/** Redondeo decimal sin errores de coma flotante visibles (0,9700000001 → 0,97). */
export const roundTo = (value, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

/** Quita tildes y pasa a minúsculas para comparar textos. */
export const normalizeText = (text) => String(text ?? '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
