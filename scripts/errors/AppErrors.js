/**
 * Errores propios de la aplicación.
 * ValidationError: datos ingresados por el usuario que no cumplen una regla.
 * CalculationError: el cálculo no se puede realizar con los datos actuales.
 */

export class ValidationError extends Error {
  /**
   * @param {string} message Mensaje legible para el usuario.
   * @param {string|null} field Campo que originó el error.
   * @param {Record<string,string>} fields Mapa campo → mensaje (errores múltiples).
   */
  constructor(message, field = null, fields = {}) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.fields = field ? { [field]: message, ...fields } : { ...fields };
  }

  static fromMap(map) {
    const messages = Object.values(map);
    const message = messages.length > 1
      ? `Revisa ${messages.length} campos con errores.`
      : messages[0];
    return new ValidationError(message, null, map);
  }
}

export class CalculationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CalculationError';
  }
}
