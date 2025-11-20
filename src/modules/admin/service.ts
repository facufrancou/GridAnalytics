import { prisma } from '../../infra/db.js';
import { NotFoundError } from '../../middlewares/error.js';

export class AdminService {
  
  // ============ API KEYS ============
  
  async getApiKeys(filters?: {
    activo?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const { activo, limit = 100, offset = 0 } = filters || {};
    
    const where: any = {};
    if (activo !== undefined) where.activo = activo;

    const [keys, total] = await Promise.all([
      prisma.apiKeys.findMany({
        where,
        take: limit,
        skip: offset,
        select: {
          id: true,
          name: true,
          scopes: true,
          activo: true,
          lastUsed: true,
          createdAt: true,
          updatedAt: true,
          // NO exponemos keyHash por seguridad
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.apiKeys.count({ where }),
    ]);

    return {
      data: keys,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async getApiKeyById(id: number) {
    const key = await prisma.apiKeys.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        scopes: true,
        activo: true,
        lastUsed: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!key) {
      throw new NotFoundError('API Key no encontrada');
    }

    return key;
  }

  // ============ ETL FACTURAS RAW ============
  
  async getEtlFacturasRaw(filters?: {
    fuente?: string;
    hashDoc?: string;
    limit?: number;
    offset?: number;
  }) {
    const { fuente, hashDoc, limit = 100, offset = 0 } = filters || {};
    
    const where: any = {};
    if (fuente) where.fuente = fuente;
    if (hashDoc) where.hashDoc = hashDoc;

    const [registros, total] = await Promise.all([
      prisma.etlFacturasRaw.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          matches: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.etlFacturasRaw.count({ where }),
    ]);

    return {
      data: registros,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async getEtlFacturaRawById(id: number) {
    const registro = await prisma.etlFacturasRaw.findUnique({
      where: { id },
      include: {
        matches: true,
      },
    });

    if (!registro) {
      throw new NotFoundError('Registro ETL no encontrado');
    }

    return registro;
  }

  // ============ ETL MATCH FACTURAS ============
  
  async getEtlMatchFacturas(filters?: {
    entidadDestino?: string;
    procesado?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const { entidadDestino, procesado, limit = 100, offset = 0 } = filters || {};
    
    const where: any = {};
    if (entidadDestino) where.entidadDestino = entidadDestino;
    if (procesado !== undefined) where.procesado = procesado;

    const [registros, total] = await Promise.all([
      prisma.etlMatchFacturas.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          raw: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.etlMatchFacturas.count({ where }),
    ]);

    return {
      data: registros,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async getEtlMatchFacturaById(id: number) {
    const registro = await prisma.etlMatchFacturas.findUnique({
      where: { id },
      include: {
        raw: true,
      },
    });

    if (!registro) {
      throw new NotFoundError('Match ETL no encontrado');
    }

    return registro;
  }
}
