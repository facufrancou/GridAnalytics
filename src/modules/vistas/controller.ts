import type { FastifyRequest, FastifyReply } from 'fastify';
import { VistasService } from './service.js';

export class VistasController {
  private vistasService: VistasService;

  constructor() {
    this.vistasService = new VistasService();
  }

  // ============ VENTA MENSUALIZADA ============
  
  async getVentaMensualizada(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = request.query as any;
    
    const idUsuario = query.idUsuario ? parseInt(query.idUsuario, 10) : undefined;
    const idSegmento = query.idSegmento ? parseInt(query.idSegmento, 10) : undefined;
    const idLinea = query.idLinea ? parseInt(query.idLinea, 10) : undefined;
    
    const filters: any = {
      periodoMes: query.periodoMes,
      limit: query.limit ? parseInt(query.limit, 10) : 100,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    };
    
    if (idUsuario !== undefined) filters.idUsuario = idUsuario;
    if (idSegmento !== undefined) filters.idSegmento = idSegmento;
    if (idLinea !== undefined) filters.idLinea = idLinea;

    const result = await this.vistasService.getVentaMensualizada(filters);
    
    await reply.status(200).send({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }

  async getVentaMensualizadaById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const registroId = parseInt(id, 10);
    
    if (isNaN(registroId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID inválido',
      });
      return;
    }

    const result = await this.vistasService.getVentaMensualizadaById(registroId);
    
    await reply.status(200).send({
      success: true,
      data: result,
    });
  }

  // ============ BALANCE BOCA MES ============
  
  async getBalanceBocaMes(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = request.query as any;
    
    const idBoca = query.idBoca ? parseInt(query.idBoca, 10) : undefined;
    
    const filters: any = {
      periodoMes: query.periodoMes,
      limit: query.limit ? parseInt(query.limit, 10) : 100,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    };
    
    if (idBoca !== undefined) filters.idBoca = idBoca;

    const result = await this.vistasService.getBalanceBocaMes(filters);
    
    await reply.status(200).send({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }

  async getBalanceBocaMesById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const registroId = parseInt(id, 10);
    
    if (isNaN(registroId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID inválido',
      });
      return;
    }

    const result = await this.vistasService.getBalanceBocaMesById(registroId);
    
    await reply.status(200).send({
      success: true,
      data: result,
    });
  }

  // ============ VENTA POR SEGMENTO MES ============
  
  async getVentaPorSegmentoMes(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = request.query as any;
    
    const idSegmento = query.idSegmento ? parseInt(query.idSegmento, 10) : undefined;
    
    const filters: any = {
      periodoMes: query.periodoMes,
      limit: query.limit ? parseInt(query.limit, 10) : 100,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    };
    
    if (idSegmento !== undefined) filters.idSegmento = idSegmento;

    const result = await this.vistasService.getVentaPorSegmentoMes(filters);
    
    await reply.status(200).send({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }

  async getVentaPorSegmentoMesById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const registroId = parseInt(id, 10);
    
    if (isNaN(registroId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID inválido',
      });
      return;
    }

    const result = await this.vistasService.getVentaPorSegmentoMesById(registroId);
    
    await reply.status(200).send({
      success: true,
      data: result,
    });
  }

  // ============ VENTA POR LINEA MES ============
  
  async getVentaPorLineaMes(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = request.query as any;
    
    const idLinea = query.idLinea ? parseInt(query.idLinea, 10) : undefined;
    
    const filters: any = {
      periodoMes: query.periodoMes,
      limit: query.limit ? parseInt(query.limit, 10) : 100,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    };
    
    if (idLinea !== undefined) filters.idLinea = idLinea;

    const result = await this.vistasService.getVentaPorLineaMes(filters);
    
    await reply.status(200).send({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }

  async getVentaPorLineaMesById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const registroId = parseInt(id, 10);
    
    if (isNaN(registroId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID inválido',
      });
      return;
    }

    const result = await this.vistasService.getVentaPorLineaMesById(registroId);
    
    await reply.status(200).send({
      success: true,
      data: result,
    });
  }
}
