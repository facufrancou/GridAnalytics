import type { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './service.js';
import { 
  loginSchema, 
  registerSchema, 
  refreshTokenSchema, 
  createApiKeySchema 
} from './schemas.js';
import { ValidationError } from '../../middlewares/error.js';

const authService = new AuthService();

export class AuthController {
  
  // POST /auth/register
  async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const data = registerSchema.parse(request.body);
      
      // Solo admin puede crear usuarios
      const requestingUserId = request.user?.id;
      
      const result = await authService.register(data, requestingUserId);
      
      await reply.status(201).send({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result,
      });
      
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Datos de registro inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  // POST /auth/login
  async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const data = loginSchema.parse(request.body);
      
      const result = await authService.login(data, request.ip);
      
      await reply.status(200).send({
        success: true,
        message: 'Login exitoso',
        data: result,
      });
      
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Datos de login inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  // POST /auth/refresh
  async refreshToken(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const data = refreshTokenSchema.parse(request.body);
      
      const result = await authService.refreshToken(data);
      
      await reply.status(200).send({
        success: true,
        message: 'Token renovado exitosamente',
        data: result,
      });
      
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Refresh token inválido', (error as any).errors);
      }
      throw error;
    }
  }

  // POST /auth/logout
  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { refreshToken } = refreshTokenSchema.parse(request.body);
      
      if (request.user) {
        await authService.logout(refreshToken, request.user.id);
      }
      
      await reply.status(200).send({
        success: true,
        message: 'Logout exitoso',
      });
      
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Datos de logout inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  // GET /auth/me
  async getProfile(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!request.user) {
      await reply.status(401).send({
        error: true,
        message: 'Usuario no autenticado',
      });
      return;
    }

    await reply.status(200).send({
      success: true,
      data: {
        user: request.user,
      },
    });
  }

  // POST /auth/apikeys
  async createApiKey(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const data = createApiKeySchema.parse(request.body);
      
      if (!request.user) {
        await reply.status(401).send({
          error: true,
          message: 'Usuario no autenticado',
        });
        return;
      }
      
      const result = await authService.createApiKey(data, request.user.id);
      
      await reply.status(201).send({
        success: true,
        message: 'API Key creada exitosamente',
        data: result,
      });
      
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Datos de API Key inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  // GET /auth/apikeys
  async listApiKeys(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await authService.listApiKeys();
    
    await reply.status(200).send({
      success: true,
      data: result,
    });
  }

  // DELETE /auth/apikeys/:id
  async revokeApiKey(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const keyId = parseInt(id, 10);
    
    if (isNaN(keyId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID de API Key inválido',
      });
      return;
    }

    if (!request.user) {
      await reply.status(401).send({
        error: true,
        message: 'Usuario no autenticado',
      });
      return;
    }
    
    await authService.revokeApiKey(keyId, request.user.id);
    
    await reply.status(200).send({
      success: true,
      message: 'API Key revocada exitosamente',
    });
  }
}