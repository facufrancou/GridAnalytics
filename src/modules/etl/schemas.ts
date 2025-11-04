import { z } from 'zod';

// Esquemas para ETL de compra (PDF procesado por n8n)
export const etlCompraSchema = z.object({
  idBoca: z.number().int().positive('ID de boca debe ser positivo'),
  periodoMes: z.string().regex(/^\d{4}-\d{2}$/, 'Formato de período debe ser YYYY-MM'),
  kwhComprados: z.number().positive('kWh comprados debe ser positivo'),
  importe: z.number().positive('Importe debe ser positivo'),
  fpPromedio: z.number().min(0).max(1, 'Factor de potencia debe estar entre 0 y 1').optional(),
  demandaMaxKw: z.number().positive('Demanda máxima debe ser positiva').optional(),
  fechaFactura: z.string().datetime('Fecha de factura inválida').optional(),
  observaciones: z.string().max(1000).optional(),
  // Metadatos para trazabilidad
  archivo: z.string().min(1, 'Nombre de archivo es requerido'),
  hashDoc: z.string().min(1, 'Hash del documento es requerido'),
  metadatos: z.record(z.any()).optional(), // JSON adicional del procesamiento
});

// Esquemas para ETL de venta (CSV)
export const etlVentaSchema = z.object({
  nroSuministro: z.string().min(3, 'Número de suministro debe tener al menos 3 caracteres').max(20),
  periodoBimestre: z.string().regex(/^\d{4}-\d{2}_\d{4}-\d{2}$/, 'Formato de período debe ser YYYY-MM_YYYY-MM'),
  kwhVendidosBim: z.number().positive('kWh vendidos debe ser positivo'),
  importe: z.number().positive('Importe debe ser positivo'),
  lectIni: z.number().min(0, 'Lectura inicial debe ser positiva'),
  lectFin: z.number().min(0, 'Lectura final debe ser positiva'),
  fechaFactura: z.string().datetime('Fecha de factura inválida').optional(),
  observaciones: z.string().max(1000).optional(),
});

// Esquema para CSV de ventas (array de registros)
export const etlVentaCsvSchema = z.object({
  archivo: z.string().min(1, 'Nombre de archivo es requerido'),
  registros: z.array(etlVentaSchema).min(1, 'Al menos un registro es requerido'),
  hashDoc: z.string().min(1, 'Hash del archivo es requerido'),
});

// Esquemas para ETL de usuarios (CSV)
export const etlUsuarioSchema = z.object({
  nroSuministro: z.string().min(3).max(20),
  nombre: z.string().min(3).max(200),
  direccion: z.string().max(300).optional(),
  segmentoCodigo: z.string().min(2).max(10), // Código del segmento, no ID
  lineaNombre: z.string().min(3).max(100).optional(), // Nombre de línea, no ID
  activo: z.boolean().optional().default(true),
});

export const etlUsuariosCsvSchema = z.object({
  archivo: z.string().min(1, 'Nombre de archivo es requerido'),
  registros: z.array(etlUsuarioSchema).min(1, 'Al menos un registro es requerido'),
  hashDoc: z.string().min(1, 'Hash del archivo es requerido'),
});

// Esquemas para ETL de líneas y postes (CSV)
export const etlLineaSchema = z.object({
  nombre: z.string().min(3).max(100),
  tension: z.string().min(2).max(20),
  zona: z.string().min(2).max(50).optional(),
  activo: z.boolean().optional().default(true),
});

export const etlPosteSchema = z.object({
  lineaNombre: z.string().min(3).max(100), // Nombre de línea
  tipoPosteNombre: z.string().min(3).max(50), // Nombre de tipo de poste
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  estado: z.string().min(3).max(50), // bueno, regular, malo, peligroso
  observaciones: z.string().max(1000).optional(),
  fechaRelevamiento: z.string().datetime('Fecha de relevamiento inválida'),
});

export const etlLineasPostesCsvSchema = z.object({
  archivo: z.string().min(1, 'Nombre de archivo es requerido'),
  lineas: z.array(etlLineaSchema).optional().default([]),
  postes: z.array(etlPosteSchema).optional().default([]),
  hashDoc: z.string().min(1, 'Hash del archivo es requerido'),
});

// Esquemas de respuesta
export const etlResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  processed: z.number(),
  skipped: z.number(),
  errors: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
});

// Esquemas de consulta para logs ETL
export const etlLogsQuerySchema = z.object({
  fuente: z.string().optional(),
  desde: z.string().datetime().optional(),
  hasta: z.string().datetime().optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50).pipe(z.number().int().min(1).max(1000)),
  offset: z.string().optional().transform(val => val ? parseInt(val, 10) : 0).pipe(z.number().int().min(0)),
});

// Tipos derivados
export type EtlCompraInput = z.infer<typeof etlCompraSchema>;
export type EtlVentaInput = z.infer<typeof etlVentaSchema>;
export type EtlVentaCsvInput = z.infer<typeof etlVentaCsvSchema>;
export type EtlUsuarioInput = z.infer<typeof etlUsuarioSchema>;
export type EtlUsuariosCsvInput = z.infer<typeof etlUsuariosCsvSchema>;
export type EtlLineaInput = z.infer<typeof etlLineaSchema>;
export type EtlPosteInput = z.infer<typeof etlPosteSchema>;
export type EtlLineasPostesCsvInput = z.infer<typeof etlLineasPostesCsvSchema>;
export type EtlResponse = z.infer<typeof etlResponseSchema>;
export type EtlLogsQuery = z.infer<typeof etlLogsQuerySchema>;