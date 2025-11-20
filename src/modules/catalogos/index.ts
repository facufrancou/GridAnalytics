import type { FastifyInstance } from 'fastify';
import { CatalogosService } from './service.js';
import { CatalogosController } from './controller.js';
import catalogosRoutes from './routes.js';

export { CatalogosService, CatalogosController };
export * from './schemas.js';

// Helper function to create controller
export function createCatalogosController(service?: CatalogosService) {
  return new CatalogosController();
}

export async function registerCatalogosModule(
  fastify: FastifyInstance,
  controller: CatalogosController
): Promise<void> {
  await fastify.register(catalogosRoutes, { prefix: '/catalogos' });
}
