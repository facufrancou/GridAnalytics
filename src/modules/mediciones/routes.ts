import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { MedicionesController } from './controller.js';

const medicionesController = new MedicionesController();

export default async function medicionesRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
): Promise<void> {

  // ============ MEDICIONES DE COMPRA ============
  
  fastify.get('/compra', {
    schema: {
      tags: ['Mediciones'],
      summary: 'Listar mediciones de compra',
      description: 'Obtener lista paginada de mediciones de compra',
      querystring: {
        type: 'object',
        properties: {
          idBoca: { type: 'string', description: 'Filtrar por ID de boca' },
          periodoMes: { type: 'string', pattern: '^\\d{4}-\\d{2}$', description: 'Filtrar por período (YYYY-MM)' },
          limit: { type: 'string', default: '100' },
          offset: { type: 'string', default: '0' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
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
  }, medicionesController.getMedicionesCompra.bind(medicionesController));

  fastify.get('/compra/:id', {
    schema: {
      tags: ['Mediciones'],
      summary: 'Obtener medición de compra por ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'ID de la medición' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
      },
    },
  }, medicionesController.getMedicionCompraById.bind(medicionesController));

  fastify.get('/compra/boca/:idBoca', {
    schema: {
      tags: ['Mediciones'],
      summary: 'Obtener mediciones de compra por boca',
      params: {
        type: 'object',
        required: ['idBoca'],
        properties: {
          idBoca: { type: 'string', description: 'ID de la boca de compra' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          periodoInicio: { type: 'string', pattern: '^\\d{4}-\\d{2}$', description: 'Período desde (YYYY-MM)' },
          periodoFin: { type: 'string', pattern: '^\\d{4}-\\d{2}$', description: 'Período hasta (YYYY-MM)' },
          limit: { type: 'string', default: '100' },
          offset: { type: 'string', default: '0' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
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
  }, medicionesController.getMedicionesCompraPorBoca.bind(medicionesController));

  // ============ MEDICIONES DE VENTA ============
  
  fastify.get('/venta', {
    schema: {
      tags: ['Mediciones'],
      summary: 'Listar mediciones de venta',
      description: 'Obtener lista paginada de mediciones de venta',
      querystring: {
        type: 'object',
        properties: {
          idUsuario: { type: 'string', description: 'Filtrar por ID de usuario' },
          periodoBimestre: { type: 'string', pattern: '^\\d{4}-\\d{2}_\\d{4}-\\d{2}$', description: 'Filtrar por período bimestral' },
          limit: { type: 'string', default: '100' },
          offset: { type: 'string', default: '0' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
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
  }, medicionesController.getMedicionesVenta.bind(medicionesController));

  fastify.get('/venta/:id', {
    schema: {
      tags: ['Mediciones'],
      summary: 'Obtener medición de venta por ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'ID de la medición' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
      },
    },
  }, medicionesController.getMedicionVentaById.bind(medicionesController));

  fastify.get('/venta/usuario/:idUsuario', {
    schema: {
      tags: ['Mediciones'],
      summary: 'Obtener mediciones de venta por usuario',
      params: {
        type: 'object',
        required: ['idUsuario'],
        properties: {
          idUsuario: { type: 'string', description: 'ID del usuario' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          periodoInicio: { type: 'string', description: 'Período desde' },
          periodoFin: { type: 'string', description: 'Período hasta' },
          limit: { type: 'string', default: '100' },
          offset: { type: 'string', default: '0' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
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
  }, medicionesController.getMedicionesVentaPorUsuario.bind(medicionesController));

  fastify.get('/venta/suministro/:nroSuministro', {
    schema: {
      tags: ['Mediciones'],
      summary: 'Obtener mediciones de venta por número de suministro',
      params: {
        type: 'object',
        required: ['nroSuministro'],
        properties: {
          nroSuministro: { type: 'string', description: 'Número de suministro' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          periodoInicio: { type: 'string', description: 'Período desde' },
          periodoFin: { type: 'string', description: 'Período hasta' },
          limit: { type: 'string', default: '100' },
          offset: { type: 'string', default: '0' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
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
  }, medicionesController.getMedicionesVentaPorSuministro.bind(medicionesController));
}
