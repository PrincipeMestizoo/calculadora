import { h } from '../dom.js';
import { COMPLEXITY_LABELS, COMPLEXITY_ORDER } from '../../config/constants.js';
import { formatCOP, formatNumber, formatPercent } from '../../utils/formatters.js';

/** Presupuesto: lo esencial a la vista y el detalle técnico plegado. */
export class ResultsView {
  #root;

  constructor(root) {
    this.#root = root;
  }

  renderEmpty(message) {
    this.#root.replaceChildren(h('div', { class: 'results-empty' },
      h('span', { class: 'results-empty__icon', 'aria-hidden': 'true', text: '∑' }),
      h('p', { text: message })));
  }

  render({ unadjusted, adjustment, adjusted, cost, params: p }) {
    const n = (v, d = 2) => formatNumber(v, d);

    const kpis = h('div', { class: 'kpis' },
      this.#kpi('Puntos de función', n(adjusted.value)),
      this.#kpi('Esfuerzo', `${n(cost.effortHours)} h`),
      this.#kpi('Duración', `${n(cost.duration)} meses`),
      this.#kpi('Precio total', formatCOP(cost.totalPrice), true));

    // [concepto, fórmula, valor, tipo de fila]
    const lines = [
      ['Personal', `${p.developers} × ${formatCOP(p.salary)} × ${n(p.benefitFactor)} × ${n(cost.duration)} meses`, cost.personnel],
      ['Otros costos', `${formatCOP(p.otherMonthly)}/mes × ${n(cost.duration)} meses`, cost.otherCosts],
      ['Costo base', 'Personal + otros costos', cost.baseCost, 'subtotal'],
      [`Contingencia ${formatPercent(p.contingencyPct)}`, `Costo base × ${formatPercent(p.contingencyPct)}`, cost.contingency],
      ['Costo total', 'Costo base + contingencia', cost.totalCost, 'subtotal'],
      [`Utilidad ${formatPercent(p.profitPct)}`, `Costo total × ${formatPercent(p.profitPct)}`, cost.profit],
      ['Precio antes de IVA', 'Costo total + utilidad', cost.priceBeforeTax, 'subtotal'],
      [`IVA ${formatPercent(p.ivaPct)}`, `Precio antes de IVA × ${formatPercent(p.ivaPct)}`, cost.iva],
      ['Precio total', 'Precio antes de IVA + IVA', cost.totalPrice, 'grand'],
    ];

    const costTable = h('div', { class: 'table-wrap results-main' }, h('table', { class: 'table table--cost' },
      h('tbody', {}, lines.map(([concept, , value, kind]) => h('tr', { class: kind ? `row--${kind}` : '' },
        h('th', { scope: 'row', text: concept }),
        h('td', { class: 'num', text: formatCOP(value) }))))));

    const details = h('details', { class: 'details-block' },
      h('summary', { text: 'Ver detalle del cálculo' }),
      h('div', { class: 'details-block__body' },
        this.#pfsaTable(unadjusted),
        h('div', { class: 'formula' },
          h('code', { text: `PFA = ${unadjusted.total} × [${n(adjustment.base)} + (${n(adjustment.step)} × ${adjustment.tdi})] = ${n(adjusted.raw)}${p.roundPfa && adjusted.raw !== adjusted.value ? ` ≈ ${adjusted.value}` : ''}` }),
          h('code', { text: `Esfuerzo = ${n(adjusted.value)} PF × ${n(p.hoursPerFP)} h/PF = ${n(cost.effortHours)} h` }),
          h('code', { class: 'formula__result', text: `Duración = ${n(cost.effortHours)} h ÷ (${p.developers} × ${n(p.hoursPerMonth)} h/mes) = ${n(cost.duration)} meses` })),
        h('div', { class: 'table-wrap' }, h('table', { class: 'table table--formulas' },
          h('tbody', {}, lines.map(([concept, formula]) => h('tr', {},
            h('th', { scope: 'row', text: concept }),
            h('td', { text: formula })))))),
        h('div', { class: 'indicators' },
          this.#indicator('Precio por punto de función', formatCOP(cost.pricePerFP)),
          this.#indicator('Costo por hora', formatCOP(cost.costPerHour)),
          this.#indicator('Capacidad del equipo', `${n(cost.monthlyCapacity)} h/mes`))));

    this.#root.replaceChildren(kpis, costTable, details);
  }

  #pfsaTable(unadjusted) {
    return h('div', { class: 'table-wrap' }, h('table', { class: 'table table--matrix' },
      h('caption', { text: 'Puntos sin ajustar (cantidad × peso)' }),
      h('thead', {}, h('tr', {},
        h('th', { scope: 'col', text: 'Tipo' }),
        COMPLEXITY_ORDER.map((c) => h('th', { scope: 'col', class: 'num', text: COMPLEXITY_LABELS[c] })),
        h('th', { scope: 'col', class: 'num', text: 'Total' }))),
      h('tbody', {}, unadjusted.rows.map((row) => h('tr', {},
        h('th', { scope: 'row', title: row.name }, h('span', { class: `tag tag--${row.code.toLowerCase()}`, text: row.code })),
        row.cells.map((cell) => h('td', { class: `num ${cell.count ? '' : 'muted'}`, text: `${cell.count} × ${cell.weight}` })),
        h('td', { class: 'num strong', text: row.total })))),
      h('tfoot', {}, h('tr', {},
        h('th', { scope: 'row', colspan: COMPLEXITY_ORDER.length + 1, text: 'Total' }),
        h('td', { class: 'num', text: unadjusted.total })))));
  }

  #kpi(label, value, highlight = false) {
    return h('div', { class: `kpi ${highlight ? 'kpi--highlight' : ''}` },
      h('span', { class: 'kpi__label', text: label }),
      h('strong', { class: 'kpi__value', text: value }));
  }

  #indicator(label, value) {
    return h('div', { class: 'indicator' }, h('span', { text: label }), h('strong', { text: value }));
  }
}
