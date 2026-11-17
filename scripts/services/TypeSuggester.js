import { normalizeText } from '../utils/formatters.js';

/** Sugiere el tipo de función a partir de los verbos del nombre. */
export class TypeSuggester {
  #rules;

  constructor(rules) {
    this.#rules = rules.map((rule) => ({ ...rule, words: rule.words.map(normalizeText) }));
  }

  suggest(name) {
    const text = ` ${normalizeText(name).replace(/[^a-z0-9ñ ]/g, ' ')} `;
    if (text.trim().length < 3) return null;

    for (const rule of this.#rules) {
      // Palabras cortas exigen coincidencia exacta ("ver" ≠ "verificar"); las largas admiten variaciones ("registro").
      const word = rule.words.find((w) => text.includes(` ${w} `)
        || (w.length >= 6 && text.includes(` ${w.slice(0, -1)}`)));
      if (word) {
        const note = word === 'listar' ? ' Si el listado incluye totales o cálculos, usa EO.' : '';
        return { type: rule.type, word, note };
      }
    }
    return null;
  }
}
