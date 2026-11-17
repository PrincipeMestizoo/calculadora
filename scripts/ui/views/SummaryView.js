import { h } from '../dom.js';
import { formatCOP, formatNumber } from '../../utils/formatters.js';

/** Resumen compacto y siempre visible del estimado actual. */
export class SummaryView {
  #root;

  constructor(root) {
    this.#root = root;
  }

  renderEmpty() {
    this.#root.replaceChildren(
      h('p', { class: 'summary__title', text: 'Estimado' }),
      h('p', { class: 'summary__empty', text: 'Agrega funcionalidades para ver el estimado.' }),
    );
  }

  render({ adjusted, cost }) {
    const row = (label, value) => h('div', { class: 'summary__row' }, h('span', { text: label }), h('strong', { text: value }));
    this.#root.replaceChildren(
      h('p', { class: 'summary__title', text: 'Estimado' }),
      row('Puntos de función', formatNumber(adjusted.value)),
      row('Esfuerzo', `${formatNumber(cost.effortHours)} h`),
      row('Duración', `${formatNumber(cost.duration)} meses`),
      h('div', { class: 'summary__total' },
        h('span', { text: 'Precio total' }),
        h('strong', { text: formatCOP(cost.totalPrice) })),
    );
  }
}
