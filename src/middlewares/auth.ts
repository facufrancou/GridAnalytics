import jwt from 'jsonwebtoken';
import type { FastifyRequest, FastifyReply } from 'fastify';
import config from '../config/index.js';
import { UnauthorizedError, ForbiddenError } from './error.js';
import { AuthService } from '../modules/auth/service.js';
import { logger } from '../utils/logger.js';
import type { JWTPayload } from '../modules/auth/service.js';

// Helper for security logging
function logSecurityEvent(event: string, details: any) {
  logger.warn({ event, ...details }, 'Security Event');
}

const authService = new AuthService();

// Middleware para verificar JWT
export async function jwtAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token de autorización requerido');
  }

  const token = authHeader.substring(7); // Remover "Bearer "

  try {
    const payload = jwt.verify(token, config.jwt.secret) as JWTPayload;
    
    // Agregar información del usuario al request
    request.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expirado');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Token inválido');
    }
    throw error;
  }
}

// Middleware para verificar API Key
export async function apiKeyAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const apiKey = request.headers['x-api-key'] as string;

  if (!apiKey) {
    throw new UnauthorizedError('API Key requerida');
  }

  const keyInfo = await authService.validateApiKey(apiKey);

  if (!keyInfo) {
    logSecurityEvent('invalid_api_key', {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      url: request.url,
    });
    throw new UnauthorizedError('API Key inválida');
  }

  // Agregar información de la API Key al request
  request.apiKey = keyInfo;
}

// Middleware combinado: acepta JWT o API Key
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const hasJWT = request.headers.authorization?.startsWith('Bearer ');
  const hasApiKey = !!request.headers['x-api-key'];

  if (!hasJWT && !hasApiKey) {
    throw new UnauthorizedError('Autorización requerida (JWT o API Key)');
  }

  try {
    if (hasJWT) {
      await jwtAuthMiddleware(request, reply);
    } else if (hasApiKey) {
      await apiKeyAuthMiddleware(request, reply);
    }
  } catch (error) {
    logSecurityEvent('auth_failed', {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      url: request.url,
      hasJWT,
      hasApiKey,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// Middleware para verificar roles (solo para usuarios JWT)
export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      throw new ForbiddenError('Acceso solo permitido con autenticación de usuario');
    }

    if (!roles.includes(request.user.role)) {
      logSecurityEvent('insufficient_permissions', {
        userId: request.user.id,
        userRole: request.user.role,
        requiredRoles: roles,
        url: request.url,
      });
      throw new ForbiddenError('Permisos insuficientes');
    }
  };
}

// Middleware para verificar scopes (solo para API Keys)
export function requireScope(...scopes: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.apiKey) {
      throw new ForbiddenError('Acceso solo permitido con API Key');
    }

    const hasRequiredScope = scopes.some(scope => 
      request.apiKey!.scopes.includes(scope)
    );

    if (!hasRequiredScope) {
      logSecurityEvent('insufficient_scopes', {
        apiKeyId: request.apiKey.id,
        apiKeyScopes: request.apiKey.scopes,
        requiredScopes: scopes,
        url: request.url,
      });
      throw new ForbiddenError('Scopes insuficientes');
    }
  };
}

// Middleware para verificar permisos (roles o scopes)
export function requirePermissions(options: {
  roles?: string[];
  scopes?: string[];
  requireBoth?: boolean;
}) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { roles = [], scopes = [], requireBoth = false } = options;

    const hasValidRole = request.user && roles.includes(request.user.role);
    const hasValidScope = request.apiKey && scopes.some(scope => 
      request.apiKey!.scopes.includes(scope)
    );

    if (requireBoth) {
      // Requiere ambos: rol de usuario Y scope de API key
      if (!hasValidRole || !hasValidScope) {
        throw new ForbiddenError('Permisos insuficientes');
      }
    } else {
      // Requiere al menos uno: rol de usuario O scope de API key
      if (!hasValidRole && !hasValidScope) {
        logSecurityEvent('access_denied', {
          userId: request.user?.id,
          userRole: request.user?.role,
          apiKeyId: request.apiKey?.id,
          apiKeyScopes: request.apiKey?.scopes,
          requiredRoles: roles,
          requiredScopes: scopes,
          url: request.url,
        });
        throw new ForbiddenError('Permisos insuficientes');
      }
    }
  };
}