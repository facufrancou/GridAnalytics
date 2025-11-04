import crypto from 'crypto';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

// Función para generar hash de contenido (idempotencia)
export function generateContentHash(content: string | object): string {
  const dataToHash = typeof content === 'string' ? content : JSON.stringify(content);
  return crypto.createHash('sha256').update(dataToHash).digest('hex');
}

// Función para parsear CSV
export function parseCSV<T = any>(csvContent: string, options: {
  headers?: boolean;
  delimiter?: string;
  skipEmptyLines?: boolean;
} = {}): T[] {
  const {
    headers = true,
    delimiter = ',',
    skipEmptyLines = true,
  } = options;

  try {
    return parse(csvContent, {
      columns: headers,
      delimiter,
      skip_empty_lines: skipEmptyLines,
      trim: true,
      cast: (value, { column }) => {
        // Auto-casting común para campos numéricos
        if (typeof column === 'string') {
          const lowerColumn = column.toLowerCase();
          if (lowerColumn.includes('kwh') || 
              lowerColumn.includes('importe') || 
              lowerColumn.includes('lect') ||
              lowerColumn.includes('demanda') ||
              lowerColumn.includes('fp') ||
              lowerColumn.includes('lat') ||
              lowerColumn.includes('lng')) {
            const num = parseFloat(value);
            return isNaN(num) ? value : num;
          }
          
          if (lowerColumn.includes('activo') || lowerColumn.includes('active')) {
            if (value.toLowerCase() === 'true' || value === '1') return true;
            if (value.toLowerCase() === 'false' || value === '0') return false;
          }
        }
        
        return value;
      },
    });
  } catch (error) {
    throw new Error(`Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Función para generar CSV
export function generateCSV<T = any>(data: T[], options: {
  headers?: boolean;
  delimiter?: string;
} = {}): string {
  const {
    headers = true,
    delimiter = ',',
  } = options;

  try {
    return stringify(data, {
      header: headers,
      delimiter,
    });
  } catch (error) {
    throw new Error(`Error generating CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Función para validar formato de período mensual
export function validatePeriodoMes(periodo: string): boolean {
  return /^\d{4}-\d{2}$/.test(periodo);
}

// Función para validar formato de período bimestral
export function validatePeriodoBimestre(periodo: string): boolean {
  return /^\d{4}-\d{2}_\d{4}-\d{2}$/.test(periodo);
}

// Función para extraer fechas de período bimestral
export function parsePeriodoBimestre(periodo: string): { inicio: string; fin: string } {
  if (!validatePeriodoBimestre(periodo)) {
    throw new Error('Formato de período bimestral inválido');
  }
  
  const partes = periodo.split('_');
  if (partes.length !== 2) {
    throw new Error('Formato de período bimestral inválido');
  }
  
  return { inicio: partes[0]!, fin: partes[1]! };
}

// Función para normalizar número de suministro
export function normalizeNroSuministro(nroSuministro: string): string {
  return nroSuministro.trim().toUpperCase();
}

// Función para validar rango de fechas
export function validateDateRange(fecha: string): boolean {
  const date = new Date(fecha);
  const now = new Date();
  const minDate = new Date('2020-01-01');
  
  return date >= minDate && date <= now;
}

// Función para limpiar y validar campos de texto
export function sanitizeText(text: string, maxLength?: number): string {
  let cleaned = text.trim().replace(/\s+/g, ' '); // Normalizar espacios
  
  if (maxLength && cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }
  
  return cleaned;
}

// Función para validar coordenadas geográficas
export function validateCoordinates(lat?: number, lng?: number): boolean {
  if (lat === undefined || lng === undefined) return true; // Coordenadas opcionales
  
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// Función para convertir string a boolean de manera segura
export function parseBoolean(value: string | boolean | number): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  
  const str = value.toString().toLowerCase().trim();
  return str === 'true' || str === '1' || str === 'yes' || str === 'si' || str === 'sí';
}

// Función para generar reporte de validación
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function createValidationResult(): ValidationResult {
  return {
    valid: true,
    errors: [],
    warnings: [],
  };
}

export function addValidationError(result: ValidationResult, error: string): void {
  result.valid = false;
  result.errors.push(error);
}

export function addValidationWarning(result: ValidationResult, warning: string): void {
  result.warnings.push(warning);
}

// Función para validar integridad de lecturas
export function validateLecturas(lectIni: number, lectFin: number, kwhVendidos: number): ValidationResult {
  const result = createValidationResult();
  
  if (lectFin < lectIni) {
    addValidationError(result, 'Lectura final no puede ser menor que lectura inicial');
  }
  
  const diferencia = lectFin - lectIni;
  const tolerance = 0.1; // 10% de tolerancia
  
  if (Math.abs(diferencia - kwhVendidos) > (kwhVendidos * tolerance)) {
    addValidationWarning(result, 
      `Diferencia de lecturas (${diferencia}) no coincide con kWh vendidos (${kwhVendidos})`
    );
  }
  
  return result;
}