import type { FastifyInstance } from 'fastify';
import { EtlService } from './service.js';
import { EtlController } from './controller.js';
import etlRoutes from './routes.js';

export { EtlService as ETLService, EtlController as ETLController };
export * from './schemas.js';

// Helper function to create controller
export function createETLController(service?: EtlService) {
  return new EtlController();
}

export async function registerETLModule(
  fastify: FastifyInstance,
  controller: EtlController
): Promise<void> {
  await fastify.register(etlRoutes, { prefix: '/etl' });
}
