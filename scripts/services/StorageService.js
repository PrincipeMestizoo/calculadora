/** Guarda el proyecto en el navegador. Nunca rompe la app si el almacenamiento falla. */
export class StorageService {
  #key;
  #storage;

  constructor(key, storage = globalThis.localStorage) {
    this.#key = key;
    this.#storage = storage;
  }

  load() {
    try {
      const raw = this.#storage?.getItem(this.#key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      this.clear();
      return null;
    }
  }

  save(data) {
    try {
      this.#storage?.setItem(this.#key, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  clear() {
    try {
      this.#storage?.removeItem(this.#key);
    } catch {
      /* almacenamiento no disponible: no hay nada que limpiar */
    }
  }
}
