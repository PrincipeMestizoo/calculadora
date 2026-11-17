/**
 * Proyecto de ejemplo: sistema de seguimiento académico.
 * Resultado esperado con los parámetros por defecto:
 * PFSA 103 · PFA 100 · 800 h · 2,86 meses · $ 82.751.629
 */
export const SAMPLE_PROJECT = Object.freeze({
  functionalities: [
    { name: 'Registrar instructores', quantity: 1, type: 'EI', complexity: 'ALTA' },
    { name: 'Ingresar grupos', quantity: 1, type: 'EI', complexity: 'BAJA' },
    { name: 'Ingresar aprendices', quantity: 1, type: 'EI', complexity: 'MEDIA' },
    { name: 'Registrar comentarios a aprendices', quantity: 1, type: 'EI', complexity: 'MEDIA' },
    { name: 'Seleccionar grupo', quantity: 1, type: 'EI', complexity: 'BAJA' },
    { name: 'Seleccionar aprendiz', quantity: 1, type: 'EI', complexity: 'BAJA' },
    { name: 'Listar anotaciones del aprendiz', quantity: 1, type: 'EO', complexity: 'MEDIA' },
    { name: 'Listar anotaciones realizadas al grupo', quantity: 1, type: 'EO', complexity: 'ALTA' },
    { name: 'Tablas (entidades) de la base de datos', quantity: 6, type: 'ILF', complexity: 'BAJA' },
    { name: 'Archivo externo para poblar datos', quantity: 1, type: 'EIF', complexity: 'ALTA' },
    { name: 'Recuperar y buscar datos', quantity: 4, type: 'EQ', complexity: 'MEDIA' },
  ],
  gsc: [4, 3, 1, 1, 2, 5, 5, 3, 1, 1, 1, 1, 2, 2],
});
