import { h, showFieldErrors, clearFieldErrors } from '../dom.js';
import { createInfo } from '../effects/infoToggle.js';
import { formatCOP } from '../../utils/formatters.js';

/** Dibuja los parámetros económicos a partir del esquema de configuración (abierto a nuevos campos). */
export class ParametersView {
  #form; #groups; #options;

  constructor(form, groups, options) {
    this.#form = form;
    this.#groups = groups;
    this.#options = options;
    this.#render();
  }

  init({ onChange }) {
    this.#form.addEventListener('submit', (e) => e.preventDefault());
    this.#form.addEventListener('input', (event) => {
      event.target.removeAttribute('aria-invalid');
      this.#updatePreview(event.target);
      onChange(this.read());
    });
  }

  read() {
    const values = {};
    for (const field of this.#fields()) values[field.key] = this.#form.elements[field.key].value;
    for (const option of this.#options) values[option.key] = this.#form.elements[option.key].checked;
    return values;
  }

  set(values) {
    for (const field of this.#fields()) {
      const input = this.#form.elements[field.key];
      input.value = values[field.key] ?? field.default;
      this.#updatePreview(input);
    }
    for (const option of this.#options) this.#form.elements[option.key].checked = Boolean(values[option.key] ?? option.default);
    clearFieldErrors(this.#form);
  }

  showErrors(fields) { showFieldErrors(this.#form, fields); }

  clearErrors() { clearFieldErrors(this.#form); }

  #fields() { return this.#groups.flatMap((g) => g.fields); }

  #updatePreview(input) {
    const preview = this.#form.querySelector(`[data-preview-for="${input.name}"]`);
    if (!preview) return;
    const n = Number(input.value);
    preview.textContent = input.value !== '' && Number.isFinite(n) ? formatCOP(n) : '';
  }

  #renderField(f) {
    const id = `param-${f.key}`;
    const [infoButton, infoText] = f.help ? createInfo(f.help, `Ayuda: ${f.label}`) : [null, null];
    return h('div', { class: 'field' },
      h('div', { class: 'field__label' }, h('label', { for: id, text: f.label }), infoButton),
      infoText,
      h('div', { class: 'input-unit' },
        h('input', { id, name: f.key, type: 'number', inputmode: 'decimal', min: f.min, max: f.max, step: f.step, required: true, value: f.default }),
        h('span', { class: 'input-unit__unit', text: f.unit })),
      f.money ? h('small', { class: 'field__preview', dataset: { previewFor: f.key } }) : null,
      h('small', { class: 'field__error', dataset: { errorFor: f.key } }));
  }

  #render() {
    const fieldsets = this.#groups.map((group) => h('fieldset', { class: 'param-group' },
      h('legend', { text: group.title }),
      group.fields.map((f) => this.#renderField(f))));

    const advanced = h('details', { class: 'advanced' },
      h('summary', { text: 'Opciones de redondeo' }),
      h('div', { class: 'advanced__body' },
        this.#options.map((o) => h('label', { class: 'switch' },
          h('input', { type: 'checkbox', name: o.key, checked: o.default }),
          h('span', { class: 'switch__track', 'aria-hidden': 'true' }),
          h('span', { text: o.label })))));

    this.#form.replaceChildren(...fieldsets, advanced);
    this.#form.querySelectorAll('input[type="number"]').forEach((input) => this.#updatePreview(input));
  }
}
