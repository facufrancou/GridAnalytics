import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { VistasController } from './controller.js';

const vistasController = new VistasController();

export default async function vistasRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
): Promise<void> {

  // ============ VENTA MENSUALIZADA ============
  
  fastify.get('/venta-mensualizada', {
    schema: {
      tags: ['Vistas'],
      summary: 'Listar ventas mensualizadas',
      querystring: {
        type: 'object',
        properties: {
          idUsuario: { type: 'string' },
          idSegmento: { type: 'string' },
          idLinea: { type: 'string' },
          periodoMes: { type: 'string', pattern: '^\\d{4}-\\d{2}$' },
          limit: { type: 'string', default: '100' },
          offset: { type: 'string', default: '0' },
        },
      },
    },
  }, vistasController.getVentaMensualizada.bind(vistasController));

  fastify.get('/venta-mensualizada/:id', {
    schema: {
      tags: ['Vistas'],
      summary: 'Obtener venta mensualizada por ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, vistasController.getVentaMensualizadaById.bind(vistasController));

  // ============ BALANCE BOCA MES ============
  
  fastify.get('/balance-boca-mes', {
    schema: {
      tags: ['Vistas'],
      summary: 'Listar balances por boca y mes',
      querystring: {
        type: 'object',
        properties: {
          idBoca: { type: 'string' },
          periodoMes: { type: 'string', pattern: '^\\d{4}-\\d{2}$' },
          limit: { type: 'string', default: '100' },
          offset: { type: 'string', default: '0' },
        },
      },
    },
  }, vistasController.getBalanceBocaMes.bind(vistasController));

  fastify.get('/balance-boca-mes/:id', {
    schema: {
      tags: ['Vistas'],
      summary: 'Obtener balance por ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, vistasController.getBalanceBocaMesById.bind(vistasController));

  // ============ VENTA POR SEGMENTO MES ============
  
  fastify.get('/venta-segmento-mes', {
    schema: {
      tags: ['Vistas'],
      summary: 'Listar ventas por segmento y mes',
      querystring: {
        type: 'object',
        properties: {
          idSegmento: { type: 'string' },
          periodoMes: { type: 'string', pattern: '^\\d{4}-\\d{2}$' },
          limit: { type: 'string', default: '100' },
          offset: { type: 'string', default: '0' },
        },
      },
    },
  }, vistasController.getVentaPorSegmentoMes.bind(vistasController));

  fastify.get('/venta-segmento-mes/:id', {
    schema: {
      tags: ['Vistas'],
      summary: 'Obtener venta por segmento por ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, vistasController.getVentaPorSegmentoMesById.bind(vistasController));

  // ============ VENTA POR LINEA MES ============
  
  fastify.get('/venta-linea-mes', {
    schema: {
      tags: ['Vistas'],
      summary: 'Listar ventas por línea y mes',
      querystring: {
        type: 'object',
        properties: {
          idLinea: { type: 'string' },
          periodoMes: { type: 'string', pattern: '^\\d{4}-\\d{2}$' },
          limit: { type: 'string', default: '100' },
          offset: { type: 'string', default: '0' },
        },
      },
    },
  }, vistasController.getVentaPorLineaMes.bind(vistasController));

  fastify.get('/venta-linea-mes/:id', {
    schema: {
      tags: ['Vistas'],
      summary: 'Obtener venta por línea por ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, vistasController.getVentaPorLineaMesById.bind(vistasController));
}
