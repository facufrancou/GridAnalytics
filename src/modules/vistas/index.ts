import type { FastifyInstance } from 'fastify';
import { VistasService } from './service.js';
import { VistasController } from './controller.js';
import vistasRoutes from './routes.js';

export { VistasService, VistasController };

export function createVistasController(service: VistasService): VistasController {
  return new VistasController();
}

export async function registerVistasModule(
  fastify: FastifyInstance,
  controller: VistasController
): Promise<void> {
  await fastify.register(
    async (fastifyInstance) => {
      await vistasRoutes(fastifyInstance, {});
    },
    { prefix: '/vistas' }
  );
}
