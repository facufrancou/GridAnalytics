import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AnalyticsService } from './service.js';
import {
  mensualizeVentaRequestSchema,
  balanceQuerySchema,
  type MensualizeVentaRequest,
  type BalanceQuery,
} from './schemas.js';

interface IAnalyticsController {
  mensualizeVentaBimestral: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  getBalanceGeneral: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  getBalanceCompraPorBoca: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  getBalanceVentaPorBoca: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  getAnalisisPerdida: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  getResumenPeriodo: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  getTopPerdidas: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  generarAlertas: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  getBocaHierarchy: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  getAllBocasHierarchySummary: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
}

export class AnalyticsController implements IAnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  // POST /analytics/mensualize-venta
  async mensualizeVentaBimestral(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const data = mensualizeVentaRequestSchema.parse(request.body);
      const result = await this.analyticsService.mensualizeVentaBimestral(data);

      await reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error: any) {
      await reply.code(400).send({
        success: false,
        error: error.message || 'Error en mensualización de venta bimestral',
      });
    }
  }

  // GET /analytics/balance/general
  async getBalanceGeneral(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const query = balanceQuerySchema.parse(request.query);
      const balances = await this.analyticsService.getBalanceGeneral({
        ...query,
        incluirDetalle: query.incluirDetalle ?? false,
      });

      await reply.code(200).send({
        success: true,
        data: balances,
        meta: {
          total: balances.length,
          periodoInicio: query.periodoInicio,
          periodoFin: query.periodoFin,
          filteredBy: query.idBoca ? `Boca ${query.idBoca}` : 'Todas las bocas',
        },
      });
    } catch (error: any) {
      await reply.code(400).send({
        success: false,
        error: error.message || 'Error obteniendo balance general',
      });
    }
  }

  // GET /analytics/balance/compra
  async getBalanceCompraPorBoca(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const query = balanceQuerySchema.parse(request.query);
      const compras = await this.analyticsService.getBalanceCompraPorBoca({
        ...query,
        incluirDetalle: query.incluirDetalle ?? false,
      });

      await reply.code(200).send({
        success: true,
        data: compras,
        meta: {
          total: compras.length,
          periodoInicio: query.periodoInicio,
          periodoFin: query.periodoFin,
          totalKwhComprados: compras.reduce((sum, c) => sum + c.kwhCompradosMes, 0),
          totalImporteComprado: compras.reduce((sum, c) => sum + c.importeCompradoMes, 0),
        },
      });
    } catch (error: any) {
      await reply.code(400).send({
        success: false,
        error: error.message || 'Error obteniendo balance de compras',
      });
    }
  }

  // GET /analytics/balance/venta
  async getBalanceVentaPorBoca(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const query = balanceQuerySchema.parse(request.query);
      const ventas = await this.analyticsService.getBalanceVentaPorBoca({
        ...query,
        incluirDetalle: query.incluirDetalle ?? false,
      });

      await reply.code(200).send({
        success: true,
        data: ventas,
        meta: {
          total: ventas.length,
          periodoInicio: query.periodoInicio,
          periodoFin: query.periodoFin,
          totalKwhVendidos: ventas.reduce((sum, v) => sum + v.kwhVendidosMes, 0),
          totalImporteVendido: ventas.reduce((sum, v) => sum + v.importeVendidoMes, 0),
        },
      });
    } catch (error: any) {
      await reply.code(400).send({
        success: false,
        error: error.message || 'Error obteniendo balance de ventas',
      });
    }
  }

  // GET /analytics/analisis-perdida
  async getAnalisisPerdida(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const query = balanceQuerySchema.parse(request.query);
      const analisis = await this.analyticsService.getAnalisisPerdida({
        ...query,
        incluirDetalle: query.incluirDetalle ?? false,
      });

      // Calcular estadísticas
      const estadisticas = {
        totalBocas: analisis.length,
        perdidaPromedio: analisis.length > 0 
          ? Number((analisis.reduce((sum, a) => sum + a.perdidaPorcentaje, 0) / analisis.length).toFixed(2))
          : 0,
        distribucionNiveles: {
          normal: analisis.filter(a => a.nivelPerdida === 'normal').length,
          moderada: analisis.filter(a => a.nivelPerdida === 'moderada').length,
          alta: analisis.filter(a => a.nivelPerdida === 'alta').length,
          critica: analisis.filter(a => a.nivelPerdida === 'critica').length,
        },
        mayorPerdida: analisis.length > 0 
          ? Math.max(...analisis.map(a => a.perdidaPorcentaje))
          : 0,
        menorPerdida: analisis.length > 0 
          ? Math.min(...analisis.map(a => a.perdidaPorcentaje))
          : 0,
      };

      await reply.code(200).send({
        success: true,
        data: analisis,
        estadisticas,
        meta: {
          periodoInicio: query.periodoInicio,
          periodoFin: query.periodoFin,
        },
      });
    } catch (error: any) {
      await reply.code(400).send({
        success: false,
        error: error.message || 'Error en análisis de pérdidas',
      });
    }
  }

  // GET /analytics/resumen/:periodo
  async getResumenPeriodo(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const params = request.params as { periodo: string };
      
      // Validar formato de período
      const periodoRegex = /^\d{4}-\d{2}$/;
      if (!periodoRegex.test(params.periodo)) {
        await reply.code(400).send({
          success: false,
          error: 'Formato de período inválido. Use YYYY-MM',
        });
        return;
      }

      const resumen = await this.analyticsService.getResumenPeriodo(params.periodo);

      await reply.code(200).send({
        success: true,
        data: resumen,
      });
    } catch (error: any) {
      await reply.code(400).send({
        success: false,
        error: error.message || 'Error obteniendo resumen del período',
      });
    }
  }

  // GET /analytics/top-perdidas/:periodo
  async getTopPerdidas(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const params = request.params as { periodo: string };
      const query = request.query as { limite?: string };
      
      // Validar formato de período
      const periodoRegex = /^\d{4}-\d{2}$/;
      if (!periodoRegex.test(params.periodo)) {
        await reply.code(400).send({
          success: false,
          error: 'Formato de período inválido. Use YYYY-MM',
        });
        return;
      }

      const limite = query.limite ? parseInt(query.limite, 10) : 10;
      if (limite < 1 || limite > 100) {
        await reply.code(400).send({
          success: false,
          error: 'Límite debe estar entre 1 y 100',
        });
        return;
      }

      const topPerdidas = await this.analyticsService.getTopPerdidas(params.periodo, limite);

      await reply.code(200).send({
        success: true,
        data: topPerdidas,
        meta: {
          periodo: params.periodo,
          limite,
          total: topPerdidas.length,
        },
      });
    } catch (error: any) {
      await reply.code(400).send({
        success: false,
        error: error.message || 'Error obteniendo top de pérdidas',
      });
    }
  }

  // POST /analytics/alertas/:periodo
  async generarAlertas(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const params = request.params as { periodo: string };
      
      // Validar formato de período
      const periodoRegex = /^\d{4}-\d{2}$/;
      if (!periodoRegex.test(params.periodo)) {
        await reply.code(400).send({
          success: false,
          error: 'Formato de período inválido. Use YYYY-MM',
        });
        return;
      }

      const alertas = await this.analyticsService.generarAlertas(params.periodo);

      // Estadísticas de alertas
      const estadisticas = {
        totalAlertas: alertas.length,
        distribucionTipos: {
          perdida_alta: alertas.filter(a => a.tipoAlerta === 'perdida_alta').length,
          perdida_critica: alertas.filter(a => a.tipoAlerta === 'perdida_critica').length,
          perdida_negativa: alertas.filter(a => a.tipoAlerta === 'perdida_negativa').length,
          aumento_subito: alertas.filter(a => a.tipoAlerta === 'aumento_subito').length,
        },
        distribucionPrioridades: {
          critica: alertas.filter(a => a.prioridad === 'critica').length,
          alta: alertas.filter(a => a.prioridad === 'alta').length,
          media: alertas.filter(a => a.prioridad === 'media').length,
          baja: alertas.filter(a => a.prioridad === 'baja').length,
        },
      };

      await reply.code(200).send({
        success: true,
        data: alertas,
        estadisticas,
        meta: {
          periodo: params.periodo,
          generadoEn: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      await reply.code(400).send({
        success: false,
        error: error.message || 'Error generando alertas',
      });
    }
  }

  // GET /analytics/jerarquia/boca/:idBoca
  async getBocaHierarchy(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const params = request.params as { idBoca: string };
      const idBoca = parseInt(params.idBoca, 10);

      if (isNaN(idBoca)) {
        await reply.code(400).send({
          success: false,
          error: 'ID de boca inválido',
        });
        return;
      }

      const hierarchy = await this.analyticsService.getBocaHierarchy(idBoca);

      await reply.code(200).send({
        success: true,
        data: hierarchy,
      });
    } catch (error: any) {
      await reply.code(400).send({
        success: false,
        error: error.message || 'Error obteniendo jerarquía de boca',
      });
    }
  }

  // GET /analytics/jerarquia/bocas
  async getAllBocasHierarchySummary(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const summary = await this.analyticsService.getAllBocasHierarchySummary();

      await reply.code(200).send({
        success: true,
        data: summary,
        meta: {
          total: summary.length,
          totalDistribuidores: summary.reduce((sum, b) => sum + b.totalDistribuidores, 0),
          totalClientes: summary.reduce((sum, b) => sum + b.totalClientes, 0),
        },
      });
    } catch (error: any) {
      await reply.code(400).send({
        success: false,
        error: error.message || 'Error obteniendo resumen de bocas',
      });
    }
  }
}

export function createAnalyticsController(analyticsService: AnalyticsService): AnalyticsController {
  return new AnalyticsController(analyticsService);
}