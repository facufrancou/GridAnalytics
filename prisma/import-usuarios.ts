import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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

  let ok = 0;
  let fail = 0;
  for (const row of data) {
    // Preparar objeto limpio para Prisma
    const usuario: any = {
      nroSuministro: String(row['nro_suministro']),
      nombre: row['nombre'],
      direccion: row['direccion'] || undefined,
    };
  // Agregar latitud y longitud soportando punto o coma decimal
  function parseDecimal(val: any): number | undefined {
    if (val === undefined || val === null || val === '' || val === 'null') return undefined;
    // Reemplazar coma por punto si es string
    const str = String(val).replace(',', '.');
    const num = Number(str);
    return isNaN(num) ? undefined : num;
  }
  const lat = parseDecimal(row['latitud']);
  if (lat !== undefined) usuario.latitud = lat;
  const lng = parseDecimal(row['longitud']);
  if (lng !== undefined) usuario.longitud = lng;
    // idSegmento solo si es número válido
    let idSeg = Number(row['id_segmento']);
    if (isNaN(idSeg) || !idSeg) {
      idSeg = 1; // Asignar segmento 1 por defecto
    }
    usuario.segmento = { connect: { id: idSeg } };
    // createdAt y updatedAt solo si son fechas válidas
    if (row['created_at'] && row['created_at'] !== 'null') {
      const d = new Date(row['created_at']);
      if (!isNaN(d.getTime())) usuario.createdAt = d;
    }
    if (row['updated_at'] && row['updated_at'] !== 'null') {
      const d = new Date(row['updated_at']);
      if (!isNaN(d.getTime())) usuario.updatedAt = d;
    }
    try {
      await prisma.usuarios.create({ data: usuario });
      ok++;
    } catch (e) {
      fail++;
      console.error('Error insertando usuario:', row, e);
    }
  }
  console.log(`Importación finalizada. Usuarios insertados: ${ok}, errores: ${fail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
