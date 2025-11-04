import { prisma, withTransaction } from '../../infra/db.js';
import { NotFoundError, ConflictError } from '../../middlewares/error.js';
import { logETLEvent } from '../../utils/logger.js';
import { 
  generateContentHash, 
  parseCSV, 
  validateLecturas,
  createValidationResult,
  addValidationError,
  addValidationWarning,
  normalizeNroSuministro,
  sanitizeText,
  validateCoordinates,
  type ValidationResult 
} from '../../utils/csv.js';
import type {
  EtlCompraInput,
  EtlVentaCsvInput,
  EtlUsuariosCsvInput,
  EtlLineasPostesCsvInput,
  EtlResponse,
  EtlLogsQuery,
} from './schemas.js';

export class EtlService {

  // ============ ETL COMPRA (PDF procesado por n8n) ============
  
  async processCompraFromPdf(data: EtlCompraInput): Promise<EtlResponse> {
    let processed = 0;
    let skipped = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      await withTransaction(async (tx) => {
        // Verificar idempotencia por hash del documento
        const existingRaw = await tx.etlFacturasRaw.findFirst({
          where: {
            hashDoc: data.hashDoc,
            fuente: 'pdf_compra',
          },
        });

        if (existingRaw) {
          logETLEvent('compra_pdf_duplicate', {
            archivo: data.archivo,
            hashDoc: data.hashDoc,
          });
          skipped = 1;
          warnings.push('Documento ya procesado anteriormente');
          return;
        }

        // Verificar que la boca de compra existe
        const boca = await tx.catBocasCompra.findUnique({
          where: { id: data.idBoca },
        });

        if (!boca) {
          errors.push(`Boca de compra con ID ${data.idBoca} no encontrada`);
          return;
        }

        // Verificar duplicado por boca + período
        const existingMedicion = await tx.medicionesCompra.findUnique({
          where: {
            idBoca_periodoMes: {
              idBoca: data.idBoca,
              periodoMes: data.periodoMes,
            },
          },
        });

        if (existingMedicion) {
          warnings.push(`Ya existe una medición para boca ${data.idBoca} en período ${data.periodoMes}`);
          // Actualizar en lugar de crear nueva
          await tx.medicionesCompra.update({
            where: { id: existingMedicion.id },
            data: {
              kwhComprados: data.kwhComprados,
              importe: data.importe,
              fpPromedio: data.fpPromedio,
              demandaMaxKw: data.demandaMaxKw,
              fechaFactura: data.fechaFactura ? new Date(data.fechaFactura) : null,
              observaciones: data.observaciones,
            },
          });
        } else {
          // Crear nueva medición
          await tx.medicionesCompra.create({
            data: {
              idBoca: data.idBoca,
              periodoMes: data.periodoMes,
              kwhComprados: data.kwhComprados,
              importe: data.importe,
              fpPromedio: data.fpPromedio,
              demandaMaxKw: data.demandaMaxKw,
              fechaFactura: data.fechaFactura ? new Date(data.fechaFactura) : null,
              observaciones: data.observaciones,
            },
          });
        }

        // Registrar en tablas ETL para trazabilidad
        const rawRecord = await tx.etlFacturasRaw.create({
          data: {
            fuente: 'pdf_compra',
            archivo: data.archivo,
            campo: 'compra_completa',
            valor: JSON.stringify(data),
            conf: data.metadatos || {},
            hashDoc: data.hashDoc,
          },
        });

        await tx.etlMatchFacturas.create({
          data: {
            idRaw: rawRecord.id,
            campoNormalizado: 'medicion_compra',
            valorNormalizado: `${data.idBoca}-${data.periodoMes}`,
            entidadDestino: 'mediciones_compra',
            procesado: true,
          },
        });

        processed = 1;

        logETLEvent('compra_pdf_processed', {
          archivo: data.archivo,
          idBoca: data.idBoca,
          periodoMes: data.periodoMes,
          kwhComprados: data.kwhComprados,
        });
      });

      return {
        success: errors.length === 0,
        message: errors.length > 0 ? 'Errores durante el procesamiento' : 'Procesamiento completado',
        processed,
        skipped,
        errors,
        warnings,
      };

    } catch (error) {
      logETLEvent('compra_pdf_error', {
        archivo: data.archivo,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'error');

      return {
        success: false,
        message: 'Error durante el procesamiento',
        processed: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // ============ ETL VENTA (CSV) ============
  
  async processVentaFromCsv(data: EtlVentaCsvInput): Promise<EtlResponse> {
    let processed = 0;
    let skipped = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      await withTransaction(async (tx) => {
        // Verificar idempotencia por hash del archivo
        const existingRaw = await tx.etlFacturasRaw.findFirst({
          where: {
            hashDoc: data.hashDoc,
            fuente: 'csv_venta',
          },
        });

        if (existingRaw) {
          skipped = data.registros.length;
          warnings.push('Archivo ya procesado anteriormente');
          return;
        }

        // Procesar cada registro
        for (const [index, registro] of data.registros.entries()) {
          try {
            const nroSuministro = normalizeNroSuministro(registro.nroSuministro);

            // Verificar que el usuario existe
            const usuario = await tx.usuarios.findUnique({
              where: { nroSuministro },
            });

            if (!usuario) {
              errors.push(`Línea ${index + 1}: Usuario con suministro ${nroSuministro} no encontrado`);
              continue;
            }

            // Validar lecturas
            const validationResult = validateLecturas(
              registro.lectIni,
              registro.lectFin,
              registro.kwhVendidosBim
            );

            if (!validationResult.valid) {
              errors.push(`Línea ${index + 1}: ${validationResult.errors.join(', ')}`);
              continue;
            }

            if (validationResult.warnings.length > 0) {
              warnings.push(`Línea ${index + 1}: ${validationResult.warnings.join(', ')}`);
            }

            // Verificar duplicado por usuario + período
            const existingMedicion = await tx.medicionesVenta.findUnique({
              where: {
                idUsuario_periodoBimestre: {
                  idUsuario: usuario.id,
                  periodoBimestre: registro.periodoBimestre,
                },
              },
            });

            if (existingMedicion) {
              // Actualizar existente
              await tx.medicionesVenta.update({
                where: { id: existingMedicion.id },
                data: {
                  kwhVendidosBim: registro.kwhVendidosBim,
                  importe: registro.importe,
                  lectIni: registro.lectIni,
                  lectFin: registro.lectFin,
                  fechaFactura: registro.fechaFactura ? new Date(registro.fechaFactura) : null,
                  observaciones: registro.observaciones,
                },
              });
              warnings.push(`Línea ${index + 1}: Medición actualizada para ${nroSuministro}`);
            } else {
              // Crear nueva
              await tx.medicionesVenta.create({
                data: {
                  idUsuario: usuario.id,
                  periodoBimestre: registro.periodoBimestre,
                  kwhVendidosBim: registro.kwhVendidosBim,
                  importe: registro.importe,
                  lectIni: registro.lectIni,
                  lectFin: registro.lectFin,
                  fechaFactura: registro.fechaFactura ? new Date(registro.fechaFactura) : null,
                  observaciones: registro.observaciones,
                },
              });
            }

            processed++;

          } catch (error) {
            errors.push(`Línea ${index + 1}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          }
        }

        // Registrar archivo en ETL
        await tx.etlFacturasRaw.create({
          data: {
            fuente: 'csv_venta',
            archivo: data.archivo,
            campo: 'venta_csv',
            valor: JSON.stringify({ totalRegistros: data.registros.length }),
            hashDoc: data.hashDoc,
          },
        });

        logETLEvent('venta_csv_processed', {
          archivo: data.archivo,
          totalRegistros: data.registros.length,
          procesados: processed,
          errores: errors.length,
        });
      });

      return {
        success: errors.length === 0,
        message: errors.length > 0 ? 'Algunos registros tuvieron errores' : 'Procesamiento completado',
        processed,
        skipped,
        errors,
        warnings,
      };

    } catch (error) {
      logETLEvent('venta_csv_error', {
        archivo: data.archivo,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'error');

      return {
        success: false,
        message: 'Error durante el procesamiento',
        processed: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // ============ ETL USUARIOS (CSV) ============
  
  async processUsuariosFromCsv(data: EtlUsuariosCsvInput): Promise<EtlResponse> {
    let processed = 0;
    let skipped = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      await withTransaction(async (tx) => {
        // Verificar idempotencia
        const existingRaw = await tx.etlFacturasRaw.findFirst({
          where: {
            hashDoc: data.hashDoc,
            fuente: 'csv_usuarios',
          },
        });

        if (existingRaw) {
          skipped = data.registros.length;
          warnings.push('Archivo ya procesado anteriormente');
          return;
        }

        // Obtener catálogos para mapeo
        const segmentos = await tx.catSegmentos.findMany({ where: { activo: true } });
        const lineas = await tx.catLineas.findMany({ where: { activo: true } });

        for (const [index, registro] of data.registros.entries()) {
          try {
            const nroSuministro = normalizeNroSuministro(registro.nroSuministro);
            const nombre = sanitizeText(registro.nombre, 200);

            // Buscar segmento por código
            const segmento = segmentos.find(s => s.codigo === registro.segmentoCodigo);
            if (!segmento) {
              errors.push(`Línea ${index + 1}: Segmento '${registro.segmentoCodigo}' no encontrado`);
              continue;
            }

            // Buscar línea por nombre (opcional)
            let linea = null;
            if (registro.lineaNombre) {
              linea = lineas.find(l => l.nombre === registro.lineaNombre);
              if (!linea) {
                warnings.push(`Línea ${index + 1}: Línea '${registro.lineaNombre}' no encontrada, se creará usuario sin línea`);
              }
            }

            // Verificar si ya existe
            const existingUsuario = await tx.usuarios.findUnique({
              where: { nroSuministro },
            });

            if (existingUsuario) {
              // Actualizar existente
              await tx.usuarios.update({
                where: { id: existingUsuario.id },
                data: {
                  nombre,
                  direccion: registro.direccion ? sanitizeText(registro.direccion, 300) : null,
                  idSegmento: segmento.id,
                  idLinea: linea?.id || null,
                  activo: registro.activo,
                },
              });
              warnings.push(`Línea ${index + 1}: Usuario ${nroSuministro} actualizado`);
            } else {
              // Crear nuevo
              await tx.usuarios.create({
                data: {
                  nroSuministro,
                  nombre,
                  direccion: registro.direccion ? sanitizeText(registro.direccion, 300) : null,
                  idSegmento: segmento.id,
                  idLinea: linea?.id || null,
                  activo: registro.activo,
                },
              });
            }

            processed++;

          } catch (error) {
            errors.push(`Línea ${index + 1}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          }
        }

        // Registrar archivo en ETL
        await tx.etlFacturasRaw.create({
          data: {
            fuente: 'csv_usuarios',
            archivo: data.archivo,
            campo: 'usuarios_csv',
            valor: JSON.stringify({ totalRegistros: data.registros.length }),
            hashDoc: data.hashDoc,
          },
        });

        logETLEvent('usuarios_csv_processed', {
          archivo: data.archivo,
          totalRegistros: data.registros.length,
          procesados: processed,
          errores: errors.length,
        });
      });

      return {
        success: errors.length === 0,
        message: errors.length > 0 ? 'Algunos registros tuvieron errores' : 'Procesamiento completado',
        processed,
        skipped,
        errors,
        warnings,
      };

    } catch (error) {
      logETLEvent('usuarios_csv_error', {
        archivo: data.archivo,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'error');

      return {
        success: false,
        message: 'Error durante el procesamiento',
        processed: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // ============ ETL LÍNEAS Y POSTES (CSV) ============
  
  async processLineasPostesFromCsv(data: EtlLineasPostesCsvInput): Promise<EtlResponse> {
    let processed = 0;
    let skipped = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      await withTransaction(async (tx) => {
        // Verificar idempotencia
        const existingRaw = await tx.etlFacturasRaw.findFirst({
          where: {
            hashDoc: data.hashDoc,
            fuente: 'csv_lineas_postes',
          },
        });

        if (existingRaw) {
          skipped = data.lineas.length + data.postes.length;
          warnings.push('Archivo ya procesado anteriormente');
          return;
        }

        // Procesar líneas
        for (const [index, lineaData] of data.lineas.entries()) {
          try {
            const nombre = sanitizeText(lineaData.nombre, 100);

            const existingLinea = await tx.catLineas.findFirst({
              where: { nombre },
            });

            if (existingLinea) {
              await tx.catLineas.update({
                where: { id: existingLinea.id },
                data: {
                  tension: lineaData.tension,
                  zona: lineaData.zona ? sanitizeText(lineaData.zona, 50) : null,
                  activo: lineaData.activo,
                },
              });
              warnings.push(`Línea '${nombre}' actualizada`);
            } else {
              await tx.catLineas.create({
                data: {
                  nombre,
                  tension: lineaData.tension,
                  zona: lineaData.zona ? sanitizeText(lineaData.zona, 50) : null,
                  activo: lineaData.activo,
                },
              });
            }

            processed++;
          } catch (error) {
            errors.push(`Línea ${index + 1}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          }
        }

        // Procesar postes
        const lineasActualizadas = await tx.catLineas.findMany({ where: { activo: true } });
        const tiposPoste = await tx.catTiposPoste.findMany({ where: { activo: true } });

        for (const [index, posteData] of data.postes.entries()) {
          try {
            // Validar coordenadas
            if (!validateCoordinates(posteData.lat, posteData.lng)) {
              errors.push(`Poste ${index + 1}: Coordenadas inválidas`);
              continue;
            }

            // Buscar línea
            const linea = lineasActualizadas.find(l => l.nombre === posteData.lineaNombre);
            if (!linea) {
              errors.push(`Poste ${index + 1}: Línea '${posteData.lineaNombre}' no encontrada`);
              continue;
            }

            // Buscar tipo de poste
            const tipoPoste = tiposPoste.find(t => t.nombre === posteData.tipoPosteNombre);
            if (!tipoPoste) {
              errors.push(`Poste ${index + 1}: Tipo de poste '${posteData.tipoPosteNombre}' no encontrado`);
              continue;
            }

            await tx.relevamientoPostes.create({
              data: {
                idLinea: linea.id,
                idPosteType: tipoPoste.id,
                lat: posteData.lat,
                lng: posteData.lng,
                estado: posteData.estado,
                observaciones: posteData.observaciones,
                fechaRelevamiento: new Date(posteData.fechaRelevamiento),
              },
            });

            processed++;
          } catch (error) {
            errors.push(`Poste ${index + 1}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          }
        }

        // Registrar archivo en ETL
        await tx.etlFacturasRaw.create({
          data: {
            fuente: 'csv_lineas_postes',
            archivo: data.archivo,
            campo: 'lineas_postes_csv',
            valor: JSON.stringify({ 
              totalLineas: data.lineas.length,
              totalPostes: data.postes.length,
            }),
            hashDoc: data.hashDoc,
          },
        });

        logETLEvent('lineas_postes_csv_processed', {
          archivo: data.archivo,
          totalLineas: data.lineas.length,
          totalPostes: data.postes.length,
          procesados: processed,
          errores: errors.length,
        });
      });

      return {
        success: errors.length === 0,
        message: errors.length > 0 ? 'Algunos registros tuvieron errores' : 'Procesamiento completado',
        processed,
        skipped,
        errors,
        warnings,
      };

    } catch (error) {
      logETLEvent('lineas_postes_csv_error', {
        archivo: data.archivo,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'error');

      return {
        success: false,
        message: 'Error durante el procesamiento',
        processed: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // ============ LOGS Y CONSULTAS ETL ============
  
  async getEtlLogs(query: EtlLogsQuery) {
    const { fuente, desde, hasta, limit, offset } = query;

    const where = {
      ...(fuente && { fuente }),
      ...(desde || hasta) && {
        createdAt: {
          ...(desde && { gte: new Date(desde) }),
          ...(hasta && { lte: new Date(hasta) }),
        },
      },
    };

    const [logs, total] = await Promise.all([
      prisma.etlFacturasRaw.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          matches: {
            orderBy: { createdAt: 'desc' },
            take: 5, // Últimos 5 matches por registro
          },
        },
      }),
      prisma.etlFacturasRaw.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async getEtlStats() {
    const [compraCount, ventaCount, usuariosCount, lineasPostesCount] = await Promise.all([
      prisma.etlFacturasRaw.count({ where: { fuente: 'pdf_compra' } }),
      prisma.etlFacturasRaw.count({ where: { fuente: 'csv_venta' } }),
      prisma.etlFacturasRaw.count({ where: { fuente: 'csv_usuarios' } }),
      prisma.etlFacturasRaw.count({ where: { fuente: 'csv_lineas_postes' } }),
    ]);

    return {
      totalProcesados: compraCount + ventaCount + usuariosCount + lineasPostesCount,
      porFuente: {
        pdf_compra: compraCount,
        csv_venta: ventaCount,
        csv_usuarios: usuariosCount,
        csv_lineas_postes: lineasPostesCount,
      },
    };
  }
}