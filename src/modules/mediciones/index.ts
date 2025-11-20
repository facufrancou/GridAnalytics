import type { FastifyInstance } from 'fastify';
import { MedicionesService } from './service.js';
import { MedicionesController } from './controller.js';
import medicionesRoutes from './routes.js';

export { MedicionesService, MedicionesController };

export function createMedicionesController(service: MedicionesService): MedicionesController {
  return new MedicionesController();
}

export async function registerMedicionesModule(
  fastify: FastifyInstance,
  controller: MedicionesController
): Promise<void> {
  await fastify.register(
    async (fastifyInstance) => {
      await medicionesRoutes(fastifyInstance, {});
    },
    { prefix: '/mediciones' }
  );
}
