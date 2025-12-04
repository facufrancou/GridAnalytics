import * as XLSX from 'xlsx';

const wb = XLSX.readFile('padron-tarifas.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]!]!;
const data = XLSX.utils.sheet_to_json<any>(sheet);
console.log('Columnas:', Object.keys(data[0] || {}));
console.log('Primeras 5 filas:');
data.slice(0, 5).forEach((r: any, i: number) => console.log(i+1, JSON.stringify(r)));
console.log('Total registros:', data.length);
