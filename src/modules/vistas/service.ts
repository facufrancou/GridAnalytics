import { prisma } from '../../infra/db.js';
import { NotFoundError } from '../../middlewares/error.js';

export class VistasService {
  
  // ============ VENTA MENSUALIZADA ============
  
  async getVentaMensualizada(filters?: {
    idUsuario?: number;
    idSegmento?: number;
    idLinea?: number;
    periodoMes?: string;
    limit?: number;
    offset?: number;
  }) {
    const { idUsuario, idSegmento, idLinea, periodoMes, limit = 100, offset = 0 } = filters || {};
    
    const where: any = {};
    if (idUsuario) where.idUsuario = idUsuario;
    if (idSegmento) where.idSegmento = idSegmento;
    if (idLinea) where.idLinea = idLinea;
    if (periodoMes) where.periodoMes = periodoMes;

    const [registros, total] = await Promise.all([
      prisma.vwVentaMensualizada.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [
          { periodoMes: 'desc' },
          { idUsuario: 'asc' },
        ],
      }),
      prisma.vwVentaMensualizada.count({ where }),
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

  async getVentaMensualizadaById(id: number) {
    const registro = await prisma.vwVentaMensualizada.findUnique({
      where: { id },
    });

    if (!registro) {
      throw new NotFoundError('Registro de venta mensualizada no encontrado');
    }

    return registro;
  }

  // ============ BALANCE BOCA MES ============
  
  async getBalanceBocaMes(filters?: {
    idBoca?: number;
    periodoMes?: string;
    limit?: number;
    offset?: number;
  }) {
    const { idBoca, periodoMes, limit = 100, offset = 0 } = filters || {};
    
    const where: any = {};
    if (idBoca) where.idBoca = idBoca;
    if (periodoMes) where.periodoMes = periodoMes;

    const [registros, total] = await Promise.all([
      prisma.vwBalanceBocaMes.findMany({
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
      prisma.vwBalanceBocaMes.count({ where }),
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

  async getBalanceBocaMesById(id: number) {
    const registro = await prisma.vwBalanceBocaMes.findUnique({
      where: { id },
      include: {
        boca: true,
      },
    });

    if (!registro) {
      throw new NotFoundError('Registro de balance no encontrado');
    }

    return registro;
  }

  // ============ VENTA POR SEGMENTO MES ============
  
  async getVentaPorSegmentoMes(filters?: {
    idSegmento?: number;
    periodoMes?: string;
    limit?: number;
    offset?: number;
  }) {
    const { idSegmento, periodoMes, limit = 100, offset = 0 } = filters || {};
    
    const where: any = {};
    if (idSegmento) where.idSegmento = idSegmento;
    if (periodoMes) where.periodoMes = periodoMes;

    const [registros, total] = await Promise.all([
      prisma.vwVentaPorSegmentoMes.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [
          { periodoMes: 'desc' },
          { idSegmento: 'asc' },
        ],
      }),
      prisma.vwVentaPorSegmentoMes.count({ where }),
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

  async getVentaPorSegmentoMesById(id: number) {
    const registro = await prisma.vwVentaPorSegmentoMes.findUnique({
      where: { id },
    });

    if (!registro) {
      throw new NotFoundError('Registro de venta por segmento no encontrado');
    }

    return registro;
  }

  // ============ VENTA POR LINEA MES ============
  
  async getVentaPorLineaMes(filters?: {
    idLinea?: number;
    periodoMes?: string;
    limit?: number;
    offset?: number;
  }) {
    const { idLinea, periodoMes, limit = 100, offset = 0 } = filters || {};
    
    const where: any = {};
    if (idLinea) where.idLinea = idLinea;
    if (periodoMes) where.periodoMes = periodoMes;

    const [registros, total] = await Promise.all([
      prisma.vwVentaPorLineaMes.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [
          { periodoMes: 'desc' },
          { idLinea: 'asc' },
        ],
      }),
      prisma.vwVentaPorLineaMes.count({ where }),
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

  async getVentaPorLineaMesById(id: number) {
    const registro = await prisma.vwVentaPorLineaMes.findUnique({
      where: { id },
    });

    if (!registro) {
      throw new NotFoundError('Registro de venta por línea no encontrado');
    }

    return registro;
  }
}
