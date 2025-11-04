import { z } from 'zod';

// Schemas para analítica
export const balanceCompraPorBocaSchema = z.object({
  idBoca: z.string().min(1).max(20),
  periodoMes: z.string().regex(/^\d{4}-\d{2}$/, 'Formato debe ser YYYY-MM'),
  kwhCompradosMes: z.number().min(0),
  importeCompradoMes: z.number().min(0),
});

export const balanceVentaPorBocaSchema = z.object({
  idBoca: z.string().min(1).max(20),
  periodoMes: z.string().regex(/^\d{4}-\d{2}$/, 'Formato debe ser YYYY-MM'),
  kwhVendidosMes: z.number().min(0),
  importeVendidoMes: z.number().min(0),
});

export const balanceGeneralSchema = z.object({
  idBoca: z.string().min(1).max(20),
  periodoMes: z.string().regex(/^\d{4}-\d{2}$/, 'Formato debe ser YYYY-MM'),
  kwhCompradosMes: z.number().min(0),
  kwhVendidosMes: z.number().min(0),
  importeCompradoMes: z.number().min(0),
  importeVendidoMes: z.number().min(0),
  perdidaKwh: z.number(),
  perdidaPorcentaje: z.number(),
  nivelPerdida: z.enum(['normal', 'moderada', 'alta', 'critica']),
  descripcionPerdida: z.string(),
});

export const mensualizeVentaRequestSchema = z.object({
  periodoBimestre: z.string().regex(/^\d{4}-\d{2}_\d{4}-\d{2}$/, 'Formato debe ser YYYY-MM_YYYY-MM'),
  kwhVendidosBim: z.number().min(0),
  importeBim: z.number().min(0).optional(),
});

export const mensualizeVentaResponseSchema = z.array(
  z.object({
    periodoMes: z.string(),
    kwhVendidosMes: z.number(),
    importeMes: z.number(),
    diasMes: z.number(),
    pctDistribucion: z.number(),
  })
);

export const balanceQuerySchema = z.object({
  idBoca: z.string().min(1).max(20).optional(),
  periodoInicio: z.string().regex(/^\d{4}-\d{2}$/, 'Formato debe ser YYYY-MM'),
  periodoFin: z.string().regex(/^\d{4}-\d{2}$/, 'Formato debe ser YYYY-MM'),
  incluirDetalle: z.boolean().optional().default(false),
});

export const analisisPerdidaSchema = z.object({
  idBoca: z.string().min(1).max(20),
  periodoMes: z.string().regex(/^\d{4}-\d{2}$/, 'Formato debe ser YYYY-MM'),
  kwhCompradosMes: z.number().min(0),
  kwhVendidosMes: z.number().min(0),
  perdidaKwh: z.number(),
  perdidaPorcentaje: z.number(),
  nivelPerdida: z.enum(['normal', 'moderada', 'alta', 'critica']),
  descripcionPerdida: z.string(),
  factorCarga: z.number().optional(),
  demandaPromedio: z.number().optional(),
  cantidadUsuarios: z.number().optional(),
  kwhPromedioUsuario: z.number().optional(),
});

export const resumenPeriodoSchema = z.object({
  periodoMes: z.string().regex(/^\d{4}-\d{2}$/, 'Formato debe ser YYYY-MM'),
  totalBocas: z.number(),
  totalKwhComprados: z.number(),
  totalKwhVendidos: z.number(),
  totalImporteComprado: z.number(),
  totalImporteVendido: z.number(),
  perdidaTotalKwh: z.number(),
  perdidaTotalPorcentaje: z.number(),
  bocasConPerdidaNormal: z.number(),
  bocasConPerdidaModerada: z.number(),
  bocasConPerdidaAlta: z.number(),
  bocasConPerdidaCritica: z.number(),
});

export const topPerdidaSchema = z.object({
  ranking: z.number(),
  idBoca: z.string(),
  nombreBoca: z.string().optional(),
  periodoMes: z.string(),
  kwhCompradosMes: z.number(),
  kwhVendidosMes: z.number(),
  perdidaKwh: z.number(),
  perdidaPorcentaje: z.number(),
  nivelPerdida: z.enum(['normal', 'moderada', 'alta', 'critica']),
});

export const tendenciaPerdidaSchema = z.object({
  idBoca: z.string(),
  nombreBoca: z.string().optional(),
  periodos: z.array(
    z.object({
      periodoMes: z.string(),
      perdidaPorcentaje: z.number(),
      tendencia: z.enum(['mejorando', 'estable', 'empeorando']),
    })
  ),
  promedioGeneral: z.number(),
  tendenciaGeneral: z.enum(['mejorando', 'estable', 'empeorando']),
});

export const comparativaPerdidaSchema = z.object({
  periodoActual: z.string(),
  periodoAnterior: z.string(),
  bocas: z.array(
    z.object({
      idBoca: z.string(),
      nombreBoca: z.string().optional(),
      perdidaActual: z.number(),
      perdidaAnterior: z.number(),
      variacion: z.number(),
      variacionPorcentual: z.number(),
      estado: z.enum(['mejorado', 'estable', 'empeorado']),
    })
  ),
  resumen: z.object({
    totalBocas: z.number(),
    bocasMejoradas: z.number(),
    bocasEstables: z.number(),
    bocasEmpeoradas: z.number(),
    variacionPromedio: z.number(),
  }),
});

export const sectorizacionSchema = z.object({
  periodoMes: z.string().regex(/^\d{4}-\d{2}$/, 'Formato debe ser YYYY-MM'),
  sectores: z.array(
    z.object({
      sectorId: z.string(),
      sectorNombre: z.string(),
      bocas: z.array(z.string()),
      totalKwhComprados: z.number(),
      totalKwhVendidos: z.number(),
      perdidaSector: z.number(),
      perdidaPorcentajeSector: z.number(),
      nivelPerdidaSector: z.enum(['normal', 'moderada', 'alta', 'critica']),
    })
  ),
  resumenGeneral: z.object({
    totalSectores: z.number(),
    perdidaPromedioSistema: z.number(),
    sectorMayorPerdida: z.string(),
    sectorMenorPerdida: z.string(),
  }),
});

export const alertaPerdidaSchema = z.object({
  id: z.string(),
  idBoca: z.string(),
  nombreBoca: z.string().optional(),
  periodoMes: z.string(),
  tipoAlerta: z.enum(['perdida_alta', 'perdida_critica', 'aumento_subito', 'perdida_negativa']),
  mensaje: z.string(),
  perdidaActual: z.number(),
  perdidaAnterior: z.number().optional(),
  umbralSuperado: z.number().optional(),
  prioridad: z.enum(['baja', 'media', 'alta', 'critica']),
  fechaCreacion: z.date(),
  estado: z.enum(['pendiente', 'revisando', 'resuelto', 'descartado']).default('pendiente'),
});

// Types derivados
export type BalanceCompraPorBoca = z.infer<typeof balanceCompraPorBocaSchema>;
export type BalanceVentaPorBoca = z.infer<typeof balanceVentaPorBocaSchema>;
export type BalanceGeneral = z.infer<typeof balanceGeneralSchema>;
export type MensualizeVentaRequest = z.infer<typeof mensualizeVentaRequestSchema>;
export type MensualizeVentaResponse = z.infer<typeof mensualizeVentaResponseSchema>;
export type BalanceQuery = z.infer<typeof balanceQuerySchema>;
export type AnalisisPerdida = z.infer<typeof analisisPerdidaSchema>;
export type ResumenPeriodo = z.infer<typeof resumenPeriodoSchema>;
export type TopPerdida = z.infer<typeof topPerdidaSchema>;
export type TendenciaPerdida = z.infer<typeof tendenciaPerdidaSchema>;
export type ComparativaPerdida = z.infer<typeof comparativaPerdidaSchema>;
export type Sectorizacion = z.infer<typeof sectorizacionSchema>;
export type AlertaPerdida = z.infer<typeof alertaPerdidaSchema>;