import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { CatalogosController } from './controller.js';

const catalogosController = new CatalogosController();

export default async function catalogosRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
): Promise<void> {

  // ============ BOCAS DE COMPRA ============
  
  fastify.get('/bocas', {
    schema: {
      tags: ['Catálogos'],
      summary: 'Listar bocas de compra',
      description: 'Obtener lista paginada de bocas de compra',
      querystring: {
        type: 'object',
        properties: {
          activo: { type: 'string', enum: ['true', 'false', 'all'], default: 'true' },
          limit: { type: 'string', default: '100' },
          offset: { type: 'string', default: '0' },
          search: { type: 'string', description: 'Buscar por nombre o proveedor' },
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
                  nombre: { type: 'string' },
                  proveedor: { type: 'string' },
                  activo: { type: 'boolean' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
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
  }, catalogosController.getBocasCompra.bind(catalogosController));

  fastify.get('/bocas/:id', {
    schema: {
      tags: ['Catálogos'],
      summary: 'Obtener boca de compra por ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'ID de la boca de compra' },
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
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
  }, catalogosController.getBocaCompraById.bind(catalogosController));

  fastify.post('/bocas', {
    schema: {
      tags: ['Catálogos'],
      summary: 'Crear boca de compra',
      body: {
        type: 'object',
        required: ['nombre', 'proveedor'],
        properties: {
          nombre: { type: 'string', minLength: 3, maxLength: 100 },
          proveedor: { type: 'string', minLength: 3, maxLength: 100 },
          activo: { type: 'boolean', default: true },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                nombre: { type: 'string' },
                proveedor: { type: 'string' },
                activo: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
  }, catalogosController.createBocaCompra.bind(catalogosController));

  fastify.put('/bocas/:id', {
    schema: {
      tags: ['Catálogos'],
      summary: 'Actualizar boca de compra',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          nombre: { type: 'string', minLength: 3, maxLength: 100 },
          proveedor: { type: 'string', minLength: 3, maxLength: 100 },
          activo: { type: 'boolean' },
        },
      },
    },
  }, catalogosController.updateBocaCompra.bind(catalogosController));

  fastify.delete('/bocas/:id', {
    schema: {
      tags: ['Catálogos'],
      summary: 'Eliminar boca de compra',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, catalogosController.deleteBocaCompra.bind(catalogosController));

  // ============ SEGMENTOS ============
  
  fastify.get('/segmentos', {
    schema: {
      tags: ['Catálogos'],
      summary: 'Listar segmentos de usuarios',
      querystring: {
        type: 'object',
        properties: {
          activo: { type: 'string', enum: ['true', 'false', 'all'], default: 'true' },
          limit: { type: 'string', default: '100' },
          offset: { type: 'string', default: '0' },
          search: { type: 'string' },
        },
      },
    },
  }, catalogosController.getSegmentos.bind(catalogosController));

  fastify.get('/segmentos/:id', {
    schema: {
      tags: ['Catálogos'],
      summary: 'Obtener segmento por ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, catalogosController.getSegmentoById.bind(catalogosController));

  fastify.post('/segmentos', {
    schema: {
      tags: ['Catálogos'],
      summary: 'Crear segmento',
      body: {
        type: 'object',
        required: ['nombre', 'codigo'],
        properties: {
          nombre: { type: 'string', minLength: 3, maxLength: 50 },
          codigo: { type: 'string', minLength: 2, maxLength: 10 },
          activo: { type: 'boolean', default: true },
        },
      },
    },
  }, catalogosController.createSegmento.bind(catalogosController));

  fastify.put('/segmentos/:id', {
    schema: {
      tags: ['Catálogos'],
      summary: 'Actualizar segmento',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          nombre: { type: 'string', minLength: 3, maxLength: 50 },
          codigo: { type: 'string', minLength: 2, maxLength: 10 },
          activo: { type: 'boolean' },
        },
      },
    },
  }, catalogosController.updateSegmento.bind(catalogosController));

  fastify.delete('/segmentos/:id', {
    schema: {
      tags: ['Catálogos'],
      summary: 'Eliminar segmento',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, catalogosController.deleteSegmento.bind(catalogosController));

  // ============ LÍNEAS ============
  
  fastify.get('/lineas', {
    schema: {
      tags: ['Catálogos'],
      summary: 'Listar líneas eléctricas',
      querystring: {
        type: 'object',
        properties: {
          activo: { type: 'string', enum: ['true', 'false', 'all'], default: 'true' },
          limit: { type: 'string', default: '100' },
          offset: { type: 'string', default: '0' },
          search: { type: 'string' },
        },
      },
    },
  }, catalogosController.getLineas.bind(catalogosController));

  fastify.get('/lineas/:id', {
    schema: {
      tags: ['Catálogos'],
      summary: 'Obtener línea por ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, catalogosController.getLineaById.bind(catalogosController));

  fastify.post('/lineas', {
    schema: {
      tags: ['Catálogos'],
      summary: 'Crear línea eléctrica',
      body: {
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
  }, catalogosController.createLinea.bind(catalogosController));

  fastify.put('/lineas/:id', {
    schema: {
      tags: ['Catálogos'],
      summary: 'Actualizar línea eléctrica',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          nombre: { type: 'string', minLength: 3, maxLength: 100 },
          tension: { type: 'string', minLength: 2, maxLength: 20 },
          zona: { type: 'string', minLength: 2, maxLength: 50 },
          activo: { type: 'boolean' },
        },
      },
    },
  }, catalogosController.updateLinea.bind(catalogosController));

  fastify.delete('/lineas/:id', {
    schema: {
      tags: ['Catálogos'],
      summary: 'Eliminar línea eléctrica',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, catalogosController.deleteLinea.bind(catalogosController));

  // ============ TIPOS DE POSTE ============
  
  fastify.get('/tipos-poste', {
    schema: {
      tags: ['Catálogos'],
      summary: 'Listar tipos de poste',
      querystring: {
        type: 'object',
        properties: {
          activo: { type: 'string', enum: ['true', 'false', 'all'], default: 'true' },
          limit: { type: 'string', default: '100' },
          offset: { type: 'string', default: '0' },
          search: { type: 'string' },
        },
      },
    },
  }, catalogosController.getTiposPoste.bind(catalogosController));

  fastify.get('/tipos-poste/:id', {
    schema: {
      tags: ['Catálogos'],
      summary: 'Obtener tipo de poste por ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, catalogosController.getTipoPosteById.bind(catalogosController));

  fastify.post('/tipos-poste', {
    schema: {
      tags: ['Catálogos'],
      summary: 'Crear tipo de poste',
      body: {
        type: 'object',
        required: ['nombre'],
        properties: {
          nombre: { type: 'string', minLength: 3, maxLength: 50 },
          activo: { type: 'boolean', default: true },
        },
      },
    },
  }, catalogosController.createTipoPoste.bind(catalogosController));

  fastify.put('/tipos-poste/:id', {
    schema: {
      tags: ['Catálogos'],
      summary: 'Actualizar tipo de poste',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          nombre: { type: 'string', minLength: 3, maxLength: 50 },
          activo: { type: 'boolean' },
        },
      },
    },
  }, catalogosController.updateTipoPoste.bind(catalogosController));

  fastify.delete('/tipos-poste/:id', {
    schema: {
      tags: ['Catálogos'],
      summary: 'Eliminar tipo de poste',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, catalogosController.deleteTipoPoste.bind(catalogosController));

  // ============ USUARIOS ============
  
  fastify.get('/usuarios', {
    schema: {
      tags: ['Usuarios'],
      summary: 'Listar usuarios (suministros)',
      querystring: {
        type: 'object',
        properties: {
          activo: { type: 'string', enum: ['true', 'false', 'all'], default: 'true' },
          limit: { type: 'string', default: '100' },
          offset: { type: 'string', default: '0' },
          search: { type: 'string' },
          idSegmento: { type: 'string' },
          idLinea: { type: 'string' },
        },
      },
    },
  }, catalogosController.getUsuarios.bind(catalogosController));

  fastify.get('/usuarios/:id', {
    schema: {
      tags: ['Usuarios'],
      summary: 'Obtener usuario por ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, catalogosController.getUsuarioById.bind(catalogosController));

  fastify.get('/usuarios/suministro/:nroSuministro', {
    schema: {
      tags: ['Usuarios'],
      summary: 'Obtener usuario por número de suministro',
      params: {
        type: 'object',
        required: ['nroSuministro'],
        properties: {
          nroSuministro: { type: 'string' },
        },
      },
    },
  }, catalogosController.getUsuarioByNroSuministro.bind(catalogosController));

  fastify.post('/usuarios', {
    schema: {
      tags: ['Usuarios'],
      summary: 'Crear usuario (suministro)',
      body: {
        type: 'object',
        required: ['nroSuministro', 'nombre', 'idSegmento'],
        properties: {
          nroSuministro: { type: 'string', minLength: 3, maxLength: 20 },
          nombre: { type: 'string', minLength: 3, maxLength: 200 },
          direccion: { type: 'string', maxLength: 300 },
          idSegmento: { type: 'number', minimum: 1 },
          idLinea: { type: 'number', minimum: 1 },
          activo: { type: 'boolean', default: true },
        },
      },
    },
  }, catalogosController.createUsuario.bind(catalogosController));

  fastify.put('/usuarios/:id', {
    schema: {
      tags: ['Usuarios'],
      summary: 'Actualizar usuario (suministro)',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          nroSuministro: { type: 'string', minLength: 3, maxLength: 20 },
          nombre: { type: 'string', minLength: 3, maxLength: 200 },
          direccion: { type: 'string', maxLength: 300 },
          idSegmento: { type: 'number', minimum: 1 },
          idLinea: { type: 'number', minimum: 1 },
          activo: { type: 'boolean' },
        },
      },
    },
  }, catalogosController.updateUsuario.bind(catalogosController));

  fastify.delete('/usuarios/:id', {
    schema: {
      tags: ['Usuarios'],
      summary: 'Eliminar usuario (suministro)',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, catalogosController.deleteUsuario.bind(catalogosController));
}