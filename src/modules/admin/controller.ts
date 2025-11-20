import type { FastifyRequest, FastifyReply } from 'fastify';
import { AdminService } from './service.js';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  // ============ API KEYS ============
  
  async getApiKeys(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = request.query as any;
    
    const filters: any = {
      limit: query.limit ? parseInt(query.limit, 10) : 100,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    };
    
    if (query.activo !== undefined) {
      filters.activo = query.activo === 'true';
    }

    const result = await this.adminService.getApiKeys(filters);
    
    await reply.status(200).send({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }

  async getApiKeyById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const keyId = parseInt(id, 10);
    
    if (isNaN(keyId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID inválido',
      });
      return;
    }

    const result = await this.adminService.getApiKeyById(keyId);
    
    await reply.status(200).send({
      success: true,
      data: result,
    });
  }

  // ============ ETL FACTURAS RAW ============
  
  async getEtlFacturasRaw(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = request.query as any;
    
    const filters = {
      fuente: query.fuente,
      hashDoc: query.hashDoc,
      limit: query.limit ? parseInt(query.limit, 10) : 100,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    };

    const result = await this.adminService.getEtlFacturasRaw(filters);
    
    await reply.status(200).send({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }

  async getEtlFacturaRawById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const registroId = parseInt(id, 10);
    
    if (isNaN(registroId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID inválido',
      });
      return;
    }

    const result = await this.adminService.getEtlFacturaRawById(registroId);
    
    await reply.status(200).send({
      success: true,
      data: result,
    });
  }

  // ============ ETL MATCH FACTURAS ============
  
  async getEtlMatchFacturas(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = request.query as any;
    
    const filters: any = {
      entidadDestino: query.entidadDestino,
      limit: query.limit ? parseInt(query.limit, 10) : 100,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    };
    
    if (query.procesado !== undefined) {
      filters.procesado = query.procesado === 'true';
    }

    const result = await this.adminService.getEtlMatchFacturas(filters);
    
    await reply.status(200).send({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }

  async getEtlMatchFacturaById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const registroId = parseInt(id, 10);
    
    if (isNaN(registroId)) {
      await reply.status(400).send({
        error: true,
        message: 'ID inválido',
      });
      return;
    }

    const result = await this.adminService.getEtlMatchFacturaById(registroId);
    
    await reply.status(200).send({
      success: true,
      data: result,
    });
  }
}
