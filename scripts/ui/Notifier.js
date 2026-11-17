import { h } from './dom.js';

const ICONS = { success: '✓', error: '!', info: 'i' };

/** Mensajes emergentes (toasts) accesibles. */
export class Notifier {
  #container;
  #duration;

  constructor(container, duration = 4200) {
    this.#container = container;
    this.#duration = duration;
  }

  success(message) { this.#show(message, 'success'); }

  error(message) { this.#show(message, 'error'); }

  info(message) { this.#show(message, 'info'); }

  #show(message, kind) {
    const toast = h('div', { class: `toast toast--${kind}`, role: kind === 'error' ? 'alert' : 'status' },
      h('span', { class: 'toast__icon', 'aria-hidden': 'true', text: ICONS[kind] }),
      h('p', { class: 'toast__text', text: message }),
      h('button', { class: 'toast__close', type: 'button', 'aria-label': 'Cerrar mensaje', text: '×', onclick: () => this.#dismiss(toast) }));
    this.#container.append(toast);
    setTimeout(() => this.#dismiss(toast), this.#duration);
  }

  #dismiss(toast) {
    if (!toast.isConnected || toast.classList.contains('is-leaving')) return;
    toast.classList.add('is-leaving');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
    setTimeout(() => toast.remove(), 600);
  }
}
