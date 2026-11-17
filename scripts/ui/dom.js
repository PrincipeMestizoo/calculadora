/** Utilidades mínimas de DOM. El texto siempre se inserta como texto (sin innerHTML), evitando inyección de HTML. */

export function $(selector, root = document) {
  const element = root.querySelector(selector);
  if (!element) throw new Error(`No se encontró el elemento requerido: ${selector}`);
  return element;
}

export function h(tag, props = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') element.className = value;
    else if (key === 'text') element.textContent = value;
    else if (key === 'dataset') Object.assign(element.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') element.addEventListener(key.slice(2), value);
    else element.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    element.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return element;
}

/** Marca los campos con error (aria-invalid) y escribe el mensaje bajo cada uno. */
export function showFieldErrors(root, fields = {}) {
  clearFieldErrors(root);
  for (const [name, message] of Object.entries(fields)) {
    const input = root.querySelector(`[name="${CSS.escape(name)}"]`);
    const slot = root.querySelector(`[data-error-for="${CSS.escape(name)}"]`);
    input?.setAttribute('aria-invalid', 'true');
    if (slot) slot.textContent = message;
  }
}

export function clearFieldErrors(root) {
  root.querySelectorAll('[aria-invalid="true"]').forEach((el) => el.removeAttribute('aria-invalid'));
  root.querySelectorAll('[data-error-for]').forEach((el) => { el.textContent = ''; });
}

export function debounce(fn, wait = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
