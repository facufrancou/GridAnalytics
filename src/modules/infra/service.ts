import { prisma } from '../../infra/db.js';
import { NotFoundError } from '../../middlewares/error.js';

export class InfraService {
  
  // ============ RELEVAMIENTO POSTES ============
  
  async getRelevamientoPostes(filters?: {
    idLinea?: number;
    idPosteType?: number;
    estado?: string;
    limit?: number;
    offset?: number;
  }) {
    const { idLinea, idPosteType, estado, limit = 100, offset = 0 } = filters || {};
    
    const where: any = {};
    if (idLinea) where.idLinea = idLinea;
    if (idPosteType) where.idPosteType = idPosteType;
    if (estado) where.estado = estado;

    const [postes, total] = await Promise.all([
      prisma.relevamientoPostes.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          linea: true,
          tipoPoste: true,
        },
        orderBy: { fechaRelevamiento: 'desc' },
      }),
      prisma.relevamientoPostes.count({ where }),
    ]);

    return {
      data: postes,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async getRelevamientoPosteById(id: number) {
    const poste = await prisma.relevamientoPostes.findUnique({
      where: { id },
      include: {
        linea: true,
        tipoPoste: true,
      },
    });

    if (!poste) {
      throw new NotFoundError('Relevamiento de poste no encontrado');
    }

    return poste;
  }

  // ============ DISTRIBUIDORES ============
  
  async getDistribuidores(filters?: {
    limit?: number;
    offset?: number;
  }) {
    const { limit = 100, offset = 0 } = filters || {};

    const [distribuidores, total] = await Promise.all([
      prisma.cat_distribuidor.findMany({
        take: limit,
        skip: offset,
        include: {
          cat_bocas_compra: true,
          usuarios: {
            take: 10, // Limitar usuarios asociados
          },
        },
        orderBy: { nombre: 'asc' },
      }),
      prisma.cat_distribuidor.count({}),
    ]);

    return {
      data: distribuidores,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async getDistribuidorById(id: number) {
    const distribuidor = await prisma.cat_distribuidor.findUnique({
      where: { id },
      include: {
        cat_bocas_compra: true,
        usuarios: true,
      },
    });

    if (!distribuidor) {
      throw new NotFoundError('Distribuidor no encontrado');
    }

    return distribuidor;
  }

  // ============ MAP PERIODOS ============
  
  async getMapPeriodos(filters?: {
    tipo?: string;
    limit?: number;
    offset?: number;
  }) {
    const { tipo, limit = 100, offset = 0 } = filters || {};
    
    const where: any = {};
    if (tipo) where.tipo = tipo;

    const [periodos, total] = await Promise.all([
      prisma.mapPeriodos.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { fechaInicio: 'desc' },
      }),
      prisma.mapPeriodos.count({ where }),
    ]);

    return {
      data: periodos,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async getMapPeriodoById(id: number) {
    const periodo = await prisma.mapPeriodos.findUnique({
      where: { id },
    });

    if (!periodo) {
      throw new NotFoundError('Período no encontrado');
    }

    return periodo;
  }

  async getMapPeriodoByClave(claveNormalizada: string) {
    const periodo = await prisma.mapPeriodos.findUnique({
      where: { claveNormalizada },
    });

    if (!periodo) {
      throw new NotFoundError('Período no encontrado');
    }

    return periodo;
  }
}
