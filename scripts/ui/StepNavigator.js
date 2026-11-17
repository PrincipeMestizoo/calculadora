/** Muestra un paso a la vez y mantiene sincronizado el menú de pasos. */
export class StepNavigator {
  #items;
  #panels;
  #current = 1;
  #onChange;

  constructor({ items, panels }) {
    this.#items = [...items];
    this.#panels = [...panels];
    if (!this.#items.length || this.#items.length !== this.#panels.length) {
      throw new Error('El menú de pasos y los paneles no coinciden.');
    }
  }

  get current() { return this.#current; }

  get total() { return this.#panels.length; }

  init({ onChange } = {}) {
    this.#onChange = onChange;
    this.#items.forEach((item) => item.addEventListener('click', () => this.go(Number(item.dataset.step))));

    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-nav]');
      if (!button) return;
      if (button.dataset.nav === 'next') this.next();
      else if (button.dataset.nav === 'prev') this.prev();
    });

    this.go(1, { focus: false });
  }

  next() { this.go(this.#current + 1); }

  prev() { this.go(this.#current - 1); }

  go(step, { focus = true } = {}) {
    const target = Math.min(Math.max(Number(step) || 1, 1), this.total);
    this.#current = target;

    this.#panels.forEach((panel, i) => { panel.hidden = i + 1 !== target; });
    this.#items.forEach((item, i) => {
      const n = i + 1;
      item.classList.toggle('is-done', n < target);
      if (n === target) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });

    if (focus) {
      const panel = this.#panels[target - 1];
      panel.querySelector('h2')?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    this.#onChange?.(target);
  }
}
