import type { FastifyRequest, FastifyReply } from 'fastify';
import { logSecurityEvent } from '../utils/logger.js';

export interface ErrorWithStatus extends Error {
  statusCode?: number;
  validation?: any[];
  validationContext?: string;
}

// Handler global de errores para Fastify
export async function errorHandler(
  error: ErrorWithStatus,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const requestId = request.requestId || 'unknown';
  
  // Log del error (sin exponer detalles sensibles)
  request.log.error({
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
    },
    url: request.url,
    method: request.method,
  }, 'Request error');

  // Determinar status code
  let statusCode = error.statusCode || 500;
  let message = 'Internal Server Error';
  let details: any = undefined;

  // Manejo específico por tipo de error
  if (error.name === 'ValidationError' || error.validation) {
    statusCode = 400;
    message = 'Validation Error';
    details = error.validation;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
    logSecurityEvent('unauthorized_access', {
      requestId,
      url: request.url,
      ip: request.ip,
    });
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Not Found';
  } else if (error.name === 'ConflictError') {
    statusCode = 409;
    message = 'Conflict';
  } else if (error.name === 'PrismaClientKnownRequestError') {
    // Errores específicos de Prisma
    if (error.message.includes('Unique constraint')) {
      statusCode = 409;
      message = 'Resource already exists';
    } else if (error.message.includes('Record to delete does not exist')) {
      statusCode = 404;
      message = 'Resource not found';
    }
  }

  // En desarrollo, mostrar más detalles
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const response = {
    error: true,
    message,
    requestId,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
    ...(isDevelopment && { 
      stack: error.stack,
      originalMessage: error.message 
    }),
  };

  // Enviar respuesta de error
  await reply.status(statusCode).send(response);
}

// Clases de error personalizadas
export class UnauthorizedError extends Error {
  statusCode = 401;
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  statusCode = 403;
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message = 'Not Found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  statusCode = 409;
  constructor(message = 'Conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class ValidationError extends Error {
  statusCode = 400;
  validation: any[];
  constructor(message = 'Validation Error', validation: any[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.validation = validation;
  }
}