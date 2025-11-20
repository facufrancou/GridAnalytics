import type { FastifyInstance } from 'fastify';
import { InfraService } from './service.js';
import { InfraController } from './controller.js';
import infraRoutes from './routes.js';

export { InfraService, InfraController };

export function createInfraController(service: InfraService): InfraController {
  return new InfraController();
}

export async function registerInfraModule(
  fastify: FastifyInstance,
  controller: InfraController
): Promise<void> {
  await fastify.register(
    async (fastifyInstance) => {
      await infraRoutes(fastifyInstance, {});
    },
    { prefix: '/infra' }
  );
}
