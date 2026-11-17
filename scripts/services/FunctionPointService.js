import { COMPLEXITY_ORDER } from '../config/constants.js';
import { ValidationError, CalculationError } from '../errors/AppErrors.js';
import { Validator } from '../validators/Validator.js';
import { roundTo } from '../utils/formatters.js';

/** Cálculo de puntos de función sin ajustar (PFSA) y ajustados (PFA). */
export class FunctionPointService {
  #types;
  #gscCatalog;
  #base;
  #step;
  #maxLevel;

  constructor({ types, gscCatalog, base, step, maxLevel }) {
    this.#types = types;
    this.#gscCatalog = gscCatalog;
    this.#base = base;
    this.#step = step;
    this.#maxLevel = maxLevel;
  }

  /** @param {import('../models/Functionality.js').Functionality[]} functionalities */
  unadjusted(functionalities) {
    if (!Array.isArray(functionalities) || functionalities.length === 0) {
      throw new CalculationError('Agrega al menos una funcionalidad para calcular.');
    }

    const rows = Object.values(this.#types).map((type) => ({
      code: type.code,
      name: type.name,
      cells: COMPLEXITY_ORDER.map((complexity) => ({
        complexity, weight: type.weights[complexity], count: 0, points: 0,
      })),
      total: 0,
    }));
    const byCode = Object.fromEntries(rows.map((row) => [row.code, row]));

    for (const fn of functionalities) {
      const row = byCode[fn.type];
      if (!row) throw new CalculationError(`Tipo de función desconocido: ${fn.type}.`);
      const cell = row.cells.find((c) => c.complexity === fn.complexity);
      cell.count += fn.quantity;
      cell.points += fn.points;
      row.total += fn.points;
    }

    return { rows, total: rows.reduce((sum, row) => sum + row.total, 0) };
  }

  adjustment(levels) {
    if (!Array.isArray(levels) || levels.length !== this.#gscCatalog.length) {
      throw new ValidationError(`Debes calificar las ${this.#gscCatalog.length} características generales.`, 'gsc');
    }
    const clean = Validator.collect(Object.fromEntries(levels.map((value, i) => [
      `gsc-${i}`,
      () => Validator.number(value, {
        field: `gsc-${i}`, label: this.#gscCatalog[i].name, min: 0, max: this.#maxLevel, integer: true,
      }),
    ])));
    const tdi = Object.values(clean).reduce((sum, v) => sum + v, 0);
    return { tdi, factor: roundTo(this.#base + this.#step * tdi, 2), base: this.#base, step: this.#step };
  }

  adjusted(pfsa, factor, { round = true } = {}) {
    const raw = roundTo(pfsa * factor, 4);
    const value = round ? Math.round(raw) : raw;
    if (value <= 0) throw new CalculationError('Los puntos de función ajustados deben ser mayores que cero.');
    return { raw, value };
  }
}
