import { AuthService } from './service.js';
import { AuthController } from './controller.js';

export { AuthService, AuthController };
export { default as registerAuthModule } from './routes.js';
export * from './schemas.js';

// Helper function to create controller
export function createAuthController(service?: AuthService) {
  return new AuthController();
}
