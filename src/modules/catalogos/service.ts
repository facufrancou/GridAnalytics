import { prisma } from '../../infra/db.js';
import { NotFoundError, ConflictError } from '../../middlewares/error.js';
import type {
  BocaCompraInput,
  SegmentoInput,
  LineaInput,
  TipoPosteInput,
  UsuarioInput,
  UpdateBocaCompraInput,
  UpdateSegmentoInput,
  UpdateLineaInput,
  UpdateTipoPosteInput,
  UpdateUsuarioInput,
  CatalogoQuery,
  UsuarioQuery,
} from './schemas.js';

export class CatalogosService {
  
  // ============ BOCAS DE COMPRA ============
  
  async getBocasCompra(query: CatalogoQuery) {
    const { activo, limit, offset, search } = query;
    
    const where = {
      ...(activo !== 'all' && { activo: activo === 'true' }),
      ...(search && {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' as const } },
          { proveedor: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [bocas, total] = await Promise.all([
      prisma.catBocasCompra.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { nombre: 'asc' },
      }),
      prisma.catBocasCompra.count({ where }),
    ]);

    return {
      data: bocas,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async getBocaCompraById(id: number) {
    const boca = await prisma.catBocasCompra.findUnique({
      where: { id },
    });

    if (!boca) {
      throw new NotFoundError('Boca de compra no encontrada');
    }

    return boca;
  }

  async createBocaCompra(data: BocaCompraInput) {
    return prisma.catBocasCompra.create({
      data,
    });
  }

  async updateBocaCompra(id: number, data: UpdateBocaCompraInput) {
    const existing = await this.getBocaCompraById(id);
    
    return prisma.catBocasCompra.update({
      where: { id },
      data,
    });
  }

  async deleteBocaCompra(id: number) {
    const existing = await this.getBocaCompraById(id);
    
    // Verificar si tiene mediciones asociadas
    const medicionesCount = await prisma.medicionesCompra.count({
      where: { idBoca: id },
    });

    if (medicionesCount > 0) {
      throw new ConflictError('No se puede eliminar: tiene mediciones asociadas');
    }

    return prisma.catBocasCompra.delete({
      where: { id },
    });
  }

  // ============ SEGMENTOS ============
  
  async getSegmentos(query: CatalogoQuery) {
    const { activo, limit, offset, search } = query;
    
    const where = {
      ...(activo !== 'all' && { activo: activo === 'true' }),
      ...(search && {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' as const } },
          { codigo: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [segmentos, total] = await Promise.all([
      prisma.catSegmentos.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { nombre: 'asc' },
      }),
      prisma.catSegmentos.count({ where }),
    ]);

    return {
      data: segmentos,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async getSegmentoById(id: number) {
    const segmento = await prisma.catSegmentos.findUnique({
      where: { id },
    });

    if (!segmento) {
      throw new NotFoundError('Segmento no encontrado');
    }

    return segmento;
  }

  async createSegmento(data: SegmentoInput) {
    try {
      return await prisma.catSegmentos.create({
        data,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictError('El nombre o código del segmento ya existe');
      }
      throw error;
    }
  }

  async updateSegmento(id: number, data: UpdateSegmentoInput) {
    const existing = await this.getSegmentoById(id);
    
    try {
      return await prisma.catSegmentos.update({
        where: { id },
        data,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictError('El nombre o código del segmento ya existe');
      }
      throw error;
    }
  }

  async deleteSegmento(id: number) {
    const existing = await this.getSegmentoById(id);
    
    // Verificar si tiene usuarios asociados
    const usuariosCount = await prisma.usuarios.count({
      where: { idSegmento: id },
    });

    if (usuariosCount > 0) {
      throw new ConflictError('No se puede eliminar: tiene usuarios asociados');
    }

    return prisma.catSegmentos.delete({
      where: { id },
    });
  }

  // ============ LÍNEAS ============
  
  async getLineas(query: CatalogoQuery) {
    const { activo, limit, offset, search } = query;
    
    const where = {
      ...(activo !== 'all' && { activo: activo === 'true' }),
      ...(search && {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' as const } },
          { tension: { contains: search, mode: 'insensitive' as const } },
          { zona: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [lineas, total] = await Promise.all([
      prisma.catLineas.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { nombre: 'asc' },
      }),
      prisma.catLineas.count({ where }),
    ]);

    return {
      data: lineas,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async getLineaById(id: number) {
    const linea = await prisma.catLineas.findUnique({
      where: { id },
    });

    if (!linea) {
      throw new NotFoundError('Línea no encontrada');
    }

    return linea;
  }

  async createLinea(data: LineaInput) {
    return prisma.catLineas.create({
      data,
    });
  }

  async updateLinea(id: number, data: UpdateLineaInput) {
    const existing = await this.getLineaById(id);
    
    return prisma.catLineas.update({
      where: { id },
      data,
    });
  }

  async deleteLinea(id: number) {
    const existing = await this.getLineaById(id);
    
    // Verificar si tiene usuarios o postes asociados
    const [usuariosCount, postesCount] = await Promise.all([
      prisma.usuarios.count({ where: { idLinea: id } }),
      prisma.relevamientoPostes.count({ where: { idLinea: id } }),
    ]);

    if (usuariosCount > 0 || postesCount > 0) {
      throw new ConflictError('No se puede eliminar: tiene usuarios o postes asociados');
    }

    return prisma.catLineas.delete({
      where: { id },
    });
  }

  // ============ TIPOS DE POSTE ============
  
  async getTiposPoste(query: CatalogoQuery) {
    const { activo, limit, offset, search } = query;
    
    const where = {
      ...(activo !== 'all' && { activo: activo === 'true' }),
      ...(search && {
        nombre: { contains: search, mode: 'insensitive' as const },
      }),
    };

    const [tipos, total] = await Promise.all([
      prisma.catTiposPoste.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { nombre: 'asc' },
      }),
      prisma.catTiposPoste.count({ where }),
    ]);

    return {
      data: tipos,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async getTipoPosteById(id: number) {
    const tipo = await prisma.catTiposPoste.findUnique({
      where: { id },
    });

    if (!tipo) {
      throw new NotFoundError('Tipo de poste no encontrado');
    }

    return tipo;
  }

  async createTipoPoste(data: TipoPosteInput) {
    try {
      return await prisma.catTiposPoste.create({
        data,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictError('El nombre del tipo de poste ya existe');
      }
      throw error;
    }
  }

  async updateTipoPoste(id: number, data: UpdateTipoPosteInput) {
    const existing = await this.getTipoPosteById(id);
    
    try {
      return await prisma.catTiposPoste.update({
        where: { id },
        data,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictError('El nombre del tipo de poste ya existe');
      }
      throw error;
    }
  }

  async deleteTipoPoste(id: number) {
    const existing = await this.getTipoPosteById(id);
    
    // Verificar si tiene postes asociados
    const postesCount = await prisma.relevamientoPostes.count({
      where: { idPosteType: id },
    });

    if (postesCount > 0) {
      throw new ConflictError('No se puede eliminar: tiene postes asociados');
    }

    return prisma.catTiposPoste.delete({
      where: { id },
    });
  }

  // ============ USUARIOS ============
  
  async getUsuarios(query: UsuarioQuery) {
    const { activo, limit, offset, search, idSegmento, idLinea } = query;
    
    const where = {
      ...(activo !== 'all' && { activo: activo === 'true' }),
      ...(idSegmento && { idSegmento }),
      ...(idLinea && { idLinea }),
      ...(search && {
        OR: [
          { nroSuministro: { contains: search, mode: 'insensitive' as const } },
          { nombre: { contains: search, mode: 'insensitive' as const } },
          { direccion: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [usuarios, total] = await Promise.all([
      prisma.usuarios.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          segmento: true,
          linea: true,
        },
        orderBy: { nroSuministro: 'asc' },
      }),
      prisma.usuarios.count({ where }),
    ]);

    return {
      data: usuarios,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async getUsuarioById(id: number) {
    const usuario = await prisma.usuarios.findUnique({
      where: { id },
      include: {
        segmento: true,
        linea: true,
      },
    });

    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return usuario;
  }

  async getUsuarioByNroSuministro(nroSuministro: string) {
    const usuario = await prisma.usuarios.findUnique({
      where: { nroSuministro },
      include: {
        segmento: true,
        linea: true,
      },
    });

    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return usuario;
  }

  async createUsuario(data: UsuarioInput) {
    // Verificar que el segmento existe
    await this.getSegmentoById(data.idSegmento);
    
    // Verificar que la línea existe (si se proporciona)
    if (data.idLinea) {
      await this.getLineaById(data.idLinea);
    }

    try {
      return await prisma.usuarios.create({
        data,
        include: {
          segmento: true,
          linea: true,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictError('El número de suministro ya existe');
      }
      throw error;
    }
  }

  async updateUsuario(id: number, data: UpdateUsuarioInput) {
    const existing = await this.getUsuarioById(id);
    
    // Verificar que el segmento existe (si se está actualizando)
    if (data.idSegmento) {
      await this.getSegmentoById(data.idSegmento);
    }
    
    // Verificar que la línea existe (si se está actualizando)
    if (data.idLinea) {
      await this.getLineaById(data.idLinea);
    }

    try {
      return await prisma.usuarios.update({
        where: { id },
        data,
        include: {
          segmento: true,
          linea: true,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictError('El número de suministro ya existe');
      }
      throw error;
    }
  }

  async deleteUsuario(id: number) {
    const existing = await this.getUsuarioById(id);
    
    // Verificar si tiene mediciones asociadas
    const medicionesCount = await prisma.medicionesVenta.count({
      where: { idUsuario: id },
    });

    if (medicionesCount > 0) {
      throw new ConflictError('No se puede eliminar: tiene mediciones asociadas');
    }

    return prisma.usuarios.delete({
      where: { id },
    });
  }
}