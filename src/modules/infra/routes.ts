import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { InfraController } from './controller.js';

const infraController = new InfraController();

export default async function infraRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
): Promise<void> {

  // ============ RELEVAMIENTO POSTES ============
  
  fastify.get('/postes', {
    schema: {
      tags: ['Infraestructura'],
      summary: 'Listar relevamientos de postes',
      querystring: {
        type: 'object',
        properties: {
          idLinea: { type: 'string' },
          idPosteType: { type: 'string' },
          estado: { type: 'string', enum: ['bueno', 'regular', 'malo', 'peligroso'] },
          limit: { type: 'string', default: '100' },
          offset: { type: 'string', default: '0' },
        },
      },
    },
  }, infraController.getRelevamientoPostes.bind(infraController));

  fastify.get('/postes/:id', {
    schema: {
      tags: ['Infraestructura'],
      summary: 'Obtener relevamiento de poste por ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, infraController.getRelevamientoPosteById.bind(infraController));

  // ============ DISTRIBUIDORES ============
  
  fastify.get('/distribuidores', {
    schema: {
      tags: ['Infraestructura'],
      summary: 'Listar distribuidores',
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'string', default: '100' },
          offset: { type: 'string', default: '0' },
        },
      },
    },
  }, infraController.getDistribuidores.bind(infraController));

  fastify.get('/distribuidores/:id', {
    schema: {
      tags: ['Infraestructura'],
      summary: 'Obtener distribuidor por ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, infraController.getDistribuidorById.bind(infraController));

  // ============ MAP PERIODOS ============
  
  fastify.get('/periodos', {
    schema: {
      tags: ['Infraestructura'],
      summary: 'Listar períodos',
      querystring: {
        type: 'object',
        properties: {
          tipo: { type: 'string' },
          limit: { type: 'string', default: '100' },
          offset: { type: 'string', default: '0' },
        },
      },
    },
  }, infraController.getMapPeriodos.bind(infraController));

  fastify.get('/periodos/:id', {
    schema: {
      tags: ['Infraestructura'],
      summary: 'Obtener período por ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, infraController.getMapPeriodoById.bind(infraController));

  fastify.get('/periodos/clave/:clave', {
    schema: {
      tags: ['Infraestructura'],
      summary: 'Obtener período por clave normalizada',
      params: {
        type: 'object',
        required: ['clave'],
        properties: { clave: { type: 'string' } },
      },
    },
  }, infraController.getMapPeriodoByClave.bind(infraController));
}
