import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import multipart from '@fastify/multipart';
import { nanoid } from 'nanoid';

import config from './config/index.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middlewares/error.js';
import { registerRoutes } from './routes.js';

export async function createApp() {
  // Crear instancia de Fastify
  const fastify = Fastify({
    logger: logger,
    trustProxy: true,
    bodyLimit: config.security.maxFileSize,
  });

  // Registrar plugins de seguridad
  await fastify.register(helmet, {
    contentSecurityPolicy: false, // Para Swagger UI
  });

  await fastify.register(cors, {
    origin: config.security.allowedOrigins,
    credentials: true,
  });

  await fastify.register(rateLimit, {
    max: config.security.rateLimitMax,
    timeWindow: config.security.rateLimitWindow,
  });

  // Registrar plugin para manejo de archivos
  await fastify.register(multipart, {
    limits: {
      fileSize: config.security.maxFileSize,
    },
  });

  // Registrar Swagger para documentación
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Cooperativa Eléctrica API',
        description: 'API para gestión de compra/venta de energía eléctrica',
        version: '1.0.0',
        contact: {
          name: 'Equipo Técnico',
          email: 'tech@cooperativa.com',
        },
      },
      servers: [
        {
          url: `http://localhost:${config.port}`,
          description: 'Servidor de desarrollo',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          apiKey: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
          },
        },
      },
      security: [
        { bearerAuth: [] },
        { apiKey: [] },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  // Middleware de requestId - registrar como hook
  fastify.addHook('onRequest', async (request, reply) => {
    const requestId = nanoid(10);
    request.requestId = requestId;
  });

  // Error handler global
  fastify.setErrorHandler(errorHandler);

  // Health checks
  fastify.get('/healthz', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  fastify.get('/readiness', async () => {
    // Aquí podríamos verificar la conexión a BD, etc.
    return { status: 'ready', timestamp: new Date().toISOString() };
  });

  // Ruta raíz con información de la API
  fastify.get('/', async () => {
    return {
      name: 'Cooperativa Eléctrica API',
      version: '1.0.0',
      description: 'API para gestión de compra/venta de energía eléctrica',
      docs: '/docs',
      health: '/healthz',
      environment: config.nodeEnv,
    };
  });

  // Registrar rutas de módulos
  await fastify.register(async (apiInstance) => {
    await registerRoutes(apiInstance);
  }, { prefix: '/api' });

  return fastify;
}