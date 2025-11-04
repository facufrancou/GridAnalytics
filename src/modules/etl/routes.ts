import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { EtlController } from './controller.js';
import { authMiddleware, requirePermissions } from '../../middlewares/auth.js';

const etlController = new EtlController();

export default async function etlRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
): Promise<void> {

  // Aplicar autenticación a todas las rutas ETL
  fastify.addHook('preHandler', authMiddleware);

  // ============ ETL COMPRA (PDF procesado por n8n) ============
  
  fastify.post('/compra/pdf', {
    preHandler: [requirePermissions({ 
      roles: ['admin', 'operador'], 
      scopes: ['etl:compra'] 
    })],
    schema: {
      tags: ['ETL'],
      summary: 'Procesar compra desde PDF (n8n)',
      description: 'Procesar datos de compra extraídos de PDF por n8n',
      security: [{ bearerAuth: [] }, { apiKey: [] }],
      body: {
        type: 'object',
        required: ['idBoca', 'periodoMes', 'kwhComprados', 'importe', 'archivo', 'hashDoc'],
        properties: {
          idBoca: { type: 'number', minimum: 1, description: 'ID de la boca de compra' },
          periodoMes: { type: 'string', pattern: '^\\d{4}-\\d{2}$', description: 'Período en formato YYYY-MM' },
          kwhComprados: { type: 'number', minimum: 0, description: 'kWh comprados' },
          importe: { type: 'number', minimum: 0, description: 'Importe de la factura' },
          fpPromedio: { type: 'number', minimum: 0, maximum: 1, description: 'Factor de potencia promedio' },
          demandaMaxKw: { type: 'number', minimum: 0, description: 'Demanda máxima en kW' },
          fechaFactura: { type: 'string', format: 'date-time', description: 'Fecha de la factura' },
          observaciones: { type: 'string', maxLength: 1000, description: 'Observaciones adicionales' },
          archivo: { type: 'string', description: 'Nombre del archivo procesado' },
          hashDoc: { type: 'string', description: 'Hash del documento para idempotencia' },
          metadatos: { type: 'object', description: 'Metadatos adicionales del procesamiento' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            processed: { type: 'number' },
            skipped: { type: 'number' },
            errors: { type: 'array', items: { type: 'string' } },
            warnings: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  }, etlController.processCompraFromPdf.bind(etlController));

  // ============ ETL VENTA (CSV) ============
  
  fastify.post('/venta/csv', {
    preHandler: [requirePermissions({ 
      roles: ['admin', 'operador'], 
      scopes: ['etl:venta'] 
    })],
    schema: {
      tags: ['ETL'],
      summary: 'Procesar ventas desde CSV',
      description: 'Procesar datos de venta desde archivo CSV o datos JSON',
      security: [{ bearerAuth: [] }, { apiKey: [] }],
      consumes: ['multipart/form-data', 'application/json'],
      body: {
        anyOf: [
          {
            // Para datos JSON (desde n8n)
            type: 'object',
            required: ['archivo', 'registros', 'hashDoc'],
            properties: {
              archivo: { type: 'string' },
              hashDoc: { type: 'string' },
              registros: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['nroSuministro', 'periodoBimestre', 'kwhVendidosBim', 'importe', 'lectIni', 'lectFin'],
                  properties: {
                    nroSuministro: { type: 'string', minLength: 3, maxLength: 20 },
                    periodoBimestre: { type: 'string', pattern: '^\\d{4}-\\d{2}_\\d{4}-\\d{2}$' },
                    kwhVendidosBim: { type: 'number', minimum: 0 },
                    importe: { type: 'number', minimum: 0 },
                    lectIni: { type: 'number', minimum: 0 },
                    lectFin: { type: 'number', minimum: 0 },
                    fechaFactura: { type: 'string', format: 'date-time' },
                    observaciones: { type: 'string', maxLength: 1000 },
                  },
                },
              },
            },
          },
          {
            // Para archivos multipart
            type: 'string',
            description: 'Archivo CSV',
          },
        ],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            processed: { type: 'number' },
            skipped: { type: 'number' },
            errors: { type: 'array', items: { type: 'string' } },
            warnings: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  }, etlController.processVentaFromCsv.bind(etlController));

  // ============ ETL USUARIOS (CSV) ============
  
  fastify.post('/usuarios/csv', {
    preHandler: [requirePermissions({ 
      roles: ['admin', 'operador'], 
      scopes: ['etl:usuarios'] 
    })],
    schema: {
      tags: ['ETL'],
      summary: 'Procesar usuarios desde CSV',
      description: 'Alta/actualización masiva de usuarios desde CSV',
      security: [{ bearerAuth: [] }, { apiKey: [] }],
      consumes: ['multipart/form-data', 'application/json'],
      body: {
        anyOf: [
          {
            type: 'object',
            required: ['archivo', 'registros', 'hashDoc'],
            properties: {
              archivo: { type: 'string' },
              hashDoc: { type: 'string' },
              registros: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['nroSuministro', 'nombre', 'segmentoCodigo'],
                  properties: {
                    nroSuministro: { type: 'string', minLength: 3, maxLength: 20 },
                    nombre: { type: 'string', minLength: 3, maxLength: 200 },
                    direccion: { type: 'string', maxLength: 300 },
                    segmentoCodigo: { type: 'string', minLength: 2, maxLength: 10 },
                    lineaNombre: { type: 'string', minLength: 3, maxLength: 100 },
                    activo: { type: 'boolean', default: true },
                  },
                },
              },
            },
          },
          {
            type: 'string',
            description: 'Archivo CSV',
          },
        ],
      },
    },
  }, etlController.processUsuariosFromCsv.bind(etlController));

  // ============ ETL LÍNEAS Y POSTES (CSV) ============
  
  fastify.post('/lineas-postes/csv', {
    preHandler: [requirePermissions({ 
      roles: ['admin', 'operador'], 
      scopes: ['etl:lineas'] 
    })],
    schema: {
      tags: ['ETL'],
      summary: 'Procesar líneas y postes desde CSV',
      description: 'Alta/actualización de líneas eléctricas y relevamiento de postes',
      security: [{ bearerAuth: [] }, { apiKey: [] }],
      consumes: ['multipart/form-data', 'application/json'],
      body: {
        anyOf: [
          {
            type: 'object',
            required: ['archivo', 'hashDoc'],
            properties: {
              archivo: { type: 'string' },
              hashDoc: { type: 'string' },
              lineas: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['nombre', 'tension'],
                  properties: {
                    nombre: { type: 'string', minLength: 3, maxLength: 100 },
                    tension: { type: 'string', minLength: 2, maxLength: 20 },
                    zona: { type: 'string', minLength: 2, maxLength: 50 },
                    activo: { type: 'boolean', default: true },
                  },
                },
              },
              postes: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['lineaNombre', 'tipoPosteNombre', 'estado', 'fechaRelevamiento'],
                  properties: {
                    lineaNombre: { type: 'string', minLength: 3, maxLength: 100 },
                    tipoPosteNombre: { type: 'string', minLength: 3, maxLength: 50 },
                    lat: { type: 'number', minimum: -90, maximum: 90 },
                    lng: { type: 'number', minimum: -180, maximum: 180 },
                    estado: { type: 'string', enum: ['bueno', 'regular', 'malo', 'peligroso'] },
                    observaciones: { type: 'string', maxLength: 1000 },
                    fechaRelevamiento: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          {
            type: 'string',
            description: 'Archivo CSV',
          },
        ],
      },
    },
  }, etlController.processLineasPostesFromCsv.bind(etlController));

  // ============ CONSULTAS Y LOGS ETL ============
  
  fastify.get('/logs', {
    preHandler: [requirePermissions({ 
      roles: ['admin', 'operador', 'bi'], 
      scopes: ['catalogos:read'] 
    })],
    schema: {
      tags: ['ETL'],
      summary: 'Obtener logs de ETL',
      description: 'Consultar historial de procesamiento ETL',
      security: [{ bearerAuth: [] }, { apiKey: [] }],
      querystring: {
        type: 'object',
        properties: {
          fuente: { 
            type: 'string', 
            enum: ['pdf_compra', 'csv_venta', 'csv_usuarios', 'csv_lineas_postes'],
            description: 'Filtrar por fuente de datos',
          },
          desde: { type: 'string', format: 'date-time', description: 'Fecha desde' },
          hasta: { type: 'string', format: 'date-time', description: 'Fecha hasta' },
          limit: { type: 'string', default: '50', description: 'Límite de resultados' },
          offset: { type: 'string', default: '0', description: 'Offset para paginación' },
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
                  id: { type: 'number' },
                  fuente: { type: 'string' },
                  archivo: { type: 'string' },
                  campo: { type: 'string' },
                  valor: { type: 'string' },
                  hashDoc: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                  matches: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        campoNormalizado: { type: 'string' },
                        valorNormalizado: { type: 'string' },
                        entidadDestino: { type: 'string' },
                        procesado: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                limit: { type: 'number' },
                offset: { type: 'number' },
                hasMore: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  }, etlController.getEtlLogs.bind(etlController));

  fastify.get('/stats', {
    preHandler: [requirePermissions({ 
      roles: ['admin', 'operador', 'bi'], 
      scopes: ['catalogos:read'] 
    })],
    schema: {
      tags: ['ETL'],
      summary: 'Obtener estadísticas de ETL',
      description: 'Estadísticas generales de procesamiento ETL',
      security: [{ bearerAuth: [] }, { apiKey: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                totalProcesados: { type: 'number' },
                porFuente: {
                  type: 'object',
                  properties: {
                    pdf_compra: { type: 'number' },
                    csv_venta: { type: 'number' },
                    csv_usuarios: { type: 'number' },
                    csv_lineas_postes: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, etlController.getEtlStats.bind(etlController));

  // ============ UTILIDADES ============
  
  fastify.post('/validate-csv', {
    preHandler: [requirePermissions({ 
      roles: ['admin', 'operador'], 
      scopes: ['etl:compra', 'etl:venta', 'etl:usuarios'] 
    })],
    schema: {
      tags: ['ETL'],
      summary: 'Validar formato CSV',
      description: 'Validar estructura y formato de archivo CSV antes del procesamiento',
      security: [{ bearerAuth: [] }, { apiKey: [] }],
      consumes: ['multipart/form-data'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                fileName: { type: 'string' },
                recordCount: { type: 'number' },
                columns: { type: 'array', items: { type: 'string' } },
                sample: { type: 'array', items: { type: 'object' } },
              },
            },
          },
        },
      },
    },
  }, etlController.validateCsv.bind(etlController));

  fastify.get('/status/:hashDoc', {
    preHandler: [requirePermissions({ 
      roles: ['admin', 'operador'], 
      scopes: ['etl:compra', 'etl:venta', 'etl:usuarios'] 
    })],
    schema: {
      tags: ['ETL'],
      summary: 'Verificar estado de procesamiento',
      description: 'Verificar si un documento ya fue procesado (para n8n)',
      security: [{ bearerAuth: [] }, { apiKey: [] }],
      params: {
        type: 'object',
        required: ['hashDoc'],
        properties: {
          hashDoc: { type: 'string', description: 'Hash del documento a verificar' },
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
                processed: { type: 'boolean' },
                processedAt: { type: 'string', format: 'date-time' },
                fuente: { type: 'string' },
                archivo: { type: 'string' },
              },
            },
          },
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, etlController.getProcessingStatus.bind(etlController));
}