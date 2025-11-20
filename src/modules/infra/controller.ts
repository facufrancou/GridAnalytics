import type { FastifyRequest, FastifyReply } from 'fastify';
import { InfraService } from './service.js';

export class InfraController {
  private infraService: InfraService;

  constructor() {
    this.infraService = new InfraService();
  }

  // ============ RELEVAMIENTO POSTES ============
  
  async getRelevamientoPostes(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = request.query as any;
    
    const idLinea = query.idLinea ? parseInt(query.idLinea, 10) : undefined;
    const idPosteType = query.idPosteType ? parseInt(query.idPosteType, 10) : undefined;
    
    const filters: any = {
      estado: query.estado,
      limit: query.limit ? parseInt(query.limit, 10) : 100,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    };
    
    if (idLinea !== undefined) filters.idLinea = idLinea;
    if (idPosteType !== undefined) filters.idPosteType = idPosteType;

    const result = await this.infraService.getRelevamientoPostes(filters);
    
    await reply.status(200).send({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }

  async getRelevamientoPosteById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const posteId = parseInt(id, 10);
    
    if (isNaN(posteId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID inválido',
      });
      return;
    }

    const result = await this.infraService.getRelevamientoPosteById(posteId);
    
    await reply.status(200).send({
      success: true,
      data: result,
    });
  }

  // ============ DISTRIBUIDORES ============
  
  async getDistribuidores(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = request.query as any;
    
    const filters = {
      limit: query.limit ? parseInt(query.limit, 10) : 100,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    };

    const result = await this.infraService.getDistribuidores(filters);
    
    await reply.status(200).send({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }

  async getDistribuidorById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const distribuidorId = parseInt(id, 10);
    
    if (isNaN(distribuidorId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID inválido',
      });
      return;
    }

    const result = await this.infraService.getDistribuidorById(distribuidorId);
    
    await reply.status(200).send({
      success: true,
      data: result,
    });
  }

  // ============ MAP PERIODOS ============
  
  async getMapPeriodos(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = request.query as any;
    
    const filters = {
      tipo: query.tipo,
      limit: query.limit ? parseInt(query.limit, 10) : 100,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    };

    const result = await this.infraService.getMapPeriodos(filters);
    
    await reply.status(200).send({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }

  async getMapPeriodoById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const periodoId = parseInt(id, 10);
    
    if (isNaN(periodoId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID inválido',
      });
      return;
    }

    const result = await this.infraService.getMapPeriodoById(periodoId);
    
    await reply.status(200).send({
      success: true,
      data: result,
    });
  }

  async getMapPeriodoByClave(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { clave } = request.params as { clave: string };

    const result = await this.infraService.getMapPeriodoByClave(clave);
    
    await reply.status(200).send({
      success: true,
      data: result,
    });
  }
}
