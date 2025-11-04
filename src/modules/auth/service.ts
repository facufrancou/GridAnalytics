import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { nanoid } from 'nanoid';
import { prisma } from '../../infra/db.js';
import config from '../../config/index.js';
import { UnauthorizedError, ConflictError, NotFoundError } from '../../middlewares/error.js';
import { logAuthEvent, logSecurityEvent } from '../../utils/logger.js';
import type { 
  LoginRequest, 
  RegisterRequest, 
  RefreshTokenRequest, 
  CreateApiKeyRequest,
  AuthResponse,
  ApiKeyResponse 
} from './schemas.js';

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export class AuthService {
  // Registrar nuevo usuario (solo admin puede crear usuarios)
  async register(data: RegisterRequest, requestingUserId?: number): Promise<AuthResponse> {
    // Verificar si el email ya existe
    const existingUser = await prisma.usersAuth.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('El email ya está registrado');
    }

    // Hash del password
    const passwordHash = await argon2.hash(data.password);

    // Crear usuario
    const user = await prisma.usersAuth.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role,
      },
    });

    logAuthEvent('register', requestingUserId, {
      newUserId: user.id,
      email: data.email,
      role: data.role,
    });

    // Generar tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens,
    };
  }

  // Login con email y password
  async login(data: LoginRequest, clientIP?: string): Promise<AuthResponse> {
    // Buscar usuario
    const user = await prisma.usersAuth.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.activo) {
      logSecurityEvent('failed_login', {
        email: data.email,
        ip: clientIP,
        reason: 'user_not_found_or_inactive',
      });
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Verificar password
    const validPassword = await argon2.verify(user.passwordHash, data.password);
    if (!validPassword) {
      logSecurityEvent('failed_login', {
        email: data.email,
        ip: clientIP,
        reason: 'invalid_password',
      });
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Actualizar último login
    await prisma.usersAuth.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    logAuthEvent('login', user.id, { ip: clientIP });

    // Generar tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens,
    };
  }

  // Refresh de tokens
  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    try {
      // Verificar el refresh token
      const payload = jwt.verify(data.refreshToken, config.jwt.refreshSecret) as JWTPayload;

      // Buscar el token en la base de datos
      const storedToken = await prisma.refreshTokens.findFirst({
        where: {
          tokenHash: await argon2.hash(data.refreshToken),
          userId: payload.userId,
          revoked: false,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });

      if (!storedToken) {
        throw new UnauthorizedError('Refresh token inválido');
      }

      // Revocar el refresh token usado (rotación)
      await prisma.refreshTokens.update({
        where: { id: storedToken.id },
        data: { revoked: true },
      });

      logAuthEvent('token_refresh', payload.userId);

      // Generar nuevos tokens
      const tokens = await this.generateTokens(storedToken.user);

      return {
        user: {
          id: storedToken.user.id,
          email: storedToken.user.email,
          name: storedToken.user.name,
          role: storedToken.user.role,
        },
        tokens,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Refresh token inválido');
      }
      throw error;
    }
  }

  // Logout (revocar refresh token)
  async logout(refreshToken: string, userId: number): Promise<void> {
    try {
      const tokenHash = await argon2.hash(refreshToken);
      
      await prisma.refreshTokens.updateMany({
        where: {
          tokenHash,
          userId,
          revoked: false,
        },
        data: { revoked: true },
      });

      logAuthEvent('logout', userId);
    } catch (error) {
      // No lanzar error si no se encuentra el token
      logAuthEvent('logout', userId, { error: 'token_not_found' });
    }
  }

  // Crear API Key
  async createApiKey(data: CreateApiKeyRequest, createdByUserId: number): Promise<ApiKeyResponse> {
    // Generar key única
    const key = `coop_${nanoid(32)}`;
    const keyHash = await argon2.hash(key);

    const apiKey = await prisma.apiKeys.create({
      data: {
        name: data.name,
        keyHash,
        scopes: data.scopes,
      },
    });

    logSecurityEvent('api_key_created', {
      apiKeyId: apiKey.id,
      name: data.name,
      scopes: data.scopes,
      createdBy: createdByUserId,
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      key, // Solo se muestra al crear
      scopes: apiKey.scopes,
      createdAt: apiKey.createdAt.toISOString(),
    };
  }

  // Validar API Key
  async validateApiKey(key: string): Promise<{ id: number; name: string; scopes: string[] } | null> {
    const apiKeys = await prisma.apiKeys.findMany({
      where: { activo: true },
    });

    for (const apiKey of apiKeys) {
      try {
        const isValid = await argon2.verify(apiKey.keyHash, key);
        if (isValid) {
          // Actualizar último uso
          await prisma.apiKeys.update({
            where: { id: apiKey.id },
            data: { lastUsed: new Date() },
          });

          return {
            id: apiKey.id,
            name: apiKey.name,
            scopes: apiKey.scopes,
          };
        }
      } catch (error) {
        // Continuar con la siguiente key
        continue;
      }
    }

    return null;
  }

  // Listar API Keys (sin mostrar las keys)
  async listApiKeys(): Promise<Omit<ApiKeyResponse, 'key'>[]> {
    const apiKeys = await prisma.apiKeys.findMany({
      where: { activo: true },
      orderBy: { createdAt: 'desc' },
    });

    return apiKeys.map(key => ({
      id: key.id,
      name: key.name,
      scopes: key.scopes,
      createdAt: key.createdAt.toISOString(),
    }));
  }

  // Revocar API Key
  async revokeApiKey(keyId: number, revokedByUserId: number): Promise<void> {
    const apiKey = await prisma.apiKeys.findUnique({
      where: { id: keyId },
    });

    if (!apiKey) {
      throw new NotFoundError('API Key no encontrada');
    }

    await prisma.apiKeys.update({
      where: { id: keyId },
      data: { activo: false },
    });

    logSecurityEvent('api_key_revoked', {
      apiKeyId: keyId,
      name: apiKey.name,
      revokedBy: revokedByUserId,
    });
  }

  // Generar tokens JWT
  private async generateTokens(user: { id: number; email: string; role: string }) {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // Access token (corta duración)
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessExpiresIn,
    });

    // Refresh token (larga duración)
    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    // Guardar refresh token en BD
    const tokenHash = await argon2.hash(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

    await prisma.refreshTokens.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Limpiar refresh tokens expirados del usuario
    await prisma.refreshTokens.deleteMany({
      where: {
        userId: user.id,
        OR: [
          { expiresAt: { lt: new Date() } },
          { revoked: true },
        ],
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwt.accessExpiresIn,
    };
  }
}