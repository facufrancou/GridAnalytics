import type { FastifyRequest, FastifyReply } from 'fastify';
import { EtlService } from './service.js';
import {
  etlCompraSchema,
  etlVentaCsvSchema,
  etlUsuariosCsvSchema,
  etlLineasPostesCsvSchema,
  etlLogsQuerySchema,
} from './schemas.js';
import { ValidationError } from '../../middlewares/error.js';
import { generateContentHash, parseCSV } from '../../utils/csv.js';

export class EtlController {
  private etlService: EtlService;

  constructor() {
    this.etlService = new EtlService();
  }

  // ============ ETL COMPRA (PDF procesado por n8n) ============
  
  async processCompraFromPdf(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const data = etlCompraSchema.parse(request.body);
      const result = await this.etlService.processCompraFromPdf(data);
      
      await reply.status(result.success ? 200 : 400).send(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Datos de compra inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  // ============ ETL VENTA (CSV) ============
  
  async processVentaFromCsv(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // El CSV puede venir como archivo multipart o como JSON con datos ya parseados
      let csvData: any;
      
      if (request.headers['content-type']?.includes('multipart/form-data')) {
        // Procesamiento de archivo CSV
        const data = await request.file();
        if (!data) {
          await reply.status(400).send({
            error: true,
            message: 'Archivo CSV requerido',
          });
          return;
        }

        const csvContent = await data.file.readFile('utf8');
        const hashDoc = generateContentHash(csvContent);
        
        // Parsear CSV
        const registros = parseCSV(csvContent);
        
        csvData = {
          archivo: data.filename,
          registros,
          hashDoc,
        };
      } else {
        // Datos ya parseados (desde n8n)
        csvData = request.body;
      }

      const validatedData = etlVentaCsvSchema.parse(csvData);
      const result = await this.etlService.processVentaFromCsv(validatedData);
      
      await reply.status(result.success ? 200 : 400).send(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Datos de venta CSV inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  // ============ ETL USUARIOS (CSV) ============
  
  async processUsuariosFromCsv(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      let csvData: any;
      
      if (request.headers['content-type']?.includes('multipart/form-data')) {
        const data = await request.file();
        if (!data) {
          await reply.status(400).send({
            error: true,
            message: 'Archivo CSV requerido',
          });
          return;
        }

        const csvContent = await data.file.readFile('utf8');
        const hashDoc = generateContentHash(csvContent);
        
        const registros = parseCSV(csvContent);
        
        csvData = {
          archivo: data.filename,
          registros,
          hashDoc,
        };
      } else {
        csvData = request.body;
      }

      const validatedData = etlUsuariosCsvSchema.parse(csvData);
      const result = await this.etlService.processUsuariosFromCsv(validatedData);
      
      await reply.status(result.success ? 200 : 400).send(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Datos de usuarios CSV inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  // ============ ETL LÍNEAS Y POSTES (CSV) ============
  
  async processLineasPostesFromCsv(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      let csvData: any;
      
      if (request.headers['content-type']?.includes('multipart/form-data')) {
        const data = await request.file();
        if (!data) {
          await reply.status(400).send({
            error: true,
            message: 'Archivo CSV requerido',
          });
          return;
        }

        const csvContent = await data.file.readFile('utf8');
        const hashDoc = generateContentHash(csvContent);
        
        // El CSV puede contener líneas y postes en secciones separadas
        // o ser dos archivos diferentes. Aquí asumimos un formato específico.
        const allData = parseCSV(csvContent);
        
        // Separar líneas y postes basado en la presencia de ciertos campos
        const lineas = allData.filter((row: any) => row.tipo === 'linea' || !row.lineaNombre);
        const postes = allData.filter((row: any) => row.tipo === 'poste' || row.lineaNombre);
        
        csvData = {
          archivo: data.filename,
          lineas,
          postes,
          hashDoc,
        };
      } else {
        csvData = request.body;
      }

      const validatedData = etlLineasPostesCsvSchema.parse(csvData);
      const result = await this.etlService.processLineasPostesFromCsv(validatedData);
      
      await reply.status(result.success ? 200 : 400).send(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new ValidationError('Datos de líneas/postes CSV inválidos', (error as any).errors);
      }
      throw error;
    }
  }

  // ============ CONSULTAS Y LOGS ETL ============
  
  async getEtlLogs(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const query = etlLogsQuerySchema.parse(request.query);
      const result = await this.etlService.getEtlLogs(query);
      
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

  async getEtlStats(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.etlService.getEtlStats();
    
    await reply.status(200).send({
      success: true,
      data: result,
    });
  }

  // ============ ENDPOINT DE TESTING/VALIDACIÓN ============
  
  async validateCsv(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const data = await request.file();
      if (!data) {
        await reply.status(400).send({
          error: true,
          message: 'Archivo CSV requerido',
        });
        return;
      }

      const csvContent = await data.file.readFile('utf8');
      
      try {
        const parsed = parseCSV(csvContent);
        
        await reply.status(200).send({
          success: true,
          message: 'CSV válido',
          data: {
            fileName: data.filename,
            recordCount: parsed.length,
            columns: parsed.length > 0 ? Object.keys(parsed[0]!) : [],
            sample: parsed.slice(0, 3), // Primeros 3 registros como muestra
          },
        });
      } catch (parseError) {
        await reply.status(400).send({
          error: true,
          message: 'Error parsing CSV',
          details: parseError instanceof Error ? parseError.message : 'Unknown error',
        });
      }
    } catch (error) {
      throw error;
    }
  }

  // ============ UTILIDADES PARA n8n ============
  
  async getProcessingStatus(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { hashDoc } = request.params as { hashDoc: string };
    
    const existingRecord = await this.etlService.getEtlLogs({
      limit: 1,
      offset: 0,
    });
    
    // Buscar por hash en los logs
    const found = existingRecord.data.find(log => log.hashDoc === hashDoc);
    
    if (found) {
      await reply.status(200).send({
        success: true,
        data: {
          processed: true,
          processedAt: found.createdAt,
          fuente: found.fuente,
          archivo: found.archivo,
        },
      });
    } else {
      await reply.status(404).send({
        success: false,
        message: 'Documento no encontrado en el historial de procesamiento',
      });
    }
  }
}