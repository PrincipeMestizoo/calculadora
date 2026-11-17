# Calculadora de Costos de Software

Estimación por **Puntos de Función (IFPUG)** de esfuerzo, duración y presupuesto en **pesos colombianos** (IVA incluido) para cualquier proyecto de software.

## Cómo ejecutarla
Usa módulos ES, así que debe abrirse desde un servidor local (no con doble clic):

- VS Code: extensión **Live Server** → "Open with Live Server", o
- Terminal: `python3 -m http.server 8000` y abre http://localhost:8000

## Estructura
```
scripts/
  main.js                      Punto de entrada: crea e inyecta dependencias
  config/constants.js          Pesos IFPUG, matrices, 14 GSC, parámetros por defecto
  data/sampleProject.js        Proyecto de ejemplo
  errors/AppErrors.js          ValidationError, CalculationError
  validators/                  Reglas de validación reutilizables
  models/Functionality.js      Requisito funcional (siempre válido)
  services/                    PF, costos, complejidad, sugerencia de tipo, almacenamiento
  controllers/AppController.js Coordina vistas y servicios
  ui/                          Vistas, menú de pasos, resumen, notificaciones, efectos
styles/                        base, layout, components, animations, responsive, print
```
