import { Validator } from './Validator.js';

/** Valida los parámetros económicos usando el mismo esquema que dibuja la vista. */
export class ParametersValidator {
  #fields;
  #options;

  constructor(groups, options) {
    this.#fields = groups.flatMap((g) => g.fields);
    this.#options = options;
  }

  validate(raw) {
    const rules = Object.fromEntries(this.#fields.map((f) => [
      f.key,
      () => Validator.number(raw?.[f.key], {
        field: f.key, label: f.label, min: f.min, max: f.max, integer: Boolean(f.integer),
      }),
    ]));
    const values = Validator.collect(rules);
    for (const option of this.#options) values[option.key] = Boolean(raw?.[option.key]);
    return values;
  }
}
