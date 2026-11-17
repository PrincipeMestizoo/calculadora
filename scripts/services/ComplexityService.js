import { Validator } from '../validators/Validator.js';
import { ValidationError } from '../errors/AppErrors.js';

/** Determina la complejidad (Baja/Media/Alta) a partir de DET y FTR/RET según IFPUG. */
export class ComplexityService {
  #matrices;

  constructor(matrices) {
    this.#matrices = matrices;
  }

  describe(type) {
    const config = this.#matrices[type];
    if (!config) throw new ValidationError('Selecciona primero un tipo de función.', 'type');
    return config;
  }

  resolve(type, det, ref) {
    const config = this.describe(type);
    const values = Validator.collect({
      det: () => Validator.number(det, { field: 'det', label: 'DET', min: 1, max: 999, integer: true }),
      ref: () => Validator.number(ref, { field: 'ref', label: config.refLabel.split(' ')[0], min: config.refMin, max: 999, integer: true }),
    });
    const row = ComplexityService.#bucket(values.ref, config.rowLimits);
    const col = ComplexityService.#bucket(values.det, config.colLimits);
    return config.matrix[row][col];
  }

  static #bucket(value, [first, second]) {
    if (value <= first) return 0;
    if (value <= second) return 1;
    return 2;
  }
}
