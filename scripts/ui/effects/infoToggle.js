import { h } from '../dom.js';

let counter = 0;

/** Crea un botón "?" y su texto de ayuda oculto. Devuelve [botón, texto]. */
export function createInfo(text, label = 'Ver ayuda') {
  const id = `info-${++counter}`;
  const button = h('button', {
    type: 'button', class: 'info', 'data-info': true, 'aria-expanded': 'false', 'aria-controls': id, 'aria-label': label, text: '?',
  });
  const content = h('p', { id, class: 'info-text', hidden: true, text });
  return [button, content];
}

/** Abre y cierra las ayudas (delegación: funciona con elementos creados después). */
export function enableInfoToggles(root = document) {
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-info]');
    if (!button) return;
    event.preventDefault();
    const target = document.getElementById(button.getAttribute('aria-controls'));
    if (!target) return;
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open));
    target.hidden = open;
  });
}
