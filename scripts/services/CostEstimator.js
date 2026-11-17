import { CalculationError } from '../errors/AppErrors.js';
import { roundTo } from '../utils/formatters.js';

/**
 * Convierte puntos de función en esfuerzo, duración y precio (COP).
 *  Esfuerzo  = PFA × h/PF
 *  Duración  = Esfuerzo ÷ (programadores × h/mes)
 *  Personal  = programadores × salario × factor prestacional × duración
 *  Otros     = otros costos mensuales × duración
 *  Costo total = (Personal + Otros) × (1 + contingencia)
 *  Precio antes de IVA = Costo total × (1 + utilidad)
 *  Precio total = Precio antes de IVA × (1 + IVA)
 */
export class CostEstimator {
  estimate(pfa, p) {
    if (!(pfa > 0)) throw new CalculationError('Los puntos de función ajustados deben ser mayores que cero.');

    const effortHours = pfa * p.hoursPerFP;
    const monthlyCapacity = p.developers * p.hoursPerMonth;
    if (!(monthlyCapacity > 0)) throw new CalculationError('La capacidad mensual del equipo debe ser mayor que cero.');

    const durationRaw = effortHours / monthlyCapacity;
    const duration = p.roundDuration ? roundTo(durationRaw, 2) : durationRaw;

    const personnel = p.developers * p.salary * p.benefitFactor * duration;
    const otherCosts = p.otherMonthly * duration;
    const baseCost = personnel + otherCosts;
    const contingency = baseCost * (p.contingencyPct / 100);
    const totalCost = baseCost + contingency;
    const profit = totalCost * (p.profitPct / 100);
    const priceBeforeTax = totalCost + profit;
    const iva = priceBeforeTax * (p.ivaPct / 100);
    const totalPrice = priceBeforeTax + iva;

    const result = {
      effortHours, monthlyCapacity, durationRaw, duration,
      personnel, otherCosts, baseCost, contingency, totalCost,
      profit, priceBeforeTax, iva, totalPrice,
      pricePerFP: priceBeforeTax / pfa,
      costPerHour: totalCost / effortHours,
    };

    if (!Object.values(result).every(Number.isFinite)) {
      throw new CalculationError('Los valores producen un resultado fuera de rango. Revisa los parámetros.');
    }
    return result;
  }
}
