import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { AdminController } from './controller.js';

const adminController = new AdminController();

export default async function adminRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
): Promise<void> {

  // ============ API KEYS ============
  
  fastify.get('/api-keys', {
    schema: {
      tags: ['Admin'],
      summary: 'Listar API Keys',
      querystring: {
        type: 'object',
        properties: {
          activo: { type: 'string', enum: ['true', 'false'] },
          limit: { type: 'string', default: '100' },
          offset: { type: 'string', default: '0' },
        },
      },
    },
  }, adminController.getApiKeys.bind(adminController));

  fastify.get('/api-keys/:id', {
    schema: {
      tags: ['Admin'],
      summary: 'Obtener API Key por ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, adminController.getApiKeyById.bind(adminController));

  // ============ ETL FACTURAS RAW ============
  
  fastify.get('/etl-raw', {
    schema: {
      tags: ['Admin'],
      summary: 'Listar registros ETL raw',
      querystring: {
        type: 'object',
        properties: {
          fuente: { type: 'string' },
          hashDoc: { type: 'string' },
          limit: { type: 'string', default: '100' },
          offset: { type: 'string', default: '0' },
        },
      },
    },
  }, adminController.getEtlFacturasRaw.bind(adminController));

  fastify.get('/etl-raw/:id', {
    schema: {
      tags: ['Admin'],
      summary: 'Obtener registro ETL raw por ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, adminController.getEtlFacturaRawById.bind(adminController));

  // ============ ETL MATCH FACTURAS ============
  
  fastify.get('/etl-matches', {
    schema: {
      tags: ['Admin'],
      summary: 'Listar matches ETL',
      querystring: {
        type: 'object',
        properties: {
          entidadDestino: { type: 'string' },
          procesado: { type: 'string', enum: ['true', 'false'] },
          limit: { type: 'string', default: '100' },
          offset: { type: 'string', default: '0' },
        },
      },
    },
  }, adminController.getEtlMatchFacturas.bind(adminController));

  fastify.get('/etl-matches/:id', {
    schema: {
      tags: ['Admin'],
      summary: 'Obtener match ETL por ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, adminController.getEtlMatchFacturaById.bind(adminController));
}
