import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Iniciando seed de la base de datos...');

  // 1. Catálogos básicos
  const segmentos = await prisma.catSegmentos.createMany({
    data: [
      { idSegmento: 'RES', nombreSegmento: 'Residencial', descripcion: 'Usuarios residenciales de baja tensión', activo: true },
      { idSegmento: 'COM', nombreSegmento: 'Comercial', descripcion: 'Pequeños comercios e industrias', activo: true },
      { idSegmento: 'IND', nombreSegmento: 'Industrial', descripcion: 'Grandes industrias y demandas especiales', activo: true },
      { idSegmento: 'APU', nombreSegmento: 'Alumbrado Público', descripcion: 'Sistema de alumbrado público municipal', activo: true },
      { idSegmento: 'RUR', nombreSegmento: 'Rural', descripcion: 'Usuarios rurales dispersos', activo: true },
    ],
    skipDuplicates: true,
  });

  const bocas = await prisma.catBocasCompra.createMany({
    data: [
      { idBoca: 'BOCA001', nombreBoca: 'Subestación Centro', ubicacion: 'Centro de la ciudad', tensionNominal: 132000, capacidadMva: 25.0, activo: true },
      { idBoca: 'BOCA002', nombreBoca: 'Subestación Norte', ubicacion: 'Zona Norte', tensionNominal: 132000, capacidadMva: 15.0, activo: true },
      { idBoca: 'BOCA003', nombreBoca: 'Subestación Sur', ubicacion: 'Zona Sur', tensionNominal: 132000, capacidadMva: 20.0, activo: true },
      { idBoca: 'BOCA004', nombreBoca: 'Subestación Industrial', ubicacion: 'Parque Industrial', tensionNominal: 132000, capacidadMva: 30.0, activo: true },
      { idBoca: 'BOCA005', nombreBoca: 'Subestación Rural', ubicacion: 'Zona Rural', tensionNominal: 66000, capacidadMva: 10.0, activo: true },
    ],
    skipDuplicates: true,
  });

  const tiposPoste = await prisma.catTiposPoste.createMany({
    data: [
      { idTipoPoste: 'H8', nombreTipo: 'Hormigón 8m', material: 'Hormigón', altura: 8.0, cargaUtil: 200, activo: true },
      { idTipoPoste: 'H10', nombreTipo: 'Hormigón 10m', material: 'Hormigón', altura: 10.0, cargaUtil: 300, activo: true },
      { idTipoPoste: 'H12', nombreTipo: 'Hormigón 12m', material: 'Hormigón', altura: 12.0, cargaUtil: 400, activo: true },
      { idTipoPoste: 'M8', nombreTipo: 'Metálico 8m', material: 'Acero galvanizado', altura: 8.0, cargaUtil: 150, activo: true },
      { idTipoPoste: 'M10', nombreTipo: 'Metálico 10m', material: 'Acero galvanizado', altura: 10.0, cargaUtil: 250, activo: true },
      { idTipoPoste: 'M12', nombreTipo: 'Metálico 12m', material: 'Acero galvanizado', altura: 12.0, cargaUtil: 350, activo: true },
    ],
    skipDuplicates: true,
  });

  const lineas = await prisma.catLineas.createMany({
    data: [
      { idLinea: 'LIN001', nombreLinea: 'Línea Principal Centro', tensionNominal: 13200, longitudKm: 15.5, activo: true },
      { idLinea: 'LIN002', nombreLinea: 'Línea Norte 1', tensionNominal: 13200, longitudKm: 12.3, activo: true },
      { idLinea: 'LIN003', nombreLinea: 'Línea Norte 2', tensionNominal: 13200, longitudKm: 18.7, activo: true },
      { idLinea: 'LIN004', nombreLinea: 'Línea Sur Principal', tensionNominal: 13200, longitudKm: 22.1, activo: true },
      { idLinea: 'LIN005', nombreLinea: 'Línea Industrial', tensionNominal: 13200, longitudKm: 8.9, activo: true },
      { idLinea: 'LIN006', nombreLinea: 'Línea Rural Este', tensionNominal: 13200, longitudKm: 35.2, activo: true },
      { idLinea: 'LIN007', nombreLinea: 'Línea Rural Oeste', tensionNominal: 13200, longitudKm: 28.8, activo: true },
    ],
    skipDuplicates: true,
  });

  // 2. Usuario administrador por defecto
  const adminPassword = await argon2.hash('admin123');
  const adminUser = await prisma.authUsuarios.upsert({
    where: { email: 'admin@cooperativa.com' },
    update: {},
    create: {
      email: 'admin@cooperativa.com',
      passwordHash: adminPassword,
      rol: 'ADMIN',
      nombre: 'Administrador del Sistema',
      activo: true,
      emailVerificado: true,
    },
  });

  // 3. API Key para n8n
  const n8nApiKey = await prisma.authApiKeys.upsert({
    where: { nombre: 'n8n-integration' },
    update: {},
    create: {
      nombre: 'n8n-integration',
      descripcion: 'API Key para integración con n8n ETL',
      keyHash: await argon2.hash('secret-key-n8n-2024'),
      activo: true,
    },
  });

  // 4. Usuarios de ejemplo
  await prisma.usuarios.createMany({
    data: [
      {
        nroSuministro: 100001,
        nombre: 'Juan Pérez',
        direccion: 'Av. Principal 123',
        idBoca: 'BOCA001',
        idSegmento: 'RES',
        idLinea: 'LIN001',
        activo: true,
      },
      {
        nroSuministro: 100002,
        nombre: 'María González',
        direccion: 'Calle Central 456',
        idBoca: 'BOCA001',
        idSegmento: 'RES',
        idLinea: 'LIN001',
        activo: true,
      },
      {
        nroSuministro: 200001,
        nombre: 'Comercial Norte SA',
        direccion: 'Zona Norte 789',
        idBoca: 'BOCA002',
        idSegmento: 'COM',
        idLinea: 'LIN002',
        activo: true,
      },
      {
        nroSuministro: 300001,
        nombre: 'Industrias del Sur',
        direccion: 'Parque Industrial lote 5',
        idBoca: 'BOCA004',
        idSegmento: 'IND',
        idLinea: 'LIN005',
        activo: true,
      },
      {
        nroSuministro: 400001,
        nombre: 'Municipalidad - Alumbrado',
        direccion: 'Centro administrativo',
        idBoca: 'BOCA001',
        idSegmento: 'APU',
        idLinea: 'LIN001',
        activo: true,
      },
    ],
    skipDuplicates: true,
  });

  // 5. Datos de ejemplo para mediciones (último trimestre)
  await prisma.medicionesCompra.createMany({
    data: [
      // BOCA001 - Enero 2024
      { idBoca: 'BOCA001', periodoMes: '2024-01', kwhCompradosMes: 125000, importeCompradoMes: 62500 },
      { idBoca: 'BOCA001', periodoMes: '2024-02', kwhCompradosMes: 118000, importeCompradoMes: 59000 },
      { idBoca: 'BOCA001', periodoMes: '2024-03', kwhCompradosMes: 132000, importeCompradoMes: 66000 },
      // BOCA002 - Trimestre
      { idBoca: 'BOCA002', periodoMes: '2024-01', kwhCompradosMes: 89000, importeCompradoMes: 44500 },
      { idBoca: 'BOCA002', periodoMes: '2024-02', kwhCompradosMes: 85000, importeCompradoMes: 42500 },
      { idBoca: 'BOCA002', periodoMes: '2024-03', kwhCompradosMes: 92000, importeCompradoMes: 46000 },
      // BOCA003 - Trimestre
      { idBoca: 'BOCA003', periodoMes: '2024-01', kwhCompradosMes: 156000, importeCompradoMes: 78000 },
      { idBoca: 'BOCA003', periodoMes: '2024-02', kwhCompradosMes: 148000, importeCompradoMes: 74000 },
      { idBoca: 'BOCA003', periodoMes: '2024-03', kwhCompradosMes: 162000, importeCompradoMes: 81000 },
    ],
    skipDuplicates: true,
  });

  await prisma.medicionesVenta.createMany({
    data: [
      // Ventas mensuales y bimestrales de ejemplo
      { idBoca: 'BOCA001', periodoMes: '2024-01', kwhVendidosMes: 115000, importeVendidoMes: 75000, tipoFacturacion: 'MENSUAL' },
      { idBoca: 'BOCA001', periodoMes: '2024-02', kwhVendidosMes: 108000, importeVendidoMes: 70000, tipoFacturacion: 'MENSUAL' },
      { idBoca: 'BOCA001', periodoBimestre: '2024-01_2024-02', kwhVendidosBim: 223000, importeVendidoBim: 145000, tipoFacturacion: 'BIMESTRAL' },
      
      { idBoca: 'BOCA002', periodoMes: '2024-01', kwhVendidosMes: 82000, importeVendidoMes: 53000, tipoFacturacion: 'MENSUAL' },
      { idBoca: 'BOCA002', periodoMes: '2024-02', kwhVendidosMes: 78000, importeVendidoMes: 51000, tipoFacturacion: 'MENSUAL' },
      
      { idBoca: 'BOCA003', periodoBimestre: '2024-01_2024-02', kwhVendidosBim: 285000, importeVendidoBim: 185000, tipoFacturacion: 'BIMESTRAL' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed completado exitosamente');
  console.log('👤 Usuario admin: admin@cooperativa.com / admin123');
  console.log('🔑 API Key n8n: secret-key-n8n-2024');
  console.log(`📊 Catálogos: ${segmentos.count} segmentos, ${bocas.count} bocas, ${tiposPoste.count} tipos de poste, ${lineas.count} líneas`);
  console.log('💡 Datos de ejemplo de mediciones cargados para testing');
}

main()
  .catch(e => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

main()
  .catch(e => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });