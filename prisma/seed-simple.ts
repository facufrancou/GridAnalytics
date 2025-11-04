import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Iniciando seed de la base de datos...');

  try {
    // 1. Crear segmentos
    console.log('📊 Creando segmentos...');
    await prisma.catSegmentos.createMany({
      data: [
        { nombre: 'Residencial', codigo: 'RES' },
        { nombre: 'Comercial', codigo: 'COM' },
        { nombre: 'Industrial', codigo: 'IND' },
        { nombre: 'Alumbrado Público', codigo: 'APU' },
        { nombre: 'Rural', codigo: 'RUR' },
      ],
      skipDuplicates: true,
    });

    // 2. Crear bocas de compra
    console.log('🔌 Creando bocas de compra...');
    await prisma.catBocasCompra.createMany({
      data: [
        { nombre: 'Subestación Centro', proveedor: 'CAMMESA' },
        { nombre: 'Subestación Norte', proveedor: 'CAMMESA' },
        { nombre: 'Subestación Sur', proveedor: 'EDEA' },
        { nombre: 'Subestación Industrial', proveedor: 'EDEA' },
        { nombre: 'Subestación Rural', proveedor: 'COOPERATIVA' },
      ],
      skipDuplicates: true,
    });

    // 3. Crear tipos de poste
    console.log('🏗️ Creando tipos de poste...');
    await prisma.catTiposPoste.createMany({
      data: [
        { nombre: 'Hormigón 8m' },
        { nombre: 'Hormigón 10m' },
        { nombre: 'Hormigón 12m' },
        { nombre: 'Metálico 8m' },
        { nombre: 'Metálico 10m' },
        { nombre: 'Metálico 12m' },
      ],
      skipDuplicates: true,
    });

    // 4. Crear líneas
    console.log('⚡ Creando líneas...');
    await prisma.catLineas.createMany({
      data: [
        { nombre: 'Línea Principal Centro', tension: '13.2kV', zona: 'Centro' },
        { nombre: 'Línea Norte 1', tension: '13.2kV', zona: 'Norte' },
        { nombre: 'Línea Norte 2', tension: '13.2kV', zona: 'Norte' },
        { nombre: 'Línea Sur Principal', tension: '13.2kV', zona: 'Sur' },
        { nombre: 'Línea Industrial', tension: '13.2kV', zona: 'Industrial' },
        { nombre: 'Línea Rural Este', tension: '13.2kV', zona: 'Rural' },
        { nombre: 'Línea Rural Oeste', tension: '13.2kV', zona: 'Rural' },
      ],
      skipDuplicates: true,
    });

    // 5. Obtener IDs creados para referencias
    const segmentos = await prisma.catSegmentos.findMany();
    const lineas = await prisma.catLineas.findMany();

    // 6. Crear usuario administrador
    console.log('👤 Creando usuario administrador...');
    const adminPassword = await argon2.hash('admin123');
    await prisma.usersAuth.upsert({
      where: { email: 'admin@cooperativa.com' },
      update: {},
      create: {
        email: 'admin@cooperativa.com',
        passwordHash: adminPassword,
        role: 'admin',
        name: 'Administrador del Sistema',
      },
    });

    // 7. Crear API Key para n8n
    console.log('🔑 Creando API Key para n8n...');
    await prisma.apiKeys.upsert({
      where: { name: 'n8n-integration' },
      update: {},
      create: {
        name: 'n8n-integration',
        keyHash: await argon2.hash('secret-key-n8n-2024'),
        scopes: ['etl:compra', 'etl:venta', 'etl:usuarios'],
      },
    });

    // 8. Crear usuarios de ejemplo
    console.log('👥 Creando usuarios de ejemplo...');
    if (segmentos.length > 0 && lineas.length > 0) {
      await prisma.usuarios.createMany({
        data: [
          {
            nroSuministro: '100001',
            nombre: 'Juan Pérez',
            direccion: 'Av. Principal 123',
            idSegmento: segmentos.find(s => s.codigo === 'RES')?.id || segmentos[0].id,
            idLinea: lineas.find(l => l.zona === 'Centro')?.id || lineas[0].id,
          },
          {
            nroSuministro: '100002',
            nombre: 'María González',
            direccion: 'Calle Central 456',
            idSegmento: segmentos.find(s => s.codigo === 'RES')?.id || segmentos[0].id,
            idLinea: lineas.find(l => l.zona === 'Centro')?.id || lineas[0].id,
          },
          {
            nroSuministro: '200001',
            nombre: 'Comercial Norte SA',
            direccion: 'Zona Norte 789',
            idSegmento: segmentos.find(s => s.codigo === 'COM')?.id || segmentos[1]?.id || segmentos[0].id,
            idLinea: lineas.find(l => l.zona === 'Norte')?.id || lineas[1]?.id || lineas[0].id,
          },
          {
            nroSuministro: '300001',
            nombre: 'Industrias del Sur',
            direccion: 'Parque Industrial lote 5',
            idSegmento: segmentos.find(s => s.codigo === 'IND')?.id || segmentos[2]?.id || segmentos[0].id,
            idLinea: lineas.find(l => l.zona === 'Industrial')?.id || lineas[4]?.id || lineas[0].id,
          },
          {
            nroSuministro: '400001',
            nombre: 'Municipalidad - Alumbrado',
            direccion: 'Centro administrativo',
            idSegmento: segmentos.find(s => s.codigo === 'APU')?.id || segmentos[3]?.id || segmentos[0].id,
            idLinea: lineas.find(l => l.zona === 'Centro')?.id || lineas[0].id,
          },
        ],
        skipDuplicates: true,
      });
    }

    // 9. Crear algunos datos de mediciones de ejemplo
    console.log('📈 Creando datos de mediciones de ejemplo...');
    const bocas = await prisma.catBocasCompra.findMany();
    
    if (bocas.length > 0) {
      // Mediciones de compra
      await prisma.medicionesCompra.createMany({
        data: [
          { idBoca: bocas[0].id, periodoMes: '2024-01', kwhComprados: 125000, importe: 62500 },
          { idBoca: bocas[0].id, periodoMes: '2024-02', kwhComprados: 118000, importe: 59000 },
          { idBoca: bocas[0].id, periodoMes: '2024-03', kwhComprados: 132000, importe: 66000 },
          { idBoca: bocas[1]?.id || bocas[0].id, periodoMes: '2024-01', kwhComprados: 89000, importe: 44500 },
          { idBoca: bocas[1]?.id || bocas[0].id, periodoMes: '2024-02', kwhComprados: 85000, importe: 42500 },
          { idBoca: bocas[1]?.id || bocas[0].id, periodoMes: '2024-03', kwhComprados: 92000, importe: 46000 },
        ],
        skipDuplicates: true,
      });

      // Usuarios para mediciones de venta
      const usuarios = await prisma.usuarios.findMany();
      if (usuarios.length > 0) {
        await prisma.medicionesVenta.createMany({
          data: [
            { idUsuario: usuarios[0].id, periodoMes: '2024-01', kwhVendidos: 850, importe: 1200 },
            { idUsuario: usuarios[0].id, periodoMes: '2024-02', kwhVendidos: 780, importe: 1100 },
            { idUsuario: usuarios[1]?.id || usuarios[0].id, periodoMes: '2024-01', kwhVendidos: 920, importe: 1300 },
            { idUsuario: usuarios[1]?.id || usuarios[0].id, periodoMes: '2024-02', kwhVendidos: 880, importe: 1250 },
            { idUsuario: usuarios[2]?.id || usuarios[0].id, periodoBimestre: '2024-01_2024-02', kwhVendidosBim: 15000, importe: 18000 },
            { idUsuario: usuarios[3]?.id || usuarios[0].id, periodoMes: '2024-01', kwhVendidos: 45000, importe: 52000 },
          ],
          skipDuplicates: true,
        });
      }
    }

    // 10. Crear mapeo de períodos
    console.log('📅 Creando mapeo de períodos...');
    await prisma.mapPeriodos.createMany({
      data: [
        {
          fechaInicio: new Date('2024-01-01'),
          fechaFin: new Date('2024-01-31'),
          tipo: 'MENSUAL',
          claveNormalizada: '2024-01',
          diasPeriodo: 31,
        },
        {
          fechaInicio: new Date('2024-02-01'),
          fechaFin: new Date('2024-02-29'),
          tipo: 'MENSUAL',
          claveNormalizada: '2024-02',
          diasPeriodo: 29,
        },
        {
          fechaInicio: new Date('2024-03-01'),
          fechaFin: new Date('2024-03-31'),
          tipo: 'MENSUAL',
          claveNormalizada: '2024-03',
          diasPeriodo: 31,
        },
        {
          fechaInicio: new Date('2024-01-01'),
          fechaFin: new Date('2024-02-29'),
          tipo: 'BIMESTRAL',
          claveNormalizada: '2024-01_2024-02',
          diasPeriodo: 60,
        },
      ],
      skipDuplicates: true,
    });

    console.log('✅ Seed completado exitosamente!');
    console.log('');
    console.log('🎯 Credenciales de acceso:');
    console.log('👤 Usuario admin: admin@cooperativa.com');
    console.log('🔐 Password: admin123');
    console.log('🔑 API Key n8n: secret-key-n8n-2024');
    console.log('');
    console.log('📊 Datos creados:');
    console.log('- 5 segmentos de usuarios');
    console.log('- 5 bocas de compra');
    console.log('- 6 tipos de poste');
    console.log('- 7 líneas eléctricas');
    console.log('- 5 usuarios de ejemplo');
    console.log('- Mediciones de compra y venta de ejemplo');
    console.log('- Mapeo de períodos 2024');
    console.log('');
    console.log('🌐 Prisma Studio disponible en: http://localhost:5555');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  }
}

main()
  .catch(e => {
    console.error('❌ Error crítico:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });