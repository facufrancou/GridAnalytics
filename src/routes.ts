import type { FastifyInstance } from 'fastify';
import { prisma } from './infra/db.js';

// Módulos principales
import { AuthService, createAuthController, registerAuthModule } from './modules/auth/index.js';
import { CatalogosService, createCatalogosController, registerCatalogosModule } from './modules/catalogos/index.js';
import { ETLService, createETLController, registerETLModule } from './modules/etl/index.js';
import { AnalyticsService, createAnalyticsController, registerAnalyticsModule } from './modules/analytics/index.js';

// Middlewares
import { authMiddleware } from './middlewares/auth.js';
import { errorHandler } from './middlewares/error.js';
import { rateLimitMiddleware } from './middlewares/rateLimit.js';
import { requestIdMiddleware } from './middlewares/requestId.js';

export async function registerRoutes(fastify: FastifyInstance) {
  // Middlewares globales
  await fastify.register(requestIdMiddleware);
  await fastify.register(rateLimitMiddleware);
  await fastify.register(errorHandler);

  // Servicios
  const authService = new AuthService(prisma);
  const catalogosService = new CatalogosService(prisma);
  const etlService = new ETLService(prisma);
  const analyticsService = new AnalyticsService(prisma);

  // Controladores
  const authController = createAuthController(authService);
  const catalogosController = createCatalogosController(catalogosService);
  const etlController = createETLController(etlService);
  const analyticsController = createAnalyticsController(analyticsService);

  // Rutas públicas (sin autenticación)
  await registerAuthModule(fastify, authController);

  // Middleware de autenticación para rutas protegidas
  await fastify.register(async (protectedFastify) => {
    await protectedFastify.addHook('preHandler', authMiddleware(authService));
    
    // Rutas protegidas
    await registerCatalogosModule(protectedFastify, catalogosController);
    await registerETLModule(protectedFastify, etlController);
    await registerAnalyticsModule(protectedFastify, analyticsController);
  });

  // Ruta de health check
  await fastify.get('/health', {
    schema: {
      summary: 'Health Check',
      description: 'Verificar estado del servicio y conectividad a base de datos',
      tags: ['System'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            database: { type: 'string' },
            uptime: { type: 'number' },
            version: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        // Test database connection
        await prisma.$queryRaw`SELECT 1`;
        
        await reply.code(200).send({
          status: 'ok',
          timestamp: new Date().toISOString(),
          database: 'connected',
          uptime: process.uptime(),
          version: process.env.npm_package_version || '1.0.0',
        });
      } catch (error) {
        await reply.code(503).send({
          status: 'error',
          timestamp: new Date().toISOString(),
          database: 'disconnected',
          uptime: process.uptime(),
          version: process.env.npm_package_version || '1.0.0',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  // Documentación de la API
  await fastify.get('/docs', {
    schema: {
      hide: true,
    },
    handler: async (request, reply) => {
      const openApiSpec = fastify.swagger();
      
      const html = `
<!DOCTYPE html>
<html>
<head>
  <title>API Documentation - Cooperativa Eléctrica</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/docs/json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        tryItOutEnabled: true,
        requestInterceptor: function(request) {
          // Add auth header if token exists in localStorage
          const token = localStorage.getItem('authToken');
          if (token) {
            request.headers['Authorization'] = 'Bearer ' + token;
          }
          return request;
        }
      });
    };
  </script>
</body>
</html>`;
      
      await reply.type('text/html').send(html);
    },
  });

  // JSON de la especificación OpenAPI
  await fastify.get('/docs/json', {
    schema: {
      hide: true,
    },
    handler: async (request, reply) => {
      await reply.send(fastify.swagger());
    },
  });

  // Ruta para información del sistema
  await fastify.get('/system/info', {
    schema: {
      summary: 'Información del sistema',
      description: 'Información detallada sobre el sistema y configuración',
      tags: ['System'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            application: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                version: { type: 'string' },
                environment: { type: 'string' },
                nodeVersion: { type: 'string' },
              },
            },
            database: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                provider: { type: 'string' },
                ssl: { type: 'boolean' },
              },
            },
            security: {
              type: 'object',
              properties: {
                jwtEnabled: { type: 'boolean' },
                apiKeysEnabled: { type: 'boolean' },
                rateLimitEnabled: { type: 'boolean' },
              },
            },
            modules: {
              type: 'object',
              properties: {
                auth: { type: 'boolean' },
                catalogos: { type: 'boolean' },
                etl: { type: 'boolean' },
                analytics: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
    preHandler: authMiddleware(authService),
    handler: async (request, reply) => {
      await reply.send({
        application: {
          name: 'Cooperativa Eléctrica API',
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          nodeVersion: process.version,
        },
        database: {
          status: 'connected',
          provider: 'postgresql',
          ssl: true,
        },
        security: {
          jwtEnabled: true,
          apiKeysEnabled: true,
          rateLimitEnabled: true,
        },
        modules: {
          auth: true,
          catalogos: true,
          etl: true,
          analytics: true,
        },
      });
    },
  });
}