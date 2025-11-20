import type { FastifyRequest, FastifyReply } from 'fastify';
import { MedicionesService } from './service.js';

export class MedicionesController {
  private medicionesService: MedicionesService;

  constructor() {
    this.medicionesService = new MedicionesService();
  }

  // ============ MEDICIONES DE COMPRA ============
  
  async getMedicionesCompra(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = request.query as any;
    
    const idBoca = query.idBoca ? parseInt(query.idBoca, 10) : undefined;
    const filters: any = {
      periodoMes: query.periodoMes,
      limit: query.limit ? parseInt(query.limit, 10) : 100,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    };
    
    if (idBoca !== undefined) {
      filters.idBoca = idBoca;
    }

    const result = await this.medicionesService.getMedicionesCompra(filters);
    
    await reply.status(200).send({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }

  async getMedicionCompraById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const medicionId = parseInt(id, 10);
    
    if (isNaN(medicionId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID de medición inválido',
      });
      return;
    }

    const result = await this.medicionesService.getMedicionCompraById(medicionId);
    
    await reply.status(200).send({
      success: true,
      data: result,
    });
  }

  async getMedicionesCompraPorBoca(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { idBoca } = request.params as { idBoca: string };
    const bocaId = parseInt(idBoca, 10);
    
    if (isNaN(bocaId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID de boca inválido',
      });
      return;
    }

    const query = request.query as any;
    const filters = {
      periodoInicio: query.periodoInicio,
      periodoFin: query.periodoFin,
      limit: query.limit ? parseInt(query.limit, 10) : 100,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    };

    const result = await this.medicionesService.getMedicionesCompraPorBoca(bocaId, filters);
    
    await reply.status(200).send({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }

  // ============ MEDICIONES DE VENTA ============
  
  async getMedicionesVenta(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = request.query as any;
    
    const idUsuario = query.idUsuario ? parseInt(query.idUsuario, 10) : undefined;
    const filters: any = {
      periodoBimestre: query.periodoBimestre,
      limit: query.limit ? parseInt(query.limit, 10) : 100,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    };
    
    if (idUsuario !== undefined) {
      filters.idUsuario = idUsuario;
    }

    const result = await this.medicionesService.getMedicionesVenta(filters);
    
    await reply.status(200).send({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }

  async getMedicionVentaById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const medicionId = parseInt(id, 10);
    
    if (isNaN(medicionId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID de medición inválido',
      });
      return;
    }

    const result = await this.medicionesService.getMedicionVentaById(medicionId);
    
    await reply.status(200).send({
      success: true,
      data: result,
    });
  }

  async getMedicionesVentaPorUsuario(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { idUsuario } = request.params as { idUsuario: string };
    const usuarioId = parseInt(idUsuario, 10);
    
    if (isNaN(usuarioId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID de usuario inválido',
      });
      return;
    }

    const query = request.query as any;
    const filters = {
      periodoInicio: query.periodoInicio,
      periodoFin: query.periodoFin,
      limit: query.limit ? parseInt(query.limit, 10) : 100,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    };

    const result = await this.medicionesService.getMedicionesVentaPorUsuario(usuarioId, filters);
    
    await reply.status(200).send({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }

  async getMedicionesVentaPorSuministro(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { nroSuministro } = request.params as { nroSuministro: string };

    const query = request.query as any;
    const filters = {
      periodoInicio: query.periodoInicio,
      periodoFin: query.periodoFin,
      limit: query.limit ? parseInt(query.limit, 10) : 100,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    };

    const result = await this.medicionesService.getMedicionesVentaPorSuministro(nroSuministro, filters);
    
    await reply.status(200).send({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
}
