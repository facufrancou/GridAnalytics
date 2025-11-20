import type { FastifyRequest, FastifyReply } from 'fastify';
import { CatalogosService } from './service.js';
import {
  bocaCompraSchema,
  updateBocaCompraSchema,
  segmentoSchema,
  updateSegmentoSchema,
  lineaSchema,
  updateLineaSchema,
  tipoPosteSchema,
  updateTipoPosteSchema,
  usuarioSchema,
  updateUsuarioSchema,
  catalogoQuerySchema,
  usuarioQuerySchema,
} from './schemas.js';
import { ValidationError } from '../../middlewares/error.js';

export class CatalogosController {
  private catalogosService: CatalogosService;

  constructor() {
    this.catalogosService = new CatalogosService();
  }

  // ============ BOCAS DE COMPRA ============
  
  async getBocasCompra(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const query = catalogoQuerySchema.parse(request.query);
      const result = await this.catalogosService.getBocasCompra(query);
      
      await reply.status(200).send({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Parámetros de consulta inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  async getBocaCompraById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const bocaId = parseInt(id, 10);
    
    if (isNaN(bocaId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID de boca inválido',
      });
      return;
    }

    const result = await this.catalogosService.getBocaCompraById(bocaId);
    
    await reply.status(200).send({
      success: true,
      data: result,
    });
  }

  async createBocaCompra(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const data = bocaCompraSchema.parse(request.body);
      const result = await this.catalogosService.createBocaCompra(data);
      
      await reply.status(201).send({
        success: true,
        message: 'Boca de compra creada exitosamente',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Datos de boca de compra inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  async updateBocaCompra(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const bocaId = parseInt(id, 10);
    
    if (isNaN(bocaId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID de boca inválido',
      });
      return;
    }

    try {
      const data = updateBocaCompraSchema.parse(request.body);
      const result = await this.catalogosService.updateBocaCompra(bocaId, data);
      
      await reply.status(200).send({
        success: true,
        message: 'Boca de compra actualizada exitosamente',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Datos de actualización inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  async deleteBocaCompra(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const bocaId = parseInt(id, 10);
    
    if (isNaN(bocaId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID de boca inválido',
      });
      return;
    }

    await this.catalogosService.deleteBocaCompra(bocaId);
    
    await reply.status(200).send({
      success: true,
      message: 'Boca de compra eliminada exitosamente',
    });
  }

  // ============ SEGMENTOS ============
  
  async getSegmentos(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const query = catalogoQuerySchema.parse(request.query);
      const result = await this.catalogosService.getSegmentos(query);
      
      await reply.status(200).send({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Parámetros de consulta inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  async getSegmentoById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const segmentoId = parseInt(id, 10);
    
    if (isNaN(segmentoId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID de segmento inválido',
      });
      return;
    }

    const result = await this.catalogosService.getSegmentoById(segmentoId);
    
    await reply.status(200).send({
      success: true,
      data: result,
    });
  }

  async createSegmento(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const data = segmentoSchema.parse(request.body);
      const result = await this.catalogosService.createSegmento(data);
      
      await reply.status(201).send({
        success: true,
        message: 'Segmento creado exitosamente',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Datos de segmento inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  async updateSegmento(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const segmentoId = parseInt(id, 10);
    
    if (isNaN(segmentoId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID de segmento inválido',
      });
      return;
    }

    try {
      const data = updateSegmentoSchema.parse(request.body);
      const result = await this.catalogosService.updateSegmento(segmentoId, data);
      
      await reply.status(200).send({
        success: true,
        message: 'Segmento actualizado exitosamente',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Datos de actualización inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  async deleteSegmento(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const segmentoId = parseInt(id, 10);
    
    if (isNaN(segmentoId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID de segmento inválido',
      });
      return;
    }

    await this.catalogosService.deleteSegmento(segmentoId);
    
    await reply.status(200).send({
      success: true,
      message: 'Segmento eliminado exitosamente',
    });
  }

  // ============ LÍNEAS ============
  
  async getLineas(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const query = catalogoQuerySchema.parse(request.query);
      const result = await this.catalogosService.getLineas(query);
      
      await reply.status(200).send({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Parámetros de consulta inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  async getLineaById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const lineaId = parseInt(id, 10);
    
    if (isNaN(lineaId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID de línea inválido',
      });
      return;
    }

    const result = await this.catalogosService.getLineaById(lineaId);
    
    await reply.status(200).send({
      success: true,
      data: result,
    });
  }

  async createLinea(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const data = lineaSchema.parse(request.body);
      const result = await this.catalogosService.createLinea(data);
      
      await reply.status(201).send({
        success: true,
        message: 'Línea creada exitosamente',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Datos de línea inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  async updateLinea(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const lineaId = parseInt(id, 10);
    
    if (isNaN(lineaId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID de línea inválido',
      });
      return;
    }

    try {
      const data = updateLineaSchema.parse(request.body);
      const result = await this.catalogosService.updateLinea(lineaId, data);
      
      await reply.status(200).send({
        success: true,
        message: 'Línea actualizada exitosamente',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Datos de actualización inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  async deleteLinea(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const lineaId = parseInt(id, 10);
    
    if (isNaN(lineaId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID de línea inválido',
      });
      return;
    }

    await this.catalogosService.deleteLinea(lineaId);
    
    await reply.status(200).send({
      success: true,
      message: 'Línea eliminada exitosamente',
    });
  }

  // ============ TIPOS DE POSTE ============
  
  async getTiposPoste(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const query = catalogoQuerySchema.parse(request.query);
      const result = await this.catalogosService.getTiposPoste(query);
      
      await reply.status(200).send({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Parámetros de consulta inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  async getTipoPosteById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const tipoId = parseInt(id, 10);
    
    if (isNaN(tipoId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID de tipo de poste inválido',
      });
      return;
    }

    const result = await this.catalogosService.getTipoPosteById(tipoId);
    
    await reply.status(200).send({
      success: true,
      data: result,
    });
  }

  async createTipoPoste(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const data = tipoPosteSchema.parse(request.body);
      const result = await this.catalogosService.createTipoPoste(data);
      
      await reply.status(201).send({
        success: true,
        message: 'Tipo de poste creado exitosamente',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Datos de tipo de poste inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  async updateTipoPoste(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const tipoId = parseInt(id, 10);
    
    if (isNaN(tipoId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID de tipo de poste inválido',
      });
      return;
    }

    try {
      const data = updateTipoPosteSchema.parse(request.body);
      const result = await this.catalogosService.updateTipoPoste(tipoId, data);
      
      await reply.status(200).send({
        success: true,
        message: 'Tipo de poste actualizado exitosamente',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Datos de actualización inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  async deleteTipoPoste(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const tipoId = parseInt(id, 10);
    
    if (isNaN(tipoId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID de tipo de poste inválido',
      });
      return;
    }

    await this.catalogosService.deleteTipoPoste(tipoId);
    
    await reply.status(200).send({
      success: true,
      message: 'Tipo de poste eliminado exitosamente',
    });
  }

  // ============ USUARIOS ============
  
  async getUsuarios(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const query = usuarioQuerySchema.parse(request.query);
      const result = await this.catalogosService.getUsuarios(query);
      
      await reply.status(200).send({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Parámetros de consulta inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  async getUsuarioById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const usuarioId = parseInt(id, 10);
    
    if (isNaN(usuarioId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID de usuario inválido',
      });
      return;
    }

    const result = await this.catalogosService.getUsuarioById(usuarioId);
    
    await reply.status(200).send({
      success: true,
      data: result,
    });
  }

  async getUsuarioByNroSuministro(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { nroSuministro } = request.params as { nroSuministro: string };
    
    const result = await this.catalogosService.getUsuarioByNroSuministro(nroSuministro);
    
    await reply.status(200).send({
      success: true,
      data: result,
    });
  }

  async createUsuario(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const data = usuarioSchema.parse(request.body);
      const result = await this.catalogosService.createUsuario(data);
      
      await reply.status(201).send({
        success: true,
        message: 'Usuario creado exitosamente',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Datos de usuario inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  async updateUsuario(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const usuarioId = parseInt(id, 10);
    
    if (isNaN(usuarioId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID de usuario inválido',
      });
      return;
    }

    try {
      const data = updateUsuarioSchema.parse(request.body);
      const result = await this.catalogosService.updateUsuario(usuarioId, data);
      
      await reply.status(200).send({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Datos de actualización inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  async deleteUsuario(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const usuarioId = parseInt(id, 10);
    
    if (isNaN(usuarioId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID de usuario inválido',
      });
      return;
    }

    await this.catalogosService.deleteUsuario(usuarioId);
    
    await reply.status(200).send({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  }
}