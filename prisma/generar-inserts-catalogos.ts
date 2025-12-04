import * as XLSX from 'xlsx';
import * as fs from 'fs';

function parseDecimal(val: any): string {
  if (val === undefined || val === null || val === '' || val === 'null') return 'NULL';
  const str = String(val).replace(',', '.');
  const num = Number(str);
  if (isNaN(num) || !isFinite(num)) return 'NULL';
  return num.toString();
}

function escapeString(val: any): string {
  if (val === undefined || val === null || val === '') return '';
  return String(val).replace(/'/g, "''");
}

// ==================== CAT_BOCAS_COMPRA ====================
console.log('Procesando cat_bocas_compra...');
const bocasWorkbook = XLSX.readFile('cat_bocas_compra.xlsx');
const bocasSheetName = bocasWorkbook.SheetNames[0];
if (!bocasSheetName) throw new Error('No se encontró hoja en cat_bocas_compra.xlsx');
const bocasSheet = bocasWorkbook.Sheets[bocasSheetName];
if (!bocasSheet) throw new Error('No se pudo leer la hoja de cat_bocas_compra.xlsx');
const bocasData = XLSX.utils.sheet_to_json<any>(bocasSheet);

const bocasInserts: string[] = [];
const bocasBatchSize = 50;

for (let i = 0; i < bocasData.length; i += bocasBatchSize) {
  const batch = bocasData.slice(i, i + bocasBatchSize);
  const values: string[] = [];
  
  for (const row of batch) {
    const nombre = escapeString(row['nombre']);
    const proveedor = escapeString(row['proveedor']);
    const activo = row['activo'] !== undefined ? (row['activo'] ? 'true' : 'false') : 'true';
    const createdAt = row['created_at'] && row['created_at'] !== 'null' ? `'${row['created_at']}'` : 'CURRENT_TIMESTAMP';
    const updatedAt = row['updated_at'] && row['updated_at'] !== 'null' ? `'${row['updated_at']}'` : 'CURRENT_TIMESTAMP';
    const latitud = parseDecimal(row['latitud']);
    const longitud = parseDecimal(row['longitud']);

    values.push(`('${nombre}', '${proveedor}', ${activo}, ${createdAt}, ${updatedAt}, ${latitud}, ${longitud})`);
  }
  
  const sql = `INSERT INTO cat_bocas_compra (nombre, proveedor, activo, created_at, updated_at, latitud, longitud) VALUES ${values.join(',\n')} ON CONFLICT (id_boca) DO NOTHING;`;
  bocasInserts.push(sql);
}

fs.writeFileSync('cat_bocas_compra-inserts.sql', bocasInserts.join('\n\n'));
console.log(`✓ cat_bocas_compra-inserts.sql generado (${bocasData.length} registros en ${bocasInserts.length} comandos)`);

// ==================== CAT_DISTRIBUIDOR ====================
console.log('Procesando cat_distribuidor...');
const distWorkbook = XLSX.readFile('cat_distribuidor.xlsx');
const distSheetName = distWorkbook.SheetNames[0];
if (!distSheetName) throw new Error('No se encontró hoja en cat_distribuidor.xlsx');
const distSheet = distWorkbook.Sheets[distSheetName];
if (!distSheet) throw new Error('No se pudo leer la hoja de cat_distribuidor.xlsx');
const distData = XLSX.utils.sheet_to_json<any>(distSheet);

const distInserts: string[] = [];
const distBatchSize = 50;

for (let i = 0; i < distData.length; i += distBatchSize) {
  const batch = distData.slice(i, i + distBatchSize);
  const values: string[] = [];
  
  for (const row of batch) {
    const nombre = row['nombre'] ? `'${escapeString(row['nombre'])}'` : 'NULL';
    const ubicacion = row['ubicacion'] ? `'${escapeString(row['ubicacion'])}'` : 'NULL';
    const latitud = parseDecimal(row['latitud']);
    const longitud = parseDecimal(row['longitud']);
    const bocaCompraIdNum = Number(row['boca_compra_id']);
    const bocaCompraId = (row['boca_compra_id'] && !isNaN(bocaCompraIdNum)) ? bocaCompraIdNum : 'NULL';

    values.push(`(${nombre}, ${ubicacion}, ${latitud}, ${longitud}, ${bocaCompraId})`);
  }
  
  const sql = `INSERT INTO cat_distribuidor (nombre, ubicacion, latitud, longitud, boca_compra_id) VALUES ${values.join(',\n')} ON CONFLICT (id) DO NOTHING;`;
  distInserts.push(sql);
}

fs.writeFileSync('cat_distribuidor-inserts.sql', distInserts.join('\n\n'));
console.log(`✓ cat_distribuidor-inserts.sql generado (${distData.length} registros en ${distInserts.length} comandos)`);

// ==================== CAT_SEGMENTOS ====================
console.log('Procesando cat_segmentos...');
const segWorkbook = XLSX.readFile('cat_segmentos.xlsx');
const segSheetName = segWorkbook.SheetNames[0];
if (!segSheetName) throw new Error('No se encontró hoja en cat_segmentos.xlsx');
const segSheet = segWorkbook.Sheets[segSheetName];
if (!segSheet) throw new Error('No se pudo leer la hoja de cat_segmentos.xlsx');
const segData = XLSX.utils.sheet_to_json<any>(segSheet);

// Filtrar duplicados por codigo (el codigo debe ser único, mantener el primero)
const seenCodigos = new Set<string>();
const segDataUnique = segData.filter((row: any) => {
  const codigo = String(row['codigo'] || '').trim();
  if (seenCodigos.has(codigo)) {
    console.log(`  ⚠ Código duplicado omitido: id_segmento=${row['id_segmento']}, codigo="${codigo}"`);
    return false;
  }
  seenCodigos.add(codigo);
  return true;
});

const segInserts: string[] = [];
const segBatchSize = 50;

for (let i = 0; i < segDataUnique.length; i += segBatchSize) {
  const batch = segDataUnique.slice(i, i + segBatchSize);
  const values: string[] = [];
  
  for (const row of batch) {
    const idSegmento = Number(row['id_segmento']);
    if (isNaN(idSegmento)) continue; // Saltar filas sin id_segmento válido
    const nombre = escapeString(row['nombre']);
    const codigo = escapeString(row['codigo']);
    const activo = row['activo'] !== undefined ? (row['activo'] ? 'true' : 'false') : 'true';

    values.push(`(${idSegmento}, '${nombre}', '${codigo}', ${activo}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`);
  }
  
  if (values.length === 0) continue;
  const sql = `INSERT INTO cat_segmentos (id_segmento, nombre, codigo, activo, created_at, updated_at) VALUES ${values.join(',\n')} ON CONFLICT (id_segmento) DO UPDATE SET nombre = EXCLUDED.nombre, codigo = EXCLUDED.codigo, activo = EXCLUDED.activo, updated_at = CURRENT_TIMESTAMP;`;
  segInserts.push(sql);
}

const segHeader = `-- Eliminar datos existentes en cat_segmentos\nTRUNCATE TABLE cat_segmentos RESTART IDENTITY CASCADE;\n\n`;
fs.writeFileSync('cat_segmentos-inserts.sql', segHeader + segInserts.join('\n\n'));
console.log(`✓ cat_segmentos-inserts.sql generado (${segDataUnique.length} registros, ${segData.length - segDataUnique.length} duplicados omitidos)`);

console.log('\n✓ Todos los archivos SQL generados exitosamente.');
