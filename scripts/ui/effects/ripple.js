/** Efecto de onda al pulsar cualquier botón .btn (delegación de eventos: sirve también para botones creados después). */
export function enableRipple(root = document) {
  root.addEventListener('pointerdown', (event) => {
    const button = event.target.closest('.btn');
    if (!button || button.disabled) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const wave = document.createElement('span');
    wave.className = 'ripple';
    wave.style.width = `${size}px`;
    wave.style.height = `${size}px`;
    wave.style.left = `${event.clientX - rect.left - size / 2}px`;
    wave.style.top = `${event.clientY - rect.top - size / 2}px`;
    button.append(wave);
    wave.addEventListener('animationend', () => wave.remove(), { once: true });
  });
}
