import { h, showFieldErrors, clearFieldErrors } from '../dom.js';
import { FP_TYPES, COMPLEXITY_ORDER, COMPLEXITY_LABELS } from '../../config/constants.js';

/** Formulario y tabla de funcionalidades. Solo muestra y lee datos; no calcula. */
export class FunctionalityView {
  #form; #tbody; #empty; #suggestion; #count;
  #handlers = {};

  constructor({ form, tbody, empty, suggestion, count }) {
    this.#form = form;
    this.#tbody = tbody;
    this.#empty = empty;
    this.#suggestion = suggestion;
    this.#count = count;
    this.#fillSelects();
  }

  init({ onAdd, onRemove, onNameInput, onTypeChange }) {
    this.#handlers = { onAdd, onRemove, onNameInput, onTypeChange };

    this.#form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.#handlers.onAdd?.(this.read());
    });
    this.#form.elements.name.addEventListener('input', (e) => this.#handlers.onNameInput?.(e.target.value));
    this.#form.elements.type.addEventListener('change', (e) => this.#handlers.onTypeChange?.(e.target.value));
    this.#form.addEventListener('input', (e) => e.target.removeAttribute('aria-invalid'));

    this.#tbody.addEventListener('click', (event) => {
      const button = event.target.closest('[data-remove]');
      if (button) this.#handlers.onRemove?.(button.dataset.remove);
    });

    this.#suggestion.addEventListener('click', (event) => {
      const button = event.target.closest('[data-apply-type]');
      if (!button) return;
      this.setType(button.dataset.applyType);
      this.#handlers.onTypeChange?.(button.dataset.applyType);
    });
  }

  read() {
    const { name, quantity, type, complexity } = this.#form.elements;
    return { name: name.value, quantity: quantity.value, type: type.value, complexity: complexity.value };
  }

  get selectedType() { return this.#form.elements.type.value; }

  setType(type) { this.#form.elements.type.value = type; }

  setComplexity(complexity) {
    const select = this.#form.elements.complexity;
    select.value = complexity;
    select.classList.remove('flash');
    void select.offsetWidth; // reinicia la animación
    select.classList.add('flash');
  }

  reset() {
    this.#form.elements.name.value = '';
    this.#form.elements.quantity.value = '1';
    this.setSuggestion(null);
    clearFieldErrors(this.#form);
    this.#form.elements.name.focus();
  }

  showErrors(fields) { showFieldErrors(this.#form, fields); }

  setSuggestion(suggestion) {
    this.#suggestion.replaceChildren();
    if (!suggestion) return;
    const type = FP_TYPES[suggestion.type];
    this.#suggestion.append(
      '¿Es ',
      h('button', { type: 'button', class: 'chip', dataset: { applyType: type.code }, text: `${type.code} · ${type.name}` }),
      '?',
      suggestion.note ?? '',
    );
  }

  render(functionalities) {
    this.#tbody.replaceChildren(...functionalities.map((fn) => h('tr', { class: 'row-enter' },
      h('td', { 'data-label': 'Funcionalidad', text: fn.name }),
      h('td', { 'data-label': 'Cant.', class: 'num', text: fn.quantity }),
      h('td', { 'data-label': 'Tipo' }, h('span', { class: `tag tag--${fn.type.toLowerCase()}`, title: FP_TYPES[fn.type].name, text: fn.type })),
      h('td', { 'data-label': 'Complejidad', text: COMPLEXITY_LABELS[fn.complexity] }),
      h('td', { 'data-label': 'PF', class: 'num strong', text: fn.points }),
      h('td', { class: 'actions' },
        h('button', { type: 'button', class: 'btn btn--icon btn--danger', dataset: { remove: fn.id }, 'aria-label': `Eliminar ${fn.name}`, title: 'Eliminar', text: '✕' })),
    )));
    this.#empty.hidden = functionalities.length > 0;
    this.#count.textContent = functionalities.length;
  }

  #fillSelects() {
    const { type, complexity } = this.#form.elements;
    type.replaceChildren(...Object.values(FP_TYPES).map((t) => h('option', { value: t.code, title: t.hint, text: `${t.code} · ${t.name}` })));
    complexity.replaceChildren(...COMPLEXITY_ORDER.map((c) => h('option', { value: c, text: COMPLEXITY_LABELS[c] })));
  }
}
