import { prisma } from '../../infra/db.js';
import { NotFoundError } from '../../middlewares/error.js';

export class MedicionesService {
  
  // ============ MEDICIONES DE COMPRA ============
  
  async getMedicionesCompra(filters?: {
    idBoca?: number;
    periodoMes?: string;
    limit?: number;
    offset?: number;
  }) {
    const { idBoca, periodoMes, limit = 100, offset = 0 } = filters || {};
    
    const where: any = {};
    if (idBoca) where.idBoca = idBoca;
    if (periodoMes) where.periodoMes = periodoMes;

    const [mediciones, total] = await Promise.all([
      prisma.medicionesCompra.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          boca: true,
        },
        orderBy: [
          { periodoMes: 'desc' },
          { idBoca: 'asc' },
        ],
      }),
      prisma.medicionesCompra.count({ where }),
    ]);

    return {
      data: mediciones,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async getMedicionCompraById(id: number) {
    const medicion = await prisma.medicionesCompra.findUnique({
      where: { id },
      include: {
        boca: true,
      },
    });

    if (!medicion) {
      throw new NotFoundError('Medición de compra no encontrada');
    }

    return medicion;
  }

  async getMedicionesCompraPorBoca(idBoca: number, filters?: {
    periodoInicio?: string;
    periodoFin?: string;
    limit?: number;
    offset?: number;
  }) {
    const { periodoInicio, periodoFin, limit = 100, offset = 0 } = filters || {};
    
    const where: any = { idBoca };
    if (periodoInicio || periodoFin) {
      where.periodoMes = {};
      if (periodoInicio) where.periodoMes.gte = periodoInicio;
      if (periodoFin) where.periodoMes.lte = periodoFin;
    }

    const [mediciones, total] = await Promise.all([
      prisma.medicionesCompra.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          boca: true,
        },
        orderBy: { periodoMes: 'desc' },
      }),
      prisma.medicionesCompra.count({ where }),
    ]);

    return {
      data: mediciones,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  // ============ MEDICIONES DE VENTA ============
  
  async getMedicionesVenta(filters?: {
    idUsuario?: number;
    periodoBimestre?: string;
    limit?: number;
    offset?: number;
  }) {
    const { idUsuario, periodoBimestre, limit = 100, offset = 0 } = filters || {};
    
    const where: any = {};
    if (idUsuario) where.idUsuario = idUsuario;
    if (periodoBimestre) where.periodoBimestre = periodoBimestre;

    const [mediciones, total] = await Promise.all([
      prisma.medicionesVenta.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          usuario: {
            include: {
              segmento: true,
              linea: true,
            },
          },
        },
        orderBy: [
          { periodoBimestre: 'desc' },
          { idUsuario: 'asc' },
        ],
      }),
      prisma.medicionesVenta.count({ where }),
    ]);

    return {
      data: mediciones,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async getMedicionVentaById(id: number) {
    const medicion = await prisma.medicionesVenta.findUnique({
      where: { id },
      include: {
        usuario: {
          include: {
            segmento: true,
            linea: true,
          },
        },
      },
    });

    if (!medicion) {
      throw new NotFoundError('Medición de venta no encontrada');
    }

    return medicion;
  }

  async getMedicionesVentaPorUsuario(idUsuario: number, filters?: {
    periodoInicio?: string;
    periodoFin?: string;
    limit?: number;
    offset?: number;
  }) {
    const { periodoInicio, periodoFin, limit = 100, offset = 0 } = filters || {};
    
    const where: any = { idUsuario };
    if (periodoInicio || periodoFin) {
      where.periodoBimestre = {};
      if (periodoInicio) where.periodoBimestre.gte = periodoInicio;
      if (periodoFin) where.periodoBimestre.lte = periodoFin;
    }

    const [mediciones, total] = await Promise.all([
      prisma.medicionesVenta.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          usuario: {
            include: {
              segmento: true,
              linea: true,
            },
          },
        },
        orderBy: { periodoBimestre: 'desc' },
      }),
      prisma.medicionesVenta.count({ where }),
    ]);

    return {
      data: mediciones,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async getMedicionesVentaPorSuministro(nroSuministro: string, filters?: {
    periodoInicio?: string;
    periodoFin?: string;
    limit?: number;
    offset?: number;
  }) {
    // Primero encontrar el usuario
    const usuario = await prisma.usuarios.findUnique({
      where: { nroSuministro },
    });

    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return this.getMedicionesVentaPorUsuario(usuario.id, filters);
  }
}
