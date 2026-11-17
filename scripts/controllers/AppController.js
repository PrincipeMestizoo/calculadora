import { ValidationError, CalculationError } from '../errors/AppErrors.js';
import { Functionality } from '../models/Functionality.js';
import { COMPLEXITY_LABELS, FP_TYPES } from '../config/constants.js';
import { debounce } from '../ui/dom.js';

/**
 * Coordina vistas y servicios. Recibe todas sus dependencias desde main.js
 * (inversión de dependencias): no crea servicios ni conoce el HTML.
 */
export class AppController {
  #deps;
  #state = { functionalities: [], gsc: [], params: {} };
  #recalculateLater = debounce(() => this.recalculate(), 200);

  constructor(deps) {
    this.#deps = deps;
  }

  start() {
    const { views, defaults } = this.#deps;

    views.functionality.init({
      onAdd: (raw) => this.#addFunctionality(raw),
      onRemove: (id) => this.#removeFunctionality(id),
      onNameInput: (name) => views.functionality.setSuggestion(this.#deps.typeSuggester.suggest(name)),
      onTypeChange: (type) => this.#configureAssistant(type),
    });
    views.assistant.init({ onCalculate: (input) => this.#assistComplexity(input) });
    views.gsc.init({ onChange: (levels) => { this.#state.gsc = levels; this.#persist(); this.recalculate(); } });
    views.parameters.init({ onChange: (raw) => { this.#state.params = raw; this.#recalculateLater(); } });

    this.#state.gsc = views.gsc.read();
    this.#state.params = { ...defaults.params };
    this.#restore();
    this.#configureAssistant(views.functionality.selectedType);
    this.recalculate();
  }

  /** Calcula todo. Con `notify` muestra un mensaje si algo impide el cálculo. */
  recalculate({ notify = false } = {}) {
    const { services, views } = this.#deps;
    try {
      const params = this.#validParams();
      const adjustment = services.functionPoints.adjustment(this.#state.gsc);
      views.gsc.showSummary(adjustment);

      const unadjusted = services.functionPoints.unadjusted(this.#state.functionalities);
      const adjusted = services.functionPoints.adjusted(unadjusted.total, adjustment.factor, { round: params.roundPfa });
      const cost = services.costs.estimate(adjusted.value, params);

      views.results.render({ unadjusted, adjustment, adjusted, cost, params });
      views.summary.render({ adjusted, cost });
      this.#persist();
      return true;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof CalculationError) {
        views.results.renderEmpty(error.message);
        views.summary.renderEmpty();
        if (notify) this.#deps.notifier.error(error.message);
        return false;
      }
      throw error;
    }
  }

  loadSample() {
    const { sample, defaults, views, notifier } = this.#deps;
    this.#state.functionalities = sample.functionalities.map((raw) => new Functionality(raw));
    this.#state.gsc = [...sample.gsc];
    this.#state.params = { ...defaults.params };
    views.gsc.set(this.#state.gsc);
    views.parameters.set(this.#state.params);
    views.functionality.render(this.#state.functionalities);
    this.recalculate();
    notifier.success('Proyecto de ejemplo cargado.');
  }

  reset() {
    const { defaults, views, storage, notifier } = this.#deps;
    this.#state.functionalities = [];
    this.#state.gsc = defaults.gsc.map(() => 0);
    this.#state.params = { ...defaults.params };
    views.gsc.set(this.#state.gsc);
    views.parameters.set(this.#state.params);
    views.functionality.render([]);
    views.functionality.reset();
    storage.clear();
    this.recalculate();
    notifier.info('Nuevo proyecto en blanco.');
  }

  #addFunctionality(raw) {
    const { views, notifier } = this.#deps;
    try {
      const fn = new Functionality(raw);
      if (this.#state.functionalities.some((f) => f.isSameAs(fn))) {
        throw new ValidationError(`“${fn.name}” ya está registrada como ${fn.type}.`, 'name');
      }
      this.#state.functionalities = [...this.#state.functionalities, fn];
      views.functionality.render(this.#state.functionalities);
      views.functionality.reset();
      this.recalculate();
      notifier.success(`Agregada: ${fn.name}`);
    } catch (error) {
      this.#handleError(error, views.functionality);
    }
  }

  #removeFunctionality(id) {
    const removed = this.#state.functionalities.find((f) => f.id === id);
    if (!removed) return;
    this.#state.functionalities = this.#state.functionalities.filter((f) => f.id !== id);
    this.#deps.views.functionality.render(this.#state.functionalities);
    this.recalculate();
    this.#deps.notifier.info(`Eliminada: ${removed.name}.`);
  }

  #configureAssistant(type) {
    const config = this.#deps.services.complexity.describe(type);
    this.#deps.views.assistant.configure({ ...config, typeName: `${type} · ${FP_TYPES[type].name}` });
  }

  #assistComplexity({ det, ref }) {
    const { views, services } = this.#deps;
    try {
      const complexity = services.complexity.resolve(views.functionality.selectedType, det, ref);
      views.functionality.setComplexity(complexity);
      views.assistant.showResult(COMPLEXITY_LABELS[complexity]);
    } catch (error) {
      this.#handleError(error, views.assistant);
    }
  }

  #validParams() {
    const { views, paramsValidator } = this.#deps;
    try {
      const params = paramsValidator.validate(this.#state.params);
      views.parameters.clearErrors();
      return params;
    } catch (error) {
      if (error instanceof ValidationError) {
        views.parameters.showErrors(error.fields);
        throw new ValidationError(`Revisa los costos del equipo: ${error.message}`);
      }
      throw error;
    }
  }

  #restore() {
    const { storage, views, notifier } = this.#deps;
    const saved = storage.load();
    if (!saved) return;
    try {
      const functionalities = (saved.functionalities ?? []).map((raw) => new Functionality(raw));
      this.#state.functionalities = functionalities;
      if (Array.isArray(saved.gsc) && saved.gsc.length === this.#state.gsc.length) this.#state.gsc = saved.gsc;
      this.#state.params = { ...this.#state.params, ...(saved.params ?? {}) };
      views.functionality.render(functionalities);
      views.gsc.set(this.#state.gsc);
      views.parameters.set(this.#state.params);
      if (functionalities.length) notifier.info('Se recuperó tu último proyecto.');
    } catch {
      storage.clear();
      notifier.error('Los datos guardados estaban dañados y se descartaron.');
    }
  }

  #persist() {
    this.#deps.storage.save({
      functionalities: this.#state.functionalities.map((f) => f.toJSON()),
      gsc: this.#state.gsc,
      params: this.#state.params,
    });
  }

  #handleError(error, view) {
    if (error instanceof ValidationError) {
      view?.showErrors?.(error.fields);
      this.#deps.notifier.error(error.message);
      return;
    }
    if (error instanceof CalculationError) {
      this.#deps.notifier.error(error.message);
      return;
    }
    throw error;
  }
}
