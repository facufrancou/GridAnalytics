import { nanoid } from 'nanoid';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { createRequestLogger } from '../utils/logger.js';

// Middleware para asignar un ID único a cada request
export async function requestIdMiddleware(
  request: FastifyRequest, 
  reply: FastifyReply
): Promise<void> {
  // Generar ID único para el request
  const requestId = nanoid(10);
  request.requestId = requestId;
  
  // Agregar header de respuesta con el requestId
  reply.header('X-Request-Id', requestId);
  
  // Crear logger específico para este request
  request.log = createRequestLogger(requestId);
  
  // Log del request entrante (sin datos sensibles)
  request.log.info({
    method: request.method,
    url: request.url,
    userAgent: request.headers['user-agent'],
    remoteAddress: request.ip,
  }, 'Incoming request');
}