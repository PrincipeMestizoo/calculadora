import { h } from '../dom.js';
import { createInfo } from '../effects/infoToggle.js';
import { formatNumber } from '../../utils/formatters.js';

/** Características generales: una escala 0‑5 por tarjeta; la ayuda queda oculta tras "?". */
export class GscView {
  #grid; #total; #factors; #catalog;
  #descriptions = [];

  constructor({ grid, total, factors }, catalog) {
    this.#grid = grid;
    this.#total = total;
    this.#factors = factors;
    this.#catalog = catalog;
    this.#render();
  }

  init({ onChange }) {
    this.#grid.addEventListener('change', (event) => {
      const index = Number(event.target.dataset.index);
      if (Number.isInteger(index)) this.#describe(index);
      onChange(this.read());
    });
  }

  read() {
    return this.#catalog.map((_, i) => Number(this.#grid.querySelector(`input[name="gsc-${i}"]:checked`)?.value ?? 0));
  }

  set(levels) {
    levels.forEach((level, i) => {
      const input = this.#grid.querySelector(`input[name="gsc-${i}"][value="${Number(level)}"]`);
      if (input) {
        input.checked = true;
        this.#describe(i);
      }
    });
  }

  showSummary({ tdi, factor }) {
    this.#total.textContent = tdi;
    this.#factors.forEach((el) => { el.textContent = formatNumber(factor); });
  }

  #describe(index) {
    const level = this.read()[index];
    this.#descriptions[index].textContent = this.#catalog[index].levels[level] ?? '';
    this.#descriptions[index].closest('.gsc').dataset.level = level;
  }

  #render() {
    const cards = this.#catalog.map((item, i) => {
      const labelId = `gsc-label-${i}`;
      const [infoButton, infoText] = createInfo(item.question, `Ayuda: ${item.name}`);
      const description = h('p', { class: 'gsc__level' });
      this.#descriptions.push(description);

      const scale = h('div', { class: 'scale', role: 'radiogroup', 'aria-labelledby': labelId },
        item.levels.map((_, level) => h('label', { title: item.levels[level] },
          h('input', { type: 'radio', name: `gsc-${i}`, value: level, checked: level === 0, dataset: { index: i } }),
          h('span', { text: level }))));

      return h('article', { class: 'gsc' },
        h('div', { class: 'gsc__head' }, h('span', { id: labelId, class: 'gsc__name', text: item.name }), infoButton),
        infoText,
        scale,
        description);
    });
    this.#grid.replaceChildren(...cards);
    this.#catalog.forEach((_, i) => this.#describe(i));
  }
}
