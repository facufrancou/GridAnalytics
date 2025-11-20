import type { FastifyInstance } from 'fastify';
import { AdminService } from './service.js';
import { AdminController } from './controller.js';
import adminRoutes from './routes.js';

export { AdminService, AdminController };

export function createAdminController(service: AdminService): AdminController {
  return new AdminController();
}

export async function registerAdminModule(
  fastify: FastifyInstance,
  controller: AdminController
): Promise<void> {
  await fastify.register(
    async (fastifyInstance) => {
      await adminRoutes(fastifyInstance, {});
    },
    { prefix: '/admin' }
  );
}
