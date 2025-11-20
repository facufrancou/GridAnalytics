import dotenv from 'dotenv';
import type { FastifyInstance } from 'fastify';

// Cargar variables de entorno
dotenv.config();

export interface Config {
  port: number;
  host: string;
  nodeEnv: string;
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
  security: {
    allowedOrigins: string[];
    rateLimitMax: number;
    rateLimitWindow: number;
    maxFileSize: number;
  };
  logs: {
    level: string;
  };
}

export const config: Config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  host: process.env.HOST ?? '0.0.0.0',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    accessExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  security: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW ?? '60000', 10),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? '10485760', 10), // 10MB
  },
  logs: {
    level: process.env.LOG_LEVEL ?? 'info',
  },
};

// Validaciones básicas
if (!config.database.url) {
  throw new Error('DATABASE_URL es requerida');
}

if (!config.jwt.secret || !config.jwt.refreshSecret) {
  throw new Error('JWT_SECRET y REFRESH_TOKEN_SECRET son requeridos');
}

// Declaración global para Fastify
declare module 'fastify' {
  interface FastifyRequest {
    requestId: string;
    user?: {
      id: number;
      email: string;
      role: string;
    };
    apiKey?: {
      id: number;
      name: string;
      scopes: string[];
    };
  }
}

export default config;