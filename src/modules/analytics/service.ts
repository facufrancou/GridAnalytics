import { PrismaClient } from '@prisma/client';
import type {
  BalanceCompraPorBoca,
  BalanceVentaPorBoca,
  BalanceGeneral,
  MensualizeVentaRequest,
  MensualizeVentaResponse,
  BalanceQuery,
  AnalisisPerdida,
  ResumenPeriodo,
  TopPerdida,
  TendenciaPerdida,
  ComparativaPerdida,
  Sectorizacion,
  AlertaPerdida,
} from './schemas.js';

// Utilidades de período simplificadas para evitar errores de TypeScript
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function isValidPeriodoMes(periodo: string): boolean {
  const regex = /^\d{4}-\d{2}$/;
  if (!regex.test(periodo)) return false;
  
  const parts = periodo.split('-');
  if (parts.length !== 2) return false;
  
  const year = parseInt(parts[0] || '0', 10);
  const month = parseInt(parts[1] || '0', 10);
  
  return year >= 2020 && year <= 2030 && month >= 1 && month <= 12;
}

function bimestreToMensual(periodoBimestre: string): [string, string] {
  const parts = periodoBimestre.split('_');
  if (parts.length !== 2) throw new Error('Formato de período bimestral inválido');
  
  const inicio = parts[0];
  const fin = parts[1];
  
  if (!inicio || !fin || !isValidPeriodoMes(inicio) || !isValidPeriodoMes(fin)) {
    throw new Error('Períodos inválidos en bimestre');
  }
  
  return [inicio, fin];
}

function calcularPerdidaPorcentaje(compra: number, venta: number): number {
  if (compra <= 0) return 0;
  
  const perdida = compra - venta;
  const pctPerdida = (perdida / compra) * 100;
  
  return Number(pctPerdida.toFixed(2));
}

