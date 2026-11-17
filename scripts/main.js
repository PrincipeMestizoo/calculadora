/**
 * Punto de entrada (composition root): aquí se crean e inyectan todas las dependencias.
 * Para agregar un servicio o vista nueva basta con registrarlo aquí.
 */
import {
  FP_TYPES, COMPLEXITY_MATRICES, TYPE_KEYWORDS, GSC_CATALOG, GSC_MAX_LEVEL,
  ADJUSTMENT_BASE, ADJUSTMENT_STEP, PARAM_GROUPS, PARAM_OPTIONS, DEFAULT_PARAMS, STORAGE_KEY,
} from './config/constants.js';
import { SAMPLE_PROJECT } from './data/sampleProject.js';
import { FunctionPointService } from './services/FunctionPointService.js';
import { CostEstimator } from './services/CostEstimator.js';
import { ComplexityService } from './services/ComplexityService.js';
import { TypeSuggester } from './services/TypeSuggester.js';
import { StorageService } from './services/StorageService.js';
import { ParametersValidator } from './validators/ParametersValidator.js';
import { FunctionalityView } from './ui/views/FunctionalityView.js';
import { ComplexityAssistantView } from './ui/views/ComplexityAssistantView.js';
import { GscView } from './ui/views/GscView.js';
import { ParametersView } from './ui/views/ParametersView.js';
import { ResultsView } from './ui/views/ResultsView.js';
import { SummaryView } from './ui/views/SummaryView.js';
import { StepNavigator } from './ui/StepNavigator.js';
import { enableInfoToggles } from './ui/effects/infoToggle.js';
import { Notifier } from './ui/Notifier.js';
import { enableRipple } from './ui/effects/ripple.js';
import { $ } from './ui/dom.js';
import { AppController } from './controllers/AppController.js';

function bootstrap() {
  const notifier = new Notifier($('#toasts'));

  // Ningún error inesperado queda en silencio.
  window.addEventListener('error', () => notifier.error('Ocurrió un error inesperado. Recarga la página e inténtalo de nuevo.'));
  window.addEventListener('unhandledrejection', () => notifier.error('Una operación no se pudo completar.'));

  const app = new AppController({
    notifier,
    sample: SAMPLE_PROJECT,
    defaults: { params: DEFAULT_PARAMS, gsc: GSC_CATALOG },
    storage: new StorageService(STORAGE_KEY),
    typeSuggester: new TypeSuggester(TYPE_KEYWORDS),
    paramsValidator: new ParametersValidator(PARAM_GROUPS, PARAM_OPTIONS),
    services: {
      functionPoints: new FunctionPointService({
        types: FP_TYPES, gscCatalog: GSC_CATALOG, base: ADJUSTMENT_BASE, step: ADJUSTMENT_STEP, maxLevel: GSC_MAX_LEVEL,
      }),
      costs: new CostEstimator(),
      complexity: new ComplexityService(COMPLEXITY_MATRICES),
    },
    views: {
      functionality: new FunctionalityView({
        form: $('#fn-form'), tbody: $('#fn-table tbody'), empty: $('#fn-empty'), suggestion: $('#fn-suggestion'), count: $('#fn-count'),
      }),
      assistant: new ComplexityAssistantView({
        root: $('#assistant'), refLabel: $('#assist-ref-label'), result: $('#assist-result'), hint: $('#assist-hint'),
      }),
      gsc: new GscView({ grid: $('#gsc-grid'), total: $('#gsc-total'), factors: [$('#gsc-factor'), $('#gsc-factor-mini')] }, GSC_CATALOG),
      parameters: new ParametersView($('#params-form'), PARAM_GROUPS, PARAM_OPTIONS),
      results: new ResultsView($('#results')),
      summary: new SummaryView($('#summary')),
    },
  });

  const navigator = new StepNavigator({
    items: document.querySelectorAll('#stepper [data-step]'),
    panels: document.querySelectorAll('[data-panel]'),
  });

  navigator.init();
  app.start();
  enableRipple();
  enableInfoToggles();

  $('#btn-sample').addEventListener('click', () => app.loadSample());
  $('#btn-reset').addEventListener('click', () => {
    if (window.confirm('¿Deseas empezar un proyecto nuevo? Se borrarán los datos actuales.')) {
      app.reset();
      navigator.go(1);
    }
  });
  $('#btn-print').addEventListener('click', () => {
    if (app.recalculate({ notify: true })) window.print();
  });
  $('#btn-calculate').addEventListener('click', () => {
    app.recalculate({ notify: true });
    navigator.go(4);
  });
}

try {
  bootstrap();
} catch (error) {
  console.error(error);
  const box = document.getElementById('fatal');
  if (box) {
    box.hidden = false;
    box.textContent = `No fue posible iniciar la calculadora: ${error.message}`;
  }
}
