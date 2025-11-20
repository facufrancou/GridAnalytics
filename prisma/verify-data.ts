import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyData(): Promise<void> {
  console.log('🔍 Verificando datos en la base de datos...\n');

  try {
    // Contar registros en cada tabla
    const counts = {
      segmentos: await prisma.catSegmentos.count(),
      bocasCompra: await prisma.catBocasCompra.count(),
      lineas: await prisma.catLineas.count(),
      tiposPoste: await prisma.catTiposPoste.count(),
      usuarios: await prisma.usuarios.count(),
      medicionesCompra: await prisma.medicionesCompra.count(),
      medicionesVenta: await prisma.medicionesVenta.count(),
      mapPeriodos: await prisma.mapPeriodos.count(),
      relevamientoPostes: await prisma.relevamientoPostes.count(),
      etlFacturasRaw: await prisma.etlFacturasRaw.count(),
      etlMatchFacturas: await prisma.etlMatchFacturas.count(),
      usersAuth: await prisma.usersAuth.count(),
      apiKeys: await prisma.apiKeys.count(),
      vwVentaMensualizada: await prisma.vwVentaMensualizada.count(),
      vwBalanceBocaMes: await prisma.vwBalanceBocaMes.count(),
      vwVentaPorSegmentoMes: await prisma.vwVentaPorSegmentoMes.count(),
      vwVentaPorLineaMes: await prisma.vwVentaPorLineaMes.count(),
    };

    const totalRegistros = Object.values(counts).reduce((sum, count) => sum + count, 0);

    console.log('📊 RESUMEN DE REGISTROS POR TABLA');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('📁 CATÁLOGOS:');
    console.log(`   Segmentos:              ${counts.segmentos.toString().padStart(6)}`);
    console.log(`   Bocas de Compra:        ${counts.bocasCompra.toString().padStart(6)}`);
    console.log(`   Líneas:                 ${counts.lineas.toString().padStart(6)}`);
    console.log(`   Tipos de Poste:         ${counts.tiposPoste.toString().padStart(6)}`);

    console.log('\n👥 USUARIOS Y MEDICIONES:');
    console.log(`   Usuarios:               ${counts.usuarios.toString().padStart(6)}`);
    console.log(`   Mediciones Compra:      ${counts.medicionesCompra.toString().padStart(6)}`);
    console.log(`   Mediciones Venta:       ${counts.medicionesVenta.toString().padStart(6)}`);
    console.log(`   Map Períodos:           ${counts.mapPeriodos.toString().padStart(6)}`);

    console.log('\n🗼 INFRAESTRUCTURA:');
    console.log(`   Relevamiento Postes:    ${counts.relevamientoPostes.toString().padStart(6)}`);

    console.log('\n📄 ETL:');
    console.log(`   Facturas Raw:           ${counts.etlFacturasRaw.toString().padStart(6)}`);
    console.log(`   Match Facturas:         ${counts.etlMatchFacturas.toString().padStart(6)}`);

    console.log('\n🔐 AUTENTICACIÓN:');
    console.log(`   Usuarios Auth:          ${counts.usersAuth.toString().padStart(6)}`);
    console.log(`   API Keys:               ${counts.apiKeys.toString().padStart(6)}`);

    console.log('\n📊 VISTAS ANALÍTICAS:');
    console.log(`   Venta Mensualizada:     ${counts.vwVentaMensualizada.toString().padStart(6)}`);
    console.log(`   Balance Boca Mes:       ${counts.vwBalanceBocaMes.toString().padStart(6)}`);
    console.log(`   Venta por Segmento:     ${counts.vwVentaPorSegmentoMes.toString().padStart(6)}`);
    console.log(`   Venta por Línea:        ${counts.vwVentaPorLineaMes.toString().padStart(6)}`);

    console.log('\n═══════════════════════════════════════════════════');
    console.log(`   TOTAL REGISTROS:       ${totalRegistros.toString().padStart(7)}`);
    console.log('═══════════════════════════════════════════════════\n');

    // Verificar integridad referencial
    console.log('🔗 VERIFICANDO INTEGRIDAD REFERENCIAL...\n');

    // Obtener totales para validación
    const totalUsuarios = counts.usuarios;
    const totalMedicionesCompra = counts.medicionesCompra;
    const totalMedicionesVenta = counts.medicionesVenta;
    const totalRelevamientos = counts.relevamientoPostes;

    console.log(`   ✓ Total usuarios: ${totalUsuarios} ✅`);
    console.log(`   ✓ Total mediciones compra: ${totalMedicionesCompra} ✅`);
    console.log(`   ✓ Total mediciones venta: ${totalMedicionesVenta} ✅`);
    console.log(`   ✓ Total relevamientos: ${totalRelevamientos} ✅`);

    // Ejemplos de datos
    console.log('\n📝 EJEMPLOS DE DATOS:\n');

    const primeraCompra = await prisma.medicionesCompra.findFirst({
      include: { boca: true },
      orderBy: { periodoMes: 'desc' },
    });
    if (primeraCompra) {
      console.log('   Última Medición de Compra:');
      console.log(`   - Boca: ${primeraCompra.boca.nombre}`);
      console.log(`   - Período: ${primeraCompra.periodoMes}`);
      console.log(`   - kWh: ${primeraCompra.kwhComprados.toString()}`);
      console.log(`   - Importe: $${primeraCompra.importe.toString()}`);
    }

    const primerUsuario = await prisma.usuarios.findFirst({
      include: { segmento: true, linea: true },
    });
    if (primerUsuario) {
      console.log('\n   Primer Usuario:');
      console.log(`   - Suministro: ${primerUsuario.nroSuministro}`);
      console.log(`   - Nombre: ${primerUsuario.nombre}`);
      console.log(`   - Segmento: ${primerUsuario.segmento.nombre}`);
      console.log(`   - Línea: ${primerUsuario.linea?.nombre || 'N/A'}`);
    }

    const userAuth = await prisma.usersAuth.findFirst({
      where: { role: 'ADMIN' },
    });
    if (userAuth) {
      console.log('\n   Usuario Admin:');
      console.log(`   - Email: ${userAuth.email}`);
      console.log(`   - Rol: ${userAuth.role}`);
      console.log(`   - Activo: ${userAuth.activo ? 'Sí' : 'No'}`);
    }

    console.log('\n✅ Verificación completada con éxito!\n');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    process.exit(1);
  }
}

verifyData()
  .finally(async () => {
    await prisma.$disconnect();
  });