function evaluarPerdida(pctPerdida: number): {
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

export class AnalyticsService {
  constructor(private prisma: PrismaClient) {}

  // Mensualización de venta bimestral
  async mensualizeVentaBimestral(data: MensualizeVentaRequest): Promise<MensualizeVentaResponse> {
    const { periodoBimestre, kwhVendidosBim, importeBim = 0 } = data;

    const [mes1, mes2] = bimestreToMensual(periodoBimestre);
    
    const year1 = parseInt(mes1.split('-')[0] || '0', 10);
    const month1 = parseInt(mes1.split('-')[1] || '0', 10);
    const year2 = parseInt(mes2.split('-')[0] || '0', 10);
    const month2 = parseInt(mes2.split('-')[1] || '0', 10);
    
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

  // Balance compra por boca y período
  async getBalanceCompraPorBoca(query: BalanceQuery): Promise<BalanceCompraPorBoca[]> {
    const whereClause: any = {
      periodo_mes: {
        gte: query.periodoInicio,
        lte: query.periodoFin,
      },
    };

    if (query.idBoca) {
      whereClause.id_boca = query.idBoca;
    }

    const compras = await this.prisma.mediciones_compra.groupBy({
      by: ['id_boca', 'periodo_mes'],
      where: whereClause,
      _sum: {
        kwh_comprados_mes: true,
        importe_comprado_mes: true,
      },
    });

    return compras.map((compra) => ({
      idBoca: compra.id_boca,
      periodoMes: compra.periodo_mes,
      kwhCompradosMes: compra._sum.kwh_comprados_mes || 0,
      importeCompradoMes: compra._sum.importe_comprado_mes || 0,
    }));
  }

  // Balance venta por boca y período (con mensualización automática)
  async getBalanceVentaPorBoca(query: BalanceQuery): Promise<BalanceVentaPorBoca[]> {
    const whereClause: any = {
      periodo_mes: {
        gte: query.periodoInicio,
        lte: query.periodoFin,
      },
    };

    if (query.idBoca) {
      whereClause.id_boca = query.idBoca;
    }

    // Obtener ventas mensuales directas
    const ventasMensuales = await this.prisma.mediciones_venta.groupBy({
      by: ['id_boca', 'periodo_mes'],
      where: {
        ...whereClause,
        tipo_facturacion: 'MENSUAL',
      },
      _sum: {
        kwh_vendidos_mes: true,
        importe_vendido_mes: true,
      },
    });

    // Obtener ventas bimestrales para mensualizar
    const ventasBimestrales = await this.prisma.mediciones_venta.findMany({
      where: {
        ...whereClause,
        tipo_facturacion: 'BIMESTRAL',
      },
    });

    const ventasResult: BalanceVentaPorBoca[] = [];

    // Agregar ventas mensuales directas
    for (const venta of ventasMensuales) {
      ventasResult.push({
        idBoca: venta.id_boca,
        periodoMes: venta.periodo_mes,
        kwhVendidosMes: venta._sum.kwh_vendidos_mes || 0,
        importeVendidoMes: venta._sum.importe_vendido_mes || 0,
      });
    }

    // Procesar ventas bimestrales
    for (const ventaBim of ventasBimestrales) {
      try {
        const mensualizados = await this.mensualizeVentaBimestral({
          periodoBimestre: ventaBim.periodo_bimestre || '',
          kwhVendidosBim: ventaBim.kwh_vendidos_bim || 0,
          importeBim: ventaBim.importe_vendido_bim || 0,
        });

        for (const mensual of mensualizados) {
          // Solo incluir si está en el rango solicitado
          if (mensual.periodoMes >= query.periodoInicio && mensual.periodoMes <= query.periodoFin) {
            // Buscar si ya existe una venta mensual para este período
            const existeIndex = ventasResult.findIndex(
              (v) => v.idBoca === ventaBim.id_boca && v.periodoMes === mensual.periodoMes
            );

            if (existeIndex >= 0) {
              // Sumar a la venta existente
              ventasResult[existeIndex]!.kwhVendidosMes += mensual.kwhVendidosMes;
              ventasResult[existeIndex]!.importeVendidoMes += mensual.importeMes;
            } else {
              // Agregar nueva venta mensualizada
              ventasResult.push({
                idBoca: ventaBim.id_boca,
                periodoMes: mensual.periodoMes,
                kwhVendidosMes: mensual.kwhVendidosMes,
                importeVendidoMes: mensual.importeMes,
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error mensualizing bimestre ${ventaBim.periodo_bimestre}:`, error);
      }
    }

    return ventasResult.sort((a, b) => {
      if (a.idBoca === b.idBoca) {
        return a.periodoMes.localeCompare(b.periodoMes);
      }
      return a.idBoca.localeCompare(b.idBoca);
    });
  }

  // Balance general con cálculo de pérdidas
  async getBalanceGeneral(query: BalanceQuery): Promise<BalanceGeneral[]> {
    const [compras, ventas] = await Promise.all([
      this.getBalanceCompraPorBoca(query),
      this.getBalanceVentaPorBoca(query),
    ]);

    const balancesMap = new Map<string, BalanceGeneral>();

    // Procesar compras
    for (const compra of compras) {
      const key = `${compra.idBoca}_${compra.periodoMes}`;
      balancesMap.set(key, {
        idBoca: compra.idBoca,
        periodoMes: compra.periodoMes,
        kwhCompradosMes: compra.kwhCompradosMes,
        kwhVendidosMes: 0,
        importeCompradoMes: compra.importeCompradoMes,
        importeVendidoMes: 0,
        perdidaKwh: compra.kwhCompradosMes,
        perdidaPorcentaje: 100,
        nivelPerdida: 'critica',
        descripcionPerdida: 'Sin ventas registradas',
      });
    }

    // Procesar ventas
    for (const venta of ventas) {
      const key = `${venta.idBoca}_${venta.periodoMes}`;
      const balance = balancesMap.get(key);

      if (balance) {
        balance.kwhVendidosMes = venta.kwhVendidosMes;
        balance.importeVendidoMes = venta.importeVendidoMes;
      } else {
        // Venta sin compra correspondiente
        balancesMap.set(key, {
          idBoca: venta.idBoca,
          periodoMes: venta.periodoMes,
          kwhCompradosMes: 0,
          kwhVendidosMes: venta.kwhVendidosMes,
          importeCompradoMes: 0,
          importeVendidoMes: venta.importeVendidoMes,
          perdidaKwh: -venta.kwhVendidosMes,
          perdidaPorcentaje: -100,
          nivelPerdida: 'normal',
          descripcionPerdida: 'Venta sin compra correspondiente',
        });
      }
    }

    // Calcular pérdidas
    const balances = Array.from(balancesMap.values());
    for (const balance of balances) {
      const perdidaKwh = balance.kwhCompradosMes - balance.kwhVendidosMes;
      const perdidaPorcentaje = calcularPerdidaPorcentaje(balance.kwhCompradosMes, balance.kwhVendidosMes);
      const evaluacion = evaluarPerdida(perdidaPorcentaje);

      balance.perdidaKwh = Number(perdidaKwh.toFixed(2));
      balance.perdidaPorcentaje = perdidaPorcentaje;
      balance.nivelPerdida = evaluacion.nivel;
      balance.descripcionPerdida = evaluacion.descripcion;
    }

    return balances.sort((a, b) => {
      if (a.idBoca === b.idBoca) {
        return a.periodoMes.localeCompare(b.periodoMes);
      }
      return a.idBoca.localeCompare(b.idBoca);
    });
  }

  // Análisis de pérdidas con datos adicionales
  async getAnalisisPerdida(query: BalanceQuery): Promise<AnalisisPerdida[]> {
    const balances = await this.getBalanceGeneral(query);
    const result: AnalisisPerdida[] = [];

    for (const balance of balances) {
      // Obtener datos adicionales de usuarios y demanda
      const statsUsuarios = await this.prisma.usuarios.aggregate({
        where: {
          id_boca: balance.idBoca,
          estado: 'ACTIVO',
        },
        _count: true,
      });

      const analisis: AnalisisPerdida = {
        ...balance,
        cantidadUsuarios: statsUsuarios._count,
        kwhPromedioUsuario: statsUsuarios._count > 0 
          ? Number((balance.kwhVendidosMes / statsUsuarios._count).toFixed(2)) 
          : 0,
        factorCarga: 0, // TODO: Calcular con datos de demanda
        demandaPromedio: 0, // TODO: Calcular con datos de demanda
      };

      result.push(analisis);
    }

    return result;
  }

  // Resumen por período
  async getResumenPeriodo(periodoMes: string): Promise<ResumenPeriodo> {
    const balances = await this.getBalanceGeneral({
      periodoInicio: periodoMes,
      periodoFin: periodoMes,
    });

    const resumen: ResumenPeriodo = {
      periodoMes,
      totalBocas: balances.length,
      totalKwhComprados: balances.reduce((sum, b) => sum + b.kwhCompradosMes, 0),
      totalKwhVendidos: balances.reduce((sum, b) => sum + b.kwhVendidosMes, 0),
      totalImporteComprado: balances.reduce((sum, b) => sum + b.importeCompradoMes, 0),
      totalImporteVendido: balances.reduce((sum, b) => sum + b.importeVendidoMes, 0),
      perdidaTotalKwh: balances.reduce((sum, b) => sum + b.perdidaKwh, 0),
      perdidaTotalPorcentaje: 0,
      bocasConPerdidaNormal: balances.filter(b => b.nivelPerdida === 'normal').length,
      bocasConPerdidaModerada: balances.filter(b => b.nivelPerdida === 'moderada').length,
      bocasConPerdidaAlta: balances.filter(b => b.nivelPerdida === 'alta').length,
      bocasConPerdidaCritica: balances.filter(b => b.nivelPerdida === 'critica').length,
    };

    resumen.perdidaTotalPorcentaje = calcularPerdidaPorcentaje(
      resumen.totalKwhComprados,
      resumen.totalKwhVendidos
    );

    return resumen;
  }

  // Top de pérdidas
  async getTopPerdidas(periodoMes: string, limite = 10): Promise<TopPerdida[]> {
    const balances = await this.getBalanceGeneral({
      periodoInicio: periodoMes,
      periodoFin: periodoMes,
    });

    // Obtener nombres de bocas
    const bocasInfo = await this.prisma.cat_bocas_compra.findMany({
      where: {
        id_boca: {
          in: balances.map(b => b.idBoca),
        },
      },
      select: {
        id_boca: true,
        nombre_boca: true,
      },
    });

    const bocasMap = new Map(bocasInfo.map(b => [b.id_boca, b.nombre_boca]));

    return balances
      .sort((a, b) => b.perdidaPorcentaje - a.perdidaPorcentaje)
      .slice(0, limite)
      .map((balance, index) => ({
        ranking: index + 1,
        idBoca: balance.idBoca,
        nombreBoca: bocasMap.get(balance.idBoca),
        periodoMes: balance.periodoMes,
        kwhCompradosMes: balance.kwhCompradosMes,
        kwhVendidosMes: balance.kwhVendidosMes,
        perdidaKwh: balance.perdidaKwh,
        perdidaPorcentaje: balance.perdidaPorcentaje,
        nivelPerdida: balance.nivelPerdida,
      }));
  }

  // Generación de alertas automáticas
  async generarAlertas(periodoMes: string): Promise<AlertaPerdida[]> {
    const alertas: AlertaPerdida[] = [];
    const balances = await this.getBalanceGeneral({
      periodoInicio: periodoMes,
      periodoFin: periodoMes,
    });

    for (const balance of balances) {
      // Alerta por pérdida crítica
      if (balance.nivelPerdida === 'critica') {
        alertas.push({
          id: `alerta_${balance.idBoca}_${periodoMes}_critica`,
          idBoca: balance.idBoca,
          periodoMes: balance.periodoMes,
          tipoAlerta: 'perdida_critica',
          mensaje: `Pérdida crítica detectada: ${balance.perdidaPorcentaje}%`,
          perdidaActual: balance.perdidaPorcentaje,
          prioridad: 'critica',
          fechaCreacion: new Date(),
          estado: 'pendiente',
        });
      }

      // Alerta por pérdida alta
      if (balance.nivelPerdida === 'alta') {
        alertas.push({
          id: `alerta_${balance.idBoca}_${periodoMes}_alta`,
          idBoca: balance.idBoca,
          periodoMes: balance.periodoMes,
          tipoAlerta: 'perdida_alta',
          mensaje: `Pérdida alta detectada: ${balance.perdidaPorcentaje}%`,
          perdidaActual: balance.perdidaPorcentaje,
          prioridad: 'alta',
          fechaCreacion: new Date(),
          estado: 'pendiente',
        });
      }

      // Alerta por pérdida negativa (más venta que compra)
      if (balance.perdidaPorcentaje < -5) {
        alertas.push({
          id: `alerta_${balance.idBoca}_${periodoMes}_negativa`,
          idBoca: balance.idBoca,
          periodoMes: balance.periodoMes,
          tipoAlerta: 'perdida_negativa',
          mensaje: `Posible error de medición: venta supera compra en ${Math.abs(balance.perdidaPorcentaje)}%`,
          perdidaActual: balance.perdidaPorcentaje,
          prioridad: 'media',
          fechaCreacion: new Date(),
          estado: 'pendiente',
        });
      }
    }

    return alertas;
  }
}