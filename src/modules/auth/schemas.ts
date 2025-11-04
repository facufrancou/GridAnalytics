import { z } from 'zod';

// Esquemas de validación para autenticación
export const loginSchema = z.object({
  email: z.string().email('Email inválido').max(150),
  password: z.string().min(6, 'Password debe tener al menos 6 caracteres').max(100),
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido').max(150),
  password: z.string().min(8, 'Password debe tener al menos 8 caracteres').max(100),
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(200).optional(),
  role: z.enum(['admin', 'operador', 'bi']).default('operador'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token es requerido'),
});

export const createApiKeySchema = z.object({
  name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').max(100),
  scopes: z.array(z.string()).min(1, 'Al menos un scope es requerido'),
});

// Esquemas de respuesta
export const authResponseSchema = z.object({
  user: z.object({
    id: z.number(),
    email: z.string(),
    name: z.string().nullable(),
    role: z.string(),
  }),
  tokens: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.string(),
  }),
});

export const apiKeyResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  key: z.string(), // Solo se muestra al crear
  scopes: z.array(z.string()),
  createdAt: z.string(),
});

// Tipos derivados de los esquemas
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;
export type CreateApiKeyRequest = z.infer<typeof createApiKeySchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type ApiKeyResponse = z.infer<typeof apiKeyResponseSchema>;