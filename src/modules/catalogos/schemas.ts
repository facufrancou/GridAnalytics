import { z } from 'zod';

// Esquemas para catálogos
export const bocaCompraSchema = z.object({
  nombre: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').max(100),
  proveedor: z.string().min(3, 'Proveedor debe tener al menos 3 caracteres').max(100),
  activo: z.boolean().optional().default(true),
});

export const segmentoSchema = z.object({
  nombre: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').max(50),
  codigo: z.string().min(2, 'Código debe tener al menos 2 caracteres').max(10),
  activo: z.boolean().optional().default(true),
});

export const lineaSchema = z.object({
  nombre: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').max(100),
  tension: z.string().min(2, 'Tensión debe tener al menos 2 caracteres').max(20),
  zona: z.string().min(2, 'Zona debe tener al menos 2 caracteres').max(50).optional(),
  activo: z.boolean().optional().default(true),
});

export const tipoPosteSchema = z.object({
  nombre: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').max(50),
  activo: z.boolean().optional().default(true),
});

export const usuarioSchema = z.object({
  nroSuministro: z.string().min(3, 'Número de suministro debe tener al menos 3 caracteres').max(20),
  nombre: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').max(200),
  direccion: z.string().max(300).optional(),
  idSegmento: z.number().int().positive('ID de segmento debe ser positivo'),
  idLinea: z.number().int().positive('ID de línea debe ser positivo').optional(),
  activo: z.boolean().optional().default(true),
});

// Esquemas para actualización (todos los campos opcionales)
export const updateBocaCompraSchema = bocaCompraSchema.partial();
export const updateSegmentoSchema = segmentoSchema.partial();
export const updateLineaSchema = lineaSchema.partial();
export const updateTipoPosteSchema = tipoPosteSchema.partial();
export const updateUsuarioSchema = usuarioSchema.partial();

// Esquemas de consulta
export const catalogoQuerySchema = z.object({
  activo: z.enum(['true', 'false', 'all']).optional().default('true'),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 100).pipe(z.number().int().min(1).max(1000)),
  offset: z.string().optional().transform(val => val ? parseInt(val, 10) : 0).pipe(z.number().int().min(0)),
  search: z.string().max(100).optional(),
});

export const usuarioQuerySchema = catalogoQuerySchema.extend({
  idSegmento: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined).pipe(z.number().int().positive().optional()),
  idLinea: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined).pipe(z.number().int().positive().optional()),
});

// Tipos derivados
export type BocaCompraInput = z.infer<typeof bocaCompraSchema>;
export type SegmentoInput = z.infer<typeof segmentoSchema>;
export type LineaInput = z.infer<typeof lineaSchema>;
export type TipoPosteInput = z.infer<typeof tipoPosteSchema>;
export type UsuarioInput = z.infer<typeof usuarioSchema>;

export type UpdateBocaCompraInput = z.infer<typeof updateBocaCompraSchema>;
export type UpdateSegmentoInput = z.infer<typeof updateSegmentoSchema>;
export type UpdateLineaInput = z.infer<typeof updateLineaSchema>;
export type UpdateTipoPosteInput = z.infer<typeof updateTipoPosteSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;

export type CatalogoQuery = z.infer<typeof catalogoQuerySchema>;
export type UsuarioQuery = z.infer<typeof usuarioQuerySchema>;