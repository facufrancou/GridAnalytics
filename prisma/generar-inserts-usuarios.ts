import * as XLSX from 'xlsx';
import * as fs from 'fs';

// Leer el archivo Excel
const workbook = XLSX.readFile('usuarios.xlsx');
if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
  throw new Error('El archivo usuarios.xlsx no contiene hojas.');
}
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName as string];
if (!worksheet) {
  throw new Error(`No se encontró la hoja '${sheetName}' en usuarios.xlsx.`);
}
const data = XLSX.utils.sheet_to_json<any>(worksheet);

// Filtrar duplicados por nro_suministro (quedarse con el primero)
const seen = new Set<string>();
const uniqueData = data.filter(row => {
  const nroSum = String(row['nro_suministro']);
  if (seen.has(nroSum)) {
    return false;
  }
  seen.add(nroSum);
  return true;
});

console.log(`Total filas en Excel: ${data.length}, Únicas: ${uniqueData.length}`);

function parseDecimal(val: any): string {
  if (val === undefined || val === null || val === '' || val === 'null') return 'NULL';
  const str = String(val).replace(',', '.');
  const num = Number(str);
  if (isNaN(num) || !isFinite(num)) return 'NULL';
  return num.toString();
}

// Generar INSERTs en bloques de 100 registros por comando
const batchSize = 100;
const inserts: string[] = [];

for (let i = 0; i < uniqueData.length; i += batchSize) {
  const batch = uniqueData.slice(i, i + batchSize);
  const values: string[] = [];
  
  for (const row of batch) {
    const nroSuministro = String(row['nro_suministro']).replace(/'/g, "''");
    const nombre = (row['nombre'] || '').replace(/'/g, "''");
    const direccion = row['direccion'] ? `'${String(row['direccion']).replace(/'/g, "''")}'` : 'NULL';
    const idSegmento = Number(row['id_segmento']) || 1;
    const idLineaNum = Number(row['id_linea']);
    const idLinea = (row['id_linea'] && !isNaN(idLineaNum)) ? idLineaNum : 'NULL';
    const activo = 'true';
    const createdAt = row['created_at'] && row['created_at'] !== 'null' ? `'${row['created_at']}'` : 'CURRENT_TIMESTAMP';
    const updatedAt = row['updated_at'] && row['updated_at'] !== 'null' ? `'${row['updated_at']}'` : 'CURRENT_TIMESTAMP';
    const codPostalNum = Number(row['cod_postal']);
    const codPostal = (row['cod_postal'] && !isNaN(codPostalNum)) ? codPostalNum : 'NULL';
    const latitud = parseDecimal(row['latitud']);
    const longitud = parseDecimal(row['longitud']);
    const distribuidorId = 1;

    values.push(`('${nroSuministro}', '${nombre}', ${direccion}, ${idSegmento}, ${idLinea}, ${activo}, ${createdAt}, ${updatedAt}, ${codPostal}, ${latitud}, ${longitud}, ${distribuidorId})`);
  }
  
  const sql = `INSERT INTO usuarios (nro_suministro, nombre, direccion, id_segmento, id_linea, activo, created_at, updated_at, cod_postal, latitud, longitud, distribuidor_id) VALUES ${values.join(',\n')} ON CONFLICT (nro_suministro) DO NOTHING;`;
  inserts.push(sql);
}

fs.writeFileSync('usuarios-inserts.sql', inserts.join('\n\n'));
console.log(`Archivo usuarios-inserts.sql generado con ${inserts.length} comandos INSERT (${uniqueData.length} registros en bloques de ${batchSize}).`);
