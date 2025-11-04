import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { AuthController } from './controller.js';
import { jwtAuthMiddleware, requireRole } from '../../middlewares/auth.js';

const authController = new AuthController();

export default async function authRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
): Promise<void> {
  
  // Rutas públicas (sin autenticación)
  fastify.post('/login', {
    schema: {
      tags: ['Authentication'],
      summary: 'Iniciar sesión',
      description: 'Autenticar usuario con email y password',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', description: 'Email del usuario' },
          password: { type: 'string', description: 'Password del usuario' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    email: { type: 'string' },
                    name: { type: 'string', nullable: true },
                    role: { type: 'string' },
                  },
                },
                tokens: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                    expiresIn: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, authController.login.bind(authController));

  fastify.post('/refresh', {
    schema: {
      tags: ['Authentication'],
      summary: 'Renovar token de acceso',
      description: 'Renovar access token usando refresh token',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', description: 'Refresh token válido' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    email: { type: 'string' },
                    name: { type: 'string', nullable: true },
                    role: { type: 'string' },
                  },
                },
                tokens: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                    expiresIn: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, authController.refreshToken.bind(authController));

  // Rutas protegidas (requieren JWT)
  fastify.post('/register', {
    preHandler: [jwtAuthMiddleware, requireRole('admin')],
    schema: {
      tags: ['Authentication'],
      summary: 'Registrar nuevo usuario',
      description: 'Crear nuevo usuario (solo admin)',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          name: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'operador', 'bi'], default: 'operador' },
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
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    email: { type: 'string' },
                    name: { type: 'string', nullable: true },
                    role: { type: 'string' },
                  },
                },
                tokens: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                    expiresIn: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, authController.register.bind(authController));

  fastify.post('/logout', {
    preHandler: [jwtAuthMiddleware],
    schema: {
      tags: ['Authentication'],
      summary: 'Cerrar sesión',
      description: 'Cerrar sesión y revocar refresh token',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, authController.logout.bind(authController));

  fastify.get('/me', {
    preHandler: [jwtAuthMiddleware],
    schema: {
      tags: ['Authentication'],
      summary: 'Obtener perfil del usuario',
      description: 'Obtener información del usuario autenticado',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    email: { type: 'string' },
                    role: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, authController.getProfile.bind(authController));

  // Gestión de API Keys (solo admin)
  fastify.post('/apikeys', {
    preHandler: [jwtAuthMiddleware, requireRole('admin')],
    schema: {
      tags: ['API Keys'],
      summary: 'Crear API Key',
      description: 'Crear nueva API Key para integración',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['name', 'scopes'],
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 100 },
          scopes: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Scopes: etl:compra, etl:venta, etl:usuarios, catalogos:read, analitica:read',
          },
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
                name: { type: 'string' },
                key: { type: 'string', description: 'Solo se muestra al crear' },
                scopes: { type: 'array', items: { type: 'string' } },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
  }, authController.createApiKey.bind(authController));

  fastify.get('/apikeys', {
    preHandler: [jwtAuthMiddleware, requireRole('admin')],
    schema: {
      tags: ['API Keys'],
      summary: 'Listar API Keys',
      description: 'Obtener lista de API Keys activas',
      security: [{ bearerAuth: [] }],
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
                  name: { type: 'string' },
                  scopes: { type: 'array', items: { type: 'string' } },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
  }, authController.listApiKeys.bind(authController));

  fastify.delete('/apikeys/:id', {
    preHandler: [jwtAuthMiddleware, requireRole('admin')],
    schema: {
      tags: ['API Keys'],
      summary: 'Revocar API Key',
      description: 'Revocar API Key existente',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'ID de la API Key' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, authController.revokeApiKey.bind(authController));
}