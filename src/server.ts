import { createApp } from './app.js';
import { connectDB, disconnectDB } from './infra/db.js';
import config from './config/index.js';
import { logger } from './utils/logger.js';

async function startServer(): Promise<void> {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Crear aplicación Fastify
    const app = await createApp();

    // Iniciar servidor
    await app.listen({ 
      port: config.port, 
      host: config.host 
    });

    logger.info({
      port: config.port,
      host: config.host,
      environment: config.nodeEnv,
    }, `🚀 Servidor iniciado en http://${config.host}:${config.port}`);

    logger.info(`📚 Documentación disponible en http://${config.host}:${config.port}/docs`);

    // Manejo de señales para shutdown graceful
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`📢 Recibida señal ${signal}, cerrando servidor...`);
      
      try {
        await app.close();
        await disconnectDB();
        logger.info('✅ Servidor cerrado correctamente');
        process.exit(0);
      } catch (error) {
        logger.error('❌ Error durante el cierre:', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (error) {
    logger.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error({
    reason,
    promise,
  }, '❌ Unhandled Rejection');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error(error, '❌ Uncaught Exception');
  process.exit(1);
});

// Iniciar servidor
startServer().catch((error) => {
  logger.error('❌ Error fatal:', error);
  process.exit(1);
});