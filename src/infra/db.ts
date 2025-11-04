import { PrismaClient } from '@prisma/client';
import config from '../config/index.js';

// Extensión de Prisma para logs y configuración
const prismaOptions = {
  log: config.nodeEnv === 'development' 
    ? ['query', 'info', 'warn', 'error'] as const
    : ['warn', 'error'] as const,
  
  datasources: {
    db: {
      url: config.database.url,
    },
  },
};

export const prisma = new PrismaClient(prismaOptions);

// Manejo de conexión y desconexión
export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Base de datos conectada exitosamente');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('👋 Base de datos desconectada');
  } catch (error) {
    console.error('❌ Error desconectando la base de datos:', error);
  }
}

// Health check para la base de datos
export async function checkDBHealth(): Promise<{ status: string; message: string }> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', message: 'Database connection is working' };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

// Funciones utilitarias para transacciones
export async function withTransaction<T>(
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    return callback(tx);
  });
}

export default prisma;