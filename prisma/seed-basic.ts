import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Iniciando seed básico...');

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

    // 5. Crear usuario administrador
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

    // 6. Crear algunos usuarios básicos
    console.log('👥 Creando usuarios de ejemplo...');
    const segmentos = await prisma.catSegmentos.findMany();
    const lineas = await prisma.catLineas.findMany();

    if (segmentos.length > 0 && lineas.length > 0) {
      await prisma.usuarios.createMany({
        data: [
          {
            nroSuministro: '100001',
            nombre: 'Juan Pérez',
            direccion: 'Av. Principal 123',
            idSegmento: segmentos[0].id,
            idLinea: lineas[0].id,
          },
          {
            nroSuministro: '100002',
            nombre: 'María González',
            direccion: 'Calle Central 456',
            idSegmento: segmentos[0].id,
            idLinea: lineas[0].id,
          },
          {
            nroSuministro: '200001',
            nombre: 'Comercial Norte SA',
            direccion: 'Zona Norte 789',
            idSegmento: segmentos[1]?.id || segmentos[0].id,
            idLinea: lineas[1]?.id || lineas[0].id,
          },
        ],
        skipDuplicates: true,
      });
    }

    console.log('✅ Seed básico completado exitosamente!');
    console.log('');
    console.log('🎯 Credenciales de acceso:');
    console.log('👤 Usuario admin: admin@cooperativa.com');
    console.log('🔐 Password: admin123');
    console.log('');
    console.log('📊 Datos creados:');
    console.log('- 5 segmentos de usuarios');
    console.log('- 5 bocas de compra');
    console.log('- 6 tipos de poste');
    console.log('- 7 líneas eléctricas');
    console.log('- 3 usuarios de ejemplo');
    console.log('');
    console.log('🚀 Ahora puedes probar el servidor con: npm run dev');

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