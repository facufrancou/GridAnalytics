import * as XLSX from 'xlsx';

const wb = XLSX.readFile('cat_segmentos.xlsx');
const data = XLSX.utils.sheet_to_json<any>(wb.Sheets[wb.SheetNames[0]!]!);

const nombres: Record<string, number[]> = {};
const codigos: Record<string, number[]> = {};

data.forEach((r) => {
  const n = r.nombre;
  const c = r.codigo;
  if (nombres[n] === undefined) nombres[n] = [];
  if (codigos[c] === undefined) codigos[c] = [];
  nombres[n].push(r.id_segmento);
  codigos[c].push(r.id_segmento);
});

console.log('=== NOMBRES DUPLICADOS ===');
Object.entries(nombres).filter(([k, v]) => v.length > 1).forEach(([k, v]) => console.log(`${k}: IDs ${v.join(', ')}`));

console.log('');
console.log('=== CODIGOS DUPLICADOS ===');
Object.entries(codigos).filter(([k, v]) => v.length > 1).forEach(([k, v]) => console.log(`${k}: IDs ${v.join(', ')}`));
