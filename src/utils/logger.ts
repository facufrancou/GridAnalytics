import pino from 'pino';
import config from '../config/index.js';

// Configuración del logger según el entorno
const loggerConfig = {
  level: config.logs.level,
  
  // En desarrollo usar pretty print, en producción JSON
  ...(config.nodeEnv === 'development' 
    ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
    : {}),
    
  // Serializers personalizados para objetos sensibles
  serializers: {
    req: (req: any) => ({
      method: req.method,
      url: req.url,
      headers: {
        ...req.headers,
        // Remover headers sensibles
        authorization: req.headers.authorization ? '[REDACTED]' : undefined,
        cookie: req.headers.cookie ? '[REDACTED]' : undefined,
      },
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
    }),
    res: (res: any) => ({
      statusCode: res.statusCode,
      headers: res.headers,
    }),
    err: pino.stdSerializers.err,
  },
  
  // Campos base en todos los logs
  base: {
    pid: process.pid,
    hostname: process.env.HOSTNAME || 'localhost',
    service: 'cooperativa-electrica-api',
  },
};

export const logger = pino(loggerConfig);

// Función para crear logger de request con requestId
export function createRequestLogger(requestId: string): pino.Logger {
  return logger.child({ requestId });
}

// Función para log de eventos de seguridad
export function logSecurityEvent(
  event: string, 
  details: Record<string, any>, 
  level: 'info' | 'warn' | 'error' = 'warn'
): void {
  logger[level]({
    type: 'security',
    event,
    ...details,
    timestamp: new Date().toISOString(),
  }, `Security event: ${event}`);
}

// Función para log de eventos de ETL
export function logETLEvent(
  operation: string,
  details: Record<string, any>,
  level: 'info' | 'warn' | 'error' = 'info'
): void {
  logger[level]({
    type: 'etl',
    operation,
    ...details,
    timestamp: new Date().toISOString(),
  }, `ETL operation: ${operation}`);
}

// Función para log de eventos de autenticación
export function logAuthEvent(
  action: 'login' | 'logout' | 'token_refresh' | 'unauthorized',
  userId?: number,
  details?: Record<string, any>
): void {
  logger.info({
    type: 'auth',
    action,
    userId,
    ...details,
    timestamp: new Date().toISOString(),
  }, `Auth event: ${action}`);
}

export default logger;