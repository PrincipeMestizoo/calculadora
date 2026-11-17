import { showFieldErrors, clearFieldErrors } from '../dom.js';

/** Asistente que calcula la complejidad con DET y FTR/RET. */
export class ComplexityAssistantView {
  #root; #refLabel; #result; #hint;

  constructor({ root, refLabel, result, hint }) {
    this.#root = root;
    this.#refLabel = refLabel;
    this.#result = result;
    this.#hint = hint;
  }

  init({ onCalculate }) {
    this.#root.querySelector('[data-action="assist"]').addEventListener('click', () => {
      onCalculate({ det: this.#root.querySelector('[name="det"]').value, ref: this.#root.querySelector('[name="ref"]').value });
    });
    this.#root.addEventListener('input', (e) => e.target.removeAttribute('aria-invalid'));
  }

  configure({ refLabel, refMin, typeName }) {
    this.#refLabel.textContent = refLabel;
    this.#root.querySelector('[name="ref"]').min = refMin;
    this.#hint.textContent = `Tipo seleccionado: ${typeName}`;
    this.#result.textContent = '';
    clearFieldErrors(this.#root);
  }

  showResult(label) {
    clearFieldErrors(this.#root);
    this.#result.textContent = `Complejidad ${label} aplicada.`;
  }

  showErrors(fields) {
    this.#result.textContent = '';
    showFieldErrors(this.#root, fields);
  }
}
