import { FP_TYPES, COMPLEXITY_ORDER } from '../config/constants.js';
import { Validator } from '../validators/Validator.js';

const createId = () => (globalThis.crypto?.randomUUID?.()
  ?? `fn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);

/** Requisito funcional del usuario. Inmutable y siempre válido una vez creado. */
export class Functionality {
  constructor({ id, name, quantity, type, complexity }) {
    const values = Validator.collect({
      name: () => Validator.text(name, { field: 'name', label: 'El nombre de la funcionalidad', min: 3, max: 80 }),
      quantity: () => Validator.number(quantity, { field: 'quantity', label: 'La cantidad', min: 1, max: 999, integer: true }),
      type: () => Validator.oneOf(type, Object.keys(FP_TYPES), { field: 'type', label: 'el tipo' }),
      complexity: () => Validator.oneOf(complexity, COMPLEXITY_ORDER, { field: 'complexity', label: 'la complejidad' }),
    });

    this.id = id || createId();
    this.name = values.name;
    this.quantity = values.quantity;
    this.type = values.type;
    this.complexity = values.complexity;
    Object.freeze(this);
  }

  get weight() {
    return FP_TYPES[this.type].weights[this.complexity];
  }

  get points() {
    return this.weight * this.quantity;
  }

  isSameAs(other) {
    return other.type === this.type && other.name.toLowerCase() === this.name.toLowerCase();
  }

  toJSON() {
    const { id, name, quantity, type, complexity } = this;
    return { id, name, quantity, type, complexity };
  }
}
