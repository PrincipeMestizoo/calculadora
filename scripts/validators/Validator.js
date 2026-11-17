import { ValidationError } from '../errors/AppErrors.js';
import { formatNumber } from '../utils/formatters.js';

const toNumber = (value) => (typeof value === 'number'
  ? value
  : Number(String(value ?? '').trim().replace(/\s/g, '').replace(',', '.')));

/** Reglas de validación reutilizables. Cada regla devuelve el valor limpio o lanza ValidationError. */
export const Validator = Object.freeze({
  text(value, { field, label, min = 1, max = 120 }) {
    const text = String(value ?? '').trim().replace(/\s+/g, ' ');
    if (!text) throw new ValidationError(`${label} es obligatorio.`, field);
    if (text.length < min) throw new ValidationError(`${label} debe tener al menos ${min} caracteres.`, field);
    if (text.length > max) throw new ValidationError(`${label} no puede superar ${max} caracteres.`, field);
    return text;
  },

  number(value, { field, label, min = -Infinity, max = Infinity, integer = false }) {
    if (value === '' || value === null || value === undefined) {
      throw new ValidationError(`${label} es obligatorio.`, field);
    }
    const n = toNumber(value);
    if (!Number.isFinite(n)) throw new ValidationError(`${label} debe ser un número válido.`, field);
    if (integer && !Number.isInteger(n)) throw new ValidationError(`${label} debe ser un número entero.`, field);
    if (n < min) throw new ValidationError(`${label} no puede ser menor que ${formatNumber(min)}.`, field);
    if (n > max) throw new ValidationError(`${label} no puede ser mayor que ${formatNumber(max)}.`, field);
    return n;
  },

  oneOf(value, allowed, { field, label }) {
    if (!allowed.includes(value)) throw new ValidationError(`Selecciona un valor válido para ${label}.`, field);
    return value;
  },

  /**
   * Ejecuta varias reglas y reúne todos los errores en un solo ValidationError.
   * @param {Record<string, () => any>} rules
   */
  collect(rules) {
    const values = {};
    const errors = {};
    for (const [key, rule] of Object.entries(rules)) {
      try {
        values[key] = rule();
      } catch (error) {
        if (!(error instanceof ValidationError)) throw error;
        errors[key] = error.message;
      }
    }
    if (Object.keys(errors).length) throw ValidationError.fromMap(errors);
    return values;
  },
});
