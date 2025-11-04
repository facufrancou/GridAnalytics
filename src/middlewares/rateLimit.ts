import type { FastifyRequest, FastifyReply } from 'fastify';
import { config } from '../config/index.js';

// Rate limiting básico por IP
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function rateLimitMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const clientIP = request.ip;
  const now = Date.now();
  const windowMs = config.security.rateLimitWindow;
  const maxRequests = config.security.rateLimitMax;

  // Limpiar entradas expiradas
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(ip);
    }
  }

  // Obtener o crear entrada para esta IP
  let entry = rateLimitStore.get(clientIP);
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(clientIP, entry);
  }

  // Incrementar contador
  entry.count++;

  // Headers informativos sobre rate limiting
  reply.header('X-RateLimit-Limit', maxRequests);
  reply.header('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count));
  reply.header('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

  // Verificar si se excedió el límite
  if (entry.count > maxRequests) {
    request.log.warn({
      ip: clientIP,
      count: entry.count,
      limit: maxRequests,
    }, 'Rate limit exceeded');

    await reply.status(429).send({
      error: true,
      message: 'Too Many Requests',
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      requestId: request.requestId,
    });
    return;
  }
}

// Rate limiting específico para API keys (más permisivo)
export async function apiKeyRateLimitMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (!request.apiKey) {
    return; // No hay API key, usar rate limit normal
  }

  const apiKeyId = request.apiKey.id.toString();
  const now = Date.now();
  const windowMs = config.security.rateLimitWindow;
  const maxRequests = config.security.rateLimitMax * 5; // 5x más permisivo para API keys

  // Limpiar entradas expiradas
  for (const [key, data] of rateLimitStore.entries()) {
    if (key.startsWith('api:') && now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }

  const storeKey = `api:${apiKeyId}`;
  let entry = rateLimitStore.get(storeKey);
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(storeKey, entry);
  }

  entry.count++;

  reply.header('X-RateLimit-Limit', maxRequests);
  reply.header('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count));
  reply.header('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

  if (entry.count > maxRequests) {
    request.log.warn({
      apiKeyId,
      apiKeyName: request.apiKey.name,
      count: entry.count,
      limit: maxRequests,
    }, 'API key rate limit exceeded');

    await reply.status(429).send({
      error: true,
      message: 'API Key Rate Limit Exceeded',
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      requestId: request.requestId,
    });
  }
}