import type { FastifyInstance } from 'fastify';
import type { AnalyticsController } from './controller.js';

export async function analyticsRoutes(fastify: FastifyInstance, controller: AnalyticsController) {
  // Mensualización de venta bimestral
  await fastify.post('/mensualize-venta', {
    schema: {
      summary: 'Mensualizar venta bimestral',
      description: 'Convierte una venta bimestral a dos registros mensuales ponderados por días',
      tags: ['Analytics'],
      body: {
        type: 'object',
        required: ['periodoBimestre', 'kwhVendidosBim'],
        properties: {
          periodoBimestre: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}_\\d{4}-\\d{2}$',
            description: 'Período bimestral en formato YYYY-MM_YYYY-MM',
          },
          kwhVendidosBim: {
            type: 'number',
            minimum: 0,
            description: 'kWh vendidos en el bimestre',
          },
          importeBim: {
            type: 'number',
            minimum: 0,
            description: 'Importe total del bimestre (opcional)',
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  periodoMes: { type: 'string' },
                  kwhVendidosMes: { type: 'number' },
                  importeMes: { type: 'number' },
                  diasMes: { type: 'number' },
                  pctDistribucion: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    handler: controller.mensualizeVentaBimestral.bind(controller),
  });

  // Balance general (compra vs venta con cálculo de pérdidas)
  await fastify.get('/balance/general', {
    schema: {
      summary: 'Balance general compra vs venta',
      description: 'Obtiene el balance completo entre compras y ventas con cálculo automático de pérdidas',
      tags: ['Analytics'],
      
      querystring: {
        type: 'object',
        required: ['periodoInicio', 'periodoFin'],
        properties: {
          idBoca: {
            type: 'string',
            description: 'Filtrar por boca específica (opcional)',
          },
          periodoInicio: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}$',
            description: 'Período inicial en formato YYYY-MM',
          },
          periodoFin: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}$',
            description: 'Período final en formato YYYY-MM',
          },
          incluirDetalle: {
            type: 'boolean',
            default: false,
            description: 'Incluir detalles adicionales en la respuesta',
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  idBoca: { type: 'string' },
                  periodoMes: { type: 'string' },
                  kwhCompradosMes: { type: 'number' },
                  kwhVendidosMes: { type: 'number' },
                  importeCompradoMes: { type: 'number' },
                  importeVendidoMes: { type: 'number' },
                  perdidaKwh: { type: 'number' },
                  perdidaPorcentaje: { type: 'number' },
                  nivelPerdida: {
                    type: 'string',
                    enum: ['normal', 'moderada', 'alta', 'critica'],
                  },
                  descripcionPerdida: { type: 'string' },
                },
              },
            },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                periodoInicio: { type: 'string' },
                periodoFin: { type: 'string' },
                filteredBy: { type: 'string' },
              },
            },
          },
        },
      },
    },
    handler: controller.getBalanceGeneral.bind(controller),
  });

  // Balance de compras por boca
  await fastify.get('/balance/compra', {
    schema: {
      summary: 'Balance de compras por boca',
      description: 'Obtiene las compras agregadas por boca y período',
      tags: ['Analytics'],
      
      querystring: {
        type: 'object',
        required: ['periodoInicio', 'periodoFin'],
        properties: {
          idBoca: {
            type: 'string',
            description: 'Filtrar por boca específica (opcional)',
          },
          periodoInicio: { type: 'string', pattern: '^\\d{4}-\\d{2}$' },
          periodoFin: { type: 'string', pattern: '^\\d{4}-\\d{2}$' },
          incluirDetalle: { type: 'boolean', default: false },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  idBoca: { type: 'string' },
                  periodoMes: { type: 'string' },
                  kwhCompradosMes: { type: 'number' },
                  importeCompradoMes: { type: 'number' },
                },
              },
            },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                periodoInicio: { type: 'string' },
                periodoFin: { type: 'string' },
                totalKwhComprados: { type: 'number' },
                totalImporteComprado: { type: 'number' },
              },
            },
          },
        },
      },
    },
    handler: controller.getBalanceCompraPorBoca.bind(controller),
  });

  // Balance de ventas por boca (con mensualización automática)
  await fastify.get('/balance/venta', {
    schema: {
      summary: 'Balance de ventas por boca',
      description: 'Obtiene las ventas agregadas por boca y período, con mensualización automática de facturación bimestral',
      tags: ['Analytics'],
      
      querystring: {
        type: 'object',
        required: ['periodoInicio', 'periodoFin'],
        properties: {
          idBoca: {
            type: 'string',
            description: 'Filtrar por boca específica (opcional)',
          },
          periodoInicio: { type: 'string', pattern: '^\\d{4}-\\d{2}$' },
          periodoFin: { type: 'string', pattern: '^\\d{4}-\\d{2}$' },
          incluirDetalle: { type: 'boolean', default: false },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  idBoca: { type: 'string' },
                  periodoMes: { type: 'string' },
                  kwhVendidosMes: { type: 'number' },
                  importeVendidoMes: { type: 'number' },
                },
              },
            },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                periodoInicio: { type: 'string' },
                periodoFin: { type: 'string' },
                totalKwhVendidos: { type: 'number' },
                totalImporteVendido: { type: 'number' },
              },
            },
          },
        },
      },
    },
    handler: controller.getBalanceVentaPorBoca.bind(controller),
  });

  // Análisis detallado de pérdidas
  await fastify.get('/analisis-perdida', {
    schema: {
      summary: 'Análisis detallado de pérdidas',
      description: 'Análisis completo de pérdidas con datos adicionales de usuarios y demanda',
      tags: ['Analytics'],
      
      querystring: {
        type: 'object',
        required: ['periodoInicio', 'periodoFin'],
        properties: {
          idBoca: { type: 'string', description: 'Filtrar por boca específica (opcional)' },
          periodoInicio: { type: 'string', pattern: '^\\d{4}-\\d{2}$' },
          periodoFin: { type: 'string', pattern: '^\\d{4}-\\d{2}$' },
          incluirDetalle: { type: 'boolean', default: false },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  idBoca: { type: 'string' },
                  periodoMes: { type: 'string' },
                  kwhCompradosMes: { type: 'number' },
                  kwhVendidosMes: { type: 'number' },
                  perdidaKwh: { type: 'number' },
                  perdidaPorcentaje: { type: 'number' },
                  nivelPerdida: { type: 'string', enum: ['normal', 'moderada', 'alta', 'critica'] },
                  descripcionPerdida: { type: 'string' },
                  factorCarga: { type: 'number' },
                  demandaPromedio: { type: 'number' },
                  cantidadUsuarios: { type: 'number' },
                  kwhPromedioUsuario: { type: 'number' },
                },
              },
            },
            estadisticas: {
              type: 'object',
              properties: {
                totalBocas: { type: 'number' },
                perdidaPromedio: { type: 'number' },
                distribucionNiveles: {
                  type: 'object',
                  properties: {
                    normal: { type: 'number' },
                    moderada: { type: 'number' },
                    alta: { type: 'number' },
                    critica: { type: 'number' },
                  },
                },
                mayorPerdida: { type: 'number' },
                menorPerdida: { type: 'number' },
              },
            },
          },
        },
      },
    },
    handler: controller.getAnalisisPerdida.bind(controller),
  });

  // Resumen por período
  await fastify.get('/resumen/:periodo', {
    schema: {
      summary: 'Resumen consolidado por período',
      description: 'Resumen ejecutivo con totales y distribución de pérdidas por período',
      tags: ['Analytics'],
      
      params: {
        type: 'object',
        required: ['periodo'],
        properties: {
          periodo: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}$',
            description: 'Período en formato YYYY-MM',
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                periodoMes: { type: 'string' },
                totalBocas: { type: 'number' },
                totalKwhComprados: { type: 'number' },
                totalKwhVendidos: { type: 'number' },
                totalImporteComprado: { type: 'number' },
                totalImporteVendido: { type: 'number' },
                perdidaTotalKwh: { type: 'number' },
                perdidaTotalPorcentaje: { type: 'number' },
                bocasConPerdidaNormal: { type: 'number' },
                bocasConPerdidaModerada: { type: 'number' },
                bocasConPerdidaAlta: { type: 'number' },
                bocasConPerdidaCritica: { type: 'number' },
              },
            },
          },
        },
      },
    },
    handler: controller.getResumenPeriodo.bind(controller),
  });

  // Top de pérdidas
  await fastify.get('/top-perdidas/:periodo', {
    schema: {
      summary: 'Top de pérdidas por período',
      description: 'Ranking de bocas con mayores pérdidas porcentuales en un período',
      tags: ['Analytics'],
      
      params: {
        type: 'object',
        required: ['periodo'],
        properties: {
          periodo: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}$',
          },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          limite: {
            type: 'string',
            pattern: '^\\d+$',
            description: 'Número máximo de resultados (1-100)',
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  ranking: { type: 'number' },
                  idBoca: { type: 'string' },
                  nombreBoca: { type: 'string' },
                  periodoMes: { type: 'string' },
                  kwhCompradosMes: { type: 'number' },
                  kwhVendidosMes: { type: 'number' },
                  perdidaKwh: { type: 'number' },
                  perdidaPorcentaje: { type: 'number' },
                  nivelPerdida: { type: 'string' },
                },
              },
            },
            meta: {
              type: 'object',
              properties: {
                periodo: { type: 'string' },
                limite: { type: 'number' },
                total: { type: 'number' },
              },
            },
          },
        },
      },
    },
    handler: controller.getTopPerdidas.bind(controller),
  });

  // Generación de alertas
  await fastify.post('/alertas/:periodo', {
    schema: {
      summary: 'Generar alertas automáticas',
      description: 'Genera alertas automáticas basadas en umbrales de pérdidas y anomalías',
      tags: ['Analytics'],
      
      params: {
        type: 'object',
        required: ['periodo'],
        properties: {
          periodo: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}$',
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  idBoca: { type: 'string' },
                  nombreBoca: { type: 'string' },
                  periodoMes: { type: 'string' },
                  tipoAlerta: {
                    type: 'string',
                    enum: ['perdida_alta', 'perdida_critica', 'aumento_subito', 'perdida_negativa'],
                  },
                  mensaje: { type: 'string' },
                  perdidaActual: { type: 'number' },
                  perdidaAnterior: { type: 'number' },
                  umbralSuperado: { type: 'number' },
                  prioridad: {
                    type: 'string',
                    enum: ['baja', 'media', 'alta', 'critica'],
                  },
                  fechaCreacion: { type: 'string', format: 'date-time' },
                  estado: {
                    type: 'string',
                    enum: ['pendiente', 'revisando', 'resuelto', 'descartado'],
                  },
                },
              },
            },
            estadisticas: {
              type: 'object',
              properties: {
                totalAlertas: { type: 'number' },
                distribucionTipos: {
                  type: 'object',
                  properties: {
                    perdida_alta: { type: 'number' },
                    perdida_critica: { type: 'number' },
                    perdida_negativa: { type: 'number' },
                    aumento_subito: { type: 'number' },
                  },
                },
                distribucionPrioridades: {
                  type: 'object',
                  properties: {
                    critica: { type: 'number' },
                    alta: { type: 'number' },
                    media: { type: 'number' },
                    baja: { type: 'number' },
                  },
                },
              },
            },
            meta: {
              type: 'object',
              properties: {
                periodo: { type: 'string' },
                generadoEn: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    handler: controller.generarAlertas.bind(controller),
  });

  // Jerarquía de distribución: Boca → Distribuidores → Clientes
  await fastify.get('/jerarquia/boca/:idBoca', {
    schema: {
      summary: 'Jerarquía de distribución por boca',
      description: 'Obtiene la jerarquía completa: boca → distribuidores → clientes',
      tags: ['Analytics'],
      
      params: {
        type: 'object',
        required: ['idBoca'],
        properties: {
          idBoca: {
            type: 'string',
            description: 'ID de la boca de compra',
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                nombre: { type: 'string' },
                proveedor: { type: 'string' },
                activo: { type: 'boolean' },
                latitud: { type: 'string', nullable: true },
                longitud: { type: 'string', nullable: true },
                totalDistribuidores: { type: 'number' },
                totalClientes: { type: 'number' },
                distribuidores: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number' },
                      nombre: { type: 'string', nullable: true },
                      ubicacion: { type: 'string', nullable: true },
                      latitud: { type: 'string', nullable: true },
                      longitud: { type: 'string', nullable: true },
                      totalClientes: { type: 'number' },
                      clientes: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'number' },
                            nroSuministro: { type: 'string' },
                            nombre: { type: 'string' },
                            direccion: { type: 'string', nullable: true },
                            idSegmento: { type: 'number' },
                            segmentoNombre: { type: 'string' },
                            idLinea: { type: 'number', nullable: true },
                            lineaNombre: { type: 'string', nullable: true },
                            activo: { type: 'boolean' },
                            latitud: { type: 'string', nullable: true },
                            longitud: { type: 'string', nullable: true },
                            cod_postal: { type: 'number', nullable: true },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    handler: controller.getBocaHierarchy.bind(controller),
  });

  // Resumen de todas las bocas con estadísticas de jerarquía
  await fastify.get('/jerarquia/bocas', {
    schema: {
      summary: 'Resumen de jerarquía de todas las bocas',
      description: 'Lista todas las bocas con conteo de distribuidores y clientes',
      tags: ['Analytics'],
      
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  nombre: { type: 'string' },
                  proveedor: { type: 'string' },
                  activo: { type: 'boolean' },
                  totalDistribuidores: { type: 'number' },
                  totalClientes: { type: 'number' },
                },
              },
            },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                totalDistribuidores: { type: 'number' },
                totalClientes: { type: 'number' },
              },
            },
          },
        },
      },
    },
    handler: controller.getAllBocasHierarchySummary.bind(controller),
  });
}

export function registerAnalyticsModule(fastify: FastifyInstance, controller: AnalyticsController) {
  return fastify.register(
    async (fastifyInstance) => {
      await analyticsRoutes(fastifyInstance, controller);
    },
    { prefix: '/analytics' }
  );
}