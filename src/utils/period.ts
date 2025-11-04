import dayjs from 'dayjs';

// Función para calcular días en un mes
export function getDaysInMonth(year: number, month: number): number {
  return dayjs(`${year}-${month.toString().padStart(2, '0')}-01`).daysInMonth();
}

// Función para validar formato de período mensual
export function isValidPeriodoMes(periodo: string): boolean {
  const regex = /^\d{4}-\d{2}$/;
  if (!regex.test(periodo)) return false;
  
  const [year, month] = periodo.split('-').map(Number);
  return year >= 2020 && year <= 2030 && month >= 1 && month <= 12;
}

// Función para validar formato de período bimestral
export function isValidPeriodoBimestre(periodo: string): boolean {
  const regex = /^\d{4}-\d{2}_\d{4}-\d{2}$/;
  if (!regex.test(periodo)) return false;
  
  const [inicio, fin] = periodo.split('_');
  return isValidPeriodoMes(inicio) && isValidPeriodoMes(fin);
}

// Función para convertir período bimestral a mensuales
export function bimestreToMensual(periodoBimestre: string): string[] {
  if (!isValidPeriodoBimestre(periodoBimestre)) {
    throw new Error('Formato de período bimestral inválido');
  }
  
  const [inicio, fin] = periodoBimestre.split('_');
  return [inicio, fin];
}

// Función para calcular prorrateo de venta bimestral a mensual
export function prorratearVentaBimestral(
  periodoBimestre: string,
  kwhVendidosBim: number,
  importeBim: number
): Array<{
  periodoMes: string;
  kwhVendidosMes: number;
  importeMes: number;
  diasMes: number;
  pctDistribucion: number;
}> {
  const [mes1, mes2] = bimestreToMensual(periodoBimestre);
  
  const [year1, month1] = mes1.split('-').map(Number);
  const [year2, month2] = mes2.split('-').map(Number);
  
  const diasMes1 = getDaysInMonth(year1, month1);
  const diasMes2 = getDaysInMonth(year2, month2);
  const totalDias = diasMes1 + diasMes2;
  
  // Calcular porcentajes de distribución por días
  const pctMes1 = diasMes1 / totalDias;
  const pctMes2 = diasMes2 / totalDias;
  
  return [
    {
      periodoMes: mes1,
      kwhVendidosMes: Number((kwhVendidosBim * pctMes1).toFixed(2)),
      importeMes: Number((importeBim * pctMes1).toFixed(2)),
      diasMes: diasMes1,
      pctDistribucion: Number((pctMes1 * 100).toFixed(2)),
    },
    {
      periodoMes: mes2,
      kwhVendidosMes: Number((kwhVendidosBim * pctMes2).toFixed(2)),
      importeMes: Number((importeBim * pctMes2).toFixed(2)),
      diasMes: diasMes2,
      pctDistribucion: Number((pctMes2 * 100).toFixed(2)),
    },
  ];
}

// Función para obtener lista de períodos mensuales en un rango
export function getPeriodosEnRango(inicio: string, fin: string): string[] {
  if (!isValidPeriodoMes(inicio) || !isValidPeriodoMes(fin)) {
    throw new Error('Formato de período inválido');
  }
  
  const periodos: string[] = [];
  const fechaInicio = dayjs(`${inicio}-01`);
  const fechaFin = dayjs(`${fin}-01`);
  
  let fechaActual = fechaInicio;
  while (fechaActual.isSameOrBefore(fechaFin)) {
    periodos.push(fechaActual.format('YYYY-MM'));
    fechaActual = fechaActual.add(1, 'month');
  }
  
  return periodos;
}

// Función para obtener período anterior
export function getPeriodoAnterior(periodo: string): string {
  if (!isValidPeriodoMes(periodo)) {
    throw new Error('Formato de período inválido');
  }
  
  const fecha = dayjs(`${periodo}-01`);
  return fecha.subtract(1, 'month').format('YYYY-MM');
}

// Función para obtener período siguiente
export function getPeriodoSiguiente(periodo: string): string {
  if (!isValidPeriodoMes(periodo)) {
    throw new Error('Formato de período inválido');
  }
  
  const fecha = dayjs(`${periodo}-01`);
  return fecha.add(1, 'month').format('YYYY-MM');
}

// Función para calcular diferencia en meses entre períodos
export function getMesesEntrePeriodos(inicio: string, fin: string): number {
  if (!isValidPeriodoMes(inicio) || !isValidPeriodoMes(fin)) {
    throw new Error('Formato de período inválido');
  }
  
  const fechaInicio = dayjs(`${inicio}-01`);
  const fechaFin = dayjs(`${fin}-01`);
  
  return fechaFin.diff(fechaInicio, 'month') + 1;
}

// Función para validar secuencia bimestral
export function validarSecuenciaBimestre(periodoBimestre: string): boolean {
  try {
    const [mes1, mes2] = bimestreToMensual(periodoBimestre);
    const fecha1 = dayjs(`${mes1}-01`);
    const fecha2 = dayjs(`${mes2}-01`);
    
    // Verificar que mes2 sea exactamente 1 mes después de mes1
    return fecha2.diff(fecha1, 'month') === 1;
  } catch {
    return false;
  }
}

// Función para generar período bimestral desde mes inicial
export function generarPeriodoBimestre(mesInicio: string): string {
  if (!isValidPeriodoMes(mesInicio)) {
    throw new Error('Formato de período inválido');
  }
  
  const mesFin = getPeriodoSiguiente(mesInicio);
  return `${mesInicio}_${mesFin}`;
}

// Función para calcular porcentaje de pérdida
export function calcularPerdidaPorcentaje(compra: number, venta: number): number {
  if (compra <= 0) return 0;
  
  const perdida = compra - venta;
  const pctPerdida = (perdida / compra) * 100;
  
  return Number(pctPerdida.toFixed(2));
}

// Función para determinar si una pérdida es "normal" o "alta"
export function evaluarPerdida(pctPerdida: number): {
  nivel: 'normal' | 'moderada' | 'alta' | 'critica';
  descripcion: string;
} {
  if (pctPerdida < 0) {
    return {
      nivel: 'normal',
      descripcion: 'Excedente de venta (posible error de medición)',
    };
  } else if (pctPerdida <= 5) {
    return {
      nivel: 'normal',
      descripcion: 'Pérdidas técnicas normales',
    };
  } else if (pctPerdida <= 10) {
    return {
      nivel: 'moderada',
      descripcion: 'Pérdidas moderadas - revisar red',
    };
  } else if (pctPerdida <= 20) {
    return {
      nivel: 'alta',
      descripcion: 'Pérdidas altas - requiere investigación',
    };
  } else {
    return {
      nivel: 'critica',
      descripcion: 'Pérdidas críticas - intervención urgente',
    };
  }
}

// Función para normalizar datos de medición
export function normalizarMedicion(valor: number, precision = 2): number {
  return Number(Math.max(0, valor).toFixed(precision));
}

// Función para calcular factor de carga
export function calcularFactorCarga(energiaTotal: number, demandaMax: number, diasPeriodo: number): number {
  if (demandaMax <= 0 || diasPeriodo <= 0) return 0;
  
  const horasPeriodo = diasPeriodo * 24;
  const energiaMaxPosible = demandaMax * horasPeriodo;
  
  const factorCarga = (energiaTotal / energiaMaxPosible) * 100;
  return Number(factorCarga.toFixed(2));
}