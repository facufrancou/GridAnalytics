import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Iniciando seed completo de la base de datos...');

  // 1. Limpiar datos existentes (opcional)
  console.log('🧹 Limpiando datos existentes...');
  await prisma.refreshTokens.deleteMany();
  await prisma.usersAuth.deleteMany();
  await prisma.apiKeys.deleteMany();
  await prisma.etlMatchFacturas.deleteMany();
  await prisma.etlFacturasRaw.deleteMany();
  await prisma.relevamientoPostes.deleteMany();
  await prisma.vwVentaPorLineaMes.deleteMany();
  await prisma.vwVentaPorSegmentoMes.deleteMany();
  await prisma.vwBalanceBocaMes.deleteMany();
  await prisma.vwVentaMensualizada.deleteMany();
  await prisma.medicionesVenta.deleteMany();
  await prisma.medicionesCompra.deleteMany();
  await prisma.usuarios.deleteMany();
  await prisma.mapPeriodos.deleteMany();
  await prisma.catLineas.deleteMany();
  await prisma.catTiposPoste.deleteMany();
  await prisma.catSegmentos.deleteMany();
  await prisma.catBocasCompra.deleteMany();

  // 2. Catálogos base - Segmentos
  console.log('📊 Creando catálogos base...');
  const segmentos = await prisma.catSegmentos.createMany({
    data: [
      { nombre: 'Residencial', codigo: 'RES', activo: true },
      { nombre: 'Comercial', codigo: 'COM', activo: true },
      { nombre: 'Industrial', codigo: 'IND', activo: true },
      { nombre: 'Alumbrado Público', codigo: 'APU', activo: true },
      { nombre: 'Rural', codigo: 'RUR', activo: true },
    ],
  });
  console.log(`✓ Creados ${segmentos.count} segmentos`);

  // 3. Bocas de Compra
  const bocas = await prisma.catBocasCompra.createMany({
    data: [
      { nombre: 'Subestación Centro', proveedor: 'EPRE', activo: true },
      { nombre: 'Subestación Norte', proveedor: 'EPRE', activo: true },
      { nombre: 'Subestación Sur', proveedor: 'CAMMESA', activo: true },
      { nombre: 'Subestación Industrial', proveedor: 'CAMMESA', activo: true },
      { nombre: 'Subestación Rural', proveedor: 'EPRE', activo: true },
    ],
  });
  console.log(`✓ Creadas ${bocas.count} bocas de compra`);

  // 4. Líneas
  const lineas = await prisma.catLineas.createMany({
    data: [
      { nombre: 'Línea Principal Centro', tension: '13.2kV', zona: 'Centro', activo: true },
      { nombre: 'Línea Norte 1', tension: '13.2kV', zona: 'Norte', activo: true },
      { nombre: 'Línea Norte 2', tension: '13.2kV', zona: 'Norte', activo: true },
      { nombre: 'Línea Sur Principal', tension: '13.2kV', zona: 'Sur', activo: true },
      { nombre: 'Línea Industrial', tension: '33kV', zona: 'Parque Industrial', activo: true },
      { nombre: 'Línea Rural Este', tension: '13.2kV', zona: 'Rural', activo: true },
      { nombre: 'Línea Rural Oeste', tension: '13.2kV', zona: 'Rural', activo: true },
    ],
  });
  console.log(`✓ Creadas ${lineas.count} líneas`);

  // 5. Tipos de Poste
  const tiposPoste = await prisma.catTiposPoste.createMany({
    data: [
      { nombre: 'Hormigón 8m', activo: true },
      { nombre: 'Hormigón 10m', activo: true },
      { nombre: 'Hormigón 12m', activo: true },
      { nombre: 'Metálico 8m', activo: true },
      { nombre: 'Metálico 10m', activo: true },
      { nombre: 'Metálico 12m', activo: true },
      { nombre: 'Madera 8m', activo: false }, // Inactivo - en desuso
    ],
  });
  console.log(`✓ Creados ${tiposPoste.count} tipos de poste`);

  // 6. Obtener IDs de catálogos
  const segmentosDb = await prisma.catSegmentos.findMany();
  const lineasDb = await prisma.catLineas.findMany();
  const tiposPosteDb = await prisma.catTiposPoste.findMany();
  const bocasDb = await prisma.catBocasCompra.findMany();

  // 7. Usuarios
  console.log('👥 Creando usuarios...');
  const usuarios = await prisma.usuarios.createMany({
    data: [
      // Residenciales
      { nroSuministro: '10001', nombre: 'Juan Pérez', direccion: 'Av. Principal 123', idSegmento: segmentosDb[0].id, idLinea: lineasDb[0].id, activo: true },
      { nroSuministro: '10002', nombre: 'María González', direccion: 'Calle Central 456', idSegmento: segmentosDb[0].id, idLinea: lineasDb[0].id, activo: true },
      { nroSuministro: '10003', nombre: 'Carlos Rodríguez', direccion: 'Barrio Norte 789', idSegmento: segmentosDb[0].id, idLinea: lineasDb[1].id, activo: true },
      { nroSuministro: '10004', nombre: 'Ana Martínez', direccion: 'Zona Sur 321', idSegmento: segmentosDb[0].id, idLinea: lineasDb[3].id, activo: true },
      { nroSuministro: '10005', nombre: 'Pedro López', direccion: 'Centro 654', idSegmento: segmentosDb[0].id, idLinea: lineasDb[0].id, activo: true },
      
      // Comerciales
      { nroSuministro: '20001', nombre: 'Comercial Norte SA', direccion: 'Zona Norte 100', idSegmento: segmentosDb[1].id, idLinea: lineasDb[1].id, activo: true },
      { nroSuministro: '20002', nombre: 'Supermercado Central', direccion: 'Centro Comercial', idSegmento: segmentosDb[1].id, idLinea: lineasDb[0].id, activo: true },
      { nroSuministro: '20003', nombre: 'Hotel Plaza', direccion: 'Av. Libertador 500', idSegmento: segmentosDb[1].id, idLinea: lineasDb[0].id, activo: true },
      
      // Industriales
      { nroSuministro: '30001', nombre: 'Industrias Metalúrgicas SA', direccion: 'Parque Industrial Lote 5', idSegmento: segmentosDb[2].id, idLinea: lineasDb[4].id, activo: true },
      { nroSuministro: '30002', nombre: 'Fábrica de Alimentos SRL', direccion: 'Parque Industrial Lote 12', idSegmento: segmentosDb[2].id, idLinea: lineasDb[4].id, activo: true },
      
      // Alumbrado Público
      { nroSuministro: '40001', nombre: 'Municipalidad - Alumbrado Centro', direccion: 'Centro Administrativo', idSegmento: segmentosDb[3].id, idLinea: lineasDb[0].id, activo: true },
      { nroSuministro: '40002', nombre: 'Municipalidad - Alumbrado Norte', direccion: 'Centro Administrativo', idSegmento: segmentosDb[3].id, idLinea: lineasDb[1].id, activo: true },
      
      // Rurales
      { nroSuministro: '50001', nombre: 'Estancia La Esperanza', direccion: 'Ruta 5 Km 25', idSegmento: segmentosDb[4].id, idLinea: lineasDb[5].id, activo: true },
      { nroSuministro: '50002', nombre: 'Campo Los Alamos', direccion: 'Ruta 7 Km 15', idSegmento: segmentosDb[4].id, idLinea: lineasDb[6].id, activo: true },
    ],
  });
  console.log(`✓ Creados ${usuarios.count} usuarios`);

  // 8. Mediciones de Compra (últimos 6 meses)
  console.log('⚡ Creando mediciones de compra...');
  const periodosMes = ['2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10'];
  const medicionesCompra = [];
  
  for (const boca of bocasDb) {
    for (const periodo of periodosMes) {
      medicionesCompra.push({
        idBoca: boca.id,
        periodoMes: periodo,
        kwhComprados: Math.floor(Math.random() * 50000 + 80000), // 80k-130k kWh
        importe: Math.floor(Math.random() * 25000 + 40000), // $40k-65k
        fpPromedio: 0.85 + Math.random() * 0.1, // FP entre 0.85 y 0.95
        demandaMaxKw: Math.floor(Math.random() * 500 + 1000), // 1000-1500 kW
        fechaFactura: new Date(`${periodo}-15`),
        observaciones: null,
      });
    }
  }
  
  await prisma.medicionesCompra.createMany({ data: medicionesCompra });
  console.log(`✓ Creadas ${medicionesCompra.length} mediciones de compra`);

  // 9. Mediciones de Venta (últimos 3 bimestres)
  console.log('💰 Creando mediciones de venta...');
  const usuariosDb = await prisma.usuarios.findMany();
  const periodosBimestre = ['2024-05/06', '2024-07/08', '2024-09/10'];
  const medicionesVenta = [];

  for (const usuario of usuariosDb) {
    let lecturaAnterior = 1000 + Math.floor(Math.random() * 5000);
    
    for (const periodo of periodosBimestre) {
      const consumoBimestral = Math.floor(Math.random() * 800 + 200); // 200-1000 kWh
      const lecturaActual = lecturaAnterior + consumoBimestral;
      
      medicionesVenta.push({
        idUsuario: usuario.id,
        periodoBimestre: periodo,
        kwhVendidosBim: consumoBimestral,
        importe: consumoBimestral * (1.2 + Math.random() * 0.3), // Tarifa variable
        lectIni: lecturaAnterior,
        lectFin: lecturaActual,
        fechaFactura: new Date(`2024-${periodo.split('/')[1]}-20`),
        observaciones: null,
      });
      
      lecturaAnterior = lecturaActual;
    }
  }
  
  await prisma.medicionesVenta.createMany({ data: medicionesVenta });
  console.log(`✓ Creadas ${medicionesVenta.length} mediciones de venta`);

  // 10. Map Periodos
  console.log('📅 Creando mapeo de períodos...');
  const mapPeriodos = [];
  
  // Períodos mensuales
  for (let mes = 1; mes <= 10; mes++) {
    const mesStr = mes.toString().padStart(2, '0');
    const inicio = new Date(`2024-${mesStr}-01`);
    const fin = new Date(2024, mes, 0); // Último día del mes
    const dias = fin.getDate();
    
    mapPeriodos.push({
      fechaInicio: inicio,
      fechaFin: fin,
      tipo: 'MENSUAL',
      claveNormalizada: `2024-${mesStr}`,
      diasPeriodo: dias,
    });
  }
  
  // Períodos bimestrales
  for (let bim = 0; bim < 5; bim++) {
    const mes1 = bim * 2 + 1;
    const mes2 = mes1 + 1;
    const mes1Str = mes1.toString().padStart(2, '0');
    const mes2Str = mes2.toString().padStart(2, '0');
    const inicio = new Date(`2024-${mes1Str}-01`);
    const fin = new Date(2024, mes2, 0);
    const dias = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    
    mapPeriodos.push({
      fechaInicio: inicio,
      fechaFin: fin,
      tipo: 'BIMESTRAL',
      claveNormalizada: `2024-${mes1Str}/${mes2Str}`,
      diasPeriodo: dias,
    });
  }
  
  await prisma.mapPeriodos.createMany({ data: mapPeriodos });
  console.log(`✓ Creados ${mapPeriodos.length} períodos`);

  // 11. Relevamiento de Postes
  console.log('🗼 Creando relevamientos de postes...');
  const relevamientos = [];
  const estados = ['Bueno', 'Regular', 'Malo', 'A reemplazar'];
  
  for (const linea of lineasDb.slice(0, 5)) { // Solo primeras 5 líneas
    const cantPostes = Math.floor(Math.random() * 20 + 10); // 10-30 postes por línea
    
    for (let i = 0; i < cantPostes; i++) {
      relevamientos.push({
        idLinea: linea.id,
        idPosteType: tiposPosteDb[Math.floor(Math.random() * (tiposPosteDb.length - 1))].id, // Excluir el inactivo
        lat: -34.5 + Math.random() * 0.5, // Coordenadas ficticias
        lng: -58.5 + Math.random() * 0.5,
        estado: estados[Math.floor(Math.random() * estados.length)],
        observaciones: Math.random() > 0.7 ? 'Requiere mantenimiento preventivo' : null,
        fechaRelevamiento: new Date('2024-10-15'),
      });
    }
  }
  
  await prisma.relevamientoPostes.createMany({ data: relevamientos });
  console.log(`✓ Creados ${relevamientos.length} relevamientos de postes`);

  // 12. ETL - Facturas Raw
  console.log('📄 Creando datos ETL de ejemplo...');
  const etlRaw = [];
  const fuentes = ['CAMMESA', 'EPRE', 'UPLOAD_CSV'];
  
  for (let i = 0; i < 20; i++) {
    const fuente = fuentes[Math.floor(Math.random() * fuentes.length)];
    const hashDoc = crypto.createHash('sha256').update(`doc-${i}-${Date.now()}`).digest('hex');
    
    etlRaw.push({
      fuente,
      archivo: `factura_${fuente}_${i + 1}.pdf`,
      campo: 'energia_consumida',
      valor: (Math.random() * 10000 + 5000).toFixed(2),
      conf: { confianza: Math.random(), metodo: 'OCR' },
      hashDoc,
    });
    
    etlRaw.push({
      fuente,
      archivo: `factura_${fuente}_${i + 1}.pdf`,
      campo: 'importe_total',
      valor: (Math.random() * 5000 + 2500).toFixed(2),
      conf: { confianza: Math.random(), metodo: 'OCR' },
      hashDoc,
    });
  }
  
  await prisma.etlFacturasRaw.createMany({ data: etlRaw });
  console.log(`✓ Creados ${etlRaw.length} registros ETL raw`);

  // 13. ETL - Match Facturas
  const etlRawDb = await prisma.etlFacturasRaw.findMany({ take: 10 });
  const etlMatch = etlRawDb.map((raw, idx) => ({
    idRaw: raw.id,
    campoNormalizado: raw.campo === 'energia_consumida' ? 'kwh_vendidos' : 'importe',
    valorNormalizado: raw.valor,
    entidadDestino: 'mediciones_venta',
    procesado: idx % 3 === 0, // 1 de cada 3 procesado
  }));
  
  await prisma.etlMatchFacturas.createMany({ data: etlMatch });
  console.log(`✓ Creados ${etlMatch.length} registros ETL match`);

  // 14. Usuarios de Autenticación
  console.log('🔐 Creando usuarios de autenticación...');
  const adminPassword = await argon2.hash('admin123');
  const operadorPassword = await argon2.hash('operador123');
  const viewerPassword = await argon2.hash('viewer123');

  const adminUser = await prisma.usersAuth.create({
    data: {
      email: 'admin@cooperativa.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      name: 'Administrador del Sistema',
      activo: true,
    },
  });

  const operadorUser = await prisma.usersAuth.create({
    data: {
      email: 'operador@cooperativa.com',
      passwordHash: operadorPassword,
      role: 'OPERADOR',
      name: 'Operador de Red',
      activo: true,
    },
  });

  const viewerUser = await prisma.usersAuth.create({
    data: {
      email: 'viewer@cooperativa.com',
      passwordHash: viewerPassword,
      role: 'VIEWER',
      name: 'Consultor',
      activo: true,
    },
  });
  
  console.log('✓ Creados 3 usuarios de autenticación');

  // 15. API Keys
  console.log('🔑 Creando API keys...');
  const n8nKeyHash = await argon2.hash('n8n-secret-key-2024');
  const powerBiKeyHash = await argon2.hash('powerbi-secret-key-2024');

  await prisma.apiKeys.createMany({
    data: [
      {
        name: 'n8n-integration',
        keyHash: n8nKeyHash,
        scopes: ['etl:write', 'mediciones:write'],
        activo: true,
      },
      {
        name: 'powerbi-dashboard',
        keyHash: powerBiKeyHash,
        scopes: ['analytics:read', 'mediciones:read'],
        activo: true,
      },
      {
        name: 'mobile-app-dev',
        keyHash: await argon2.hash('mobile-dev-key-2024'),
        scopes: ['usuarios:read', 'mediciones:read'],
        activo: false, // Key de desarrollo inactiva
      },
    ],
  });
  console.log('✓ Creadas 3 API keys');

  // 16. Vistas materializadas (simuladas)
  console.log('📊 Creando datos de vistas analíticas...');
  
  // VW Venta Mensualizada
  const ventaMensualizada = [];
  for (const usuario of usuariosDb.slice(0, 10)) { // Primeros 10 usuarios
    for (const periodo of periodosMes) {
      ventaMensualizada.push({
        idUsuario: usuario.id,
        nroSuministro: usuario.nroSuministro,
        periodoMes: periodo,
        kwhVendidosMes: Math.floor(Math.random() * 400 + 100),
        importeMes: Math.floor(Math.random() * 500 + 150),
        idSegmento: usuario.idSegmento,
        idLinea: usuario.idLinea,
        fechaCalculo: new Date(),
      });
    }
  }
  await prisma.vwVentaMensualizada.createMany({ data: ventaMensualizada });
  console.log(`✓ Creados ${ventaMensualizada.length} registros de venta mensualizada`);

  // VW Balance Boca Mes
  const balanceBoca = [];
  for (const boca of bocasDb) {
    for (const periodo of periodosMes) {
      const compra = Math.floor(Math.random() * 50000 + 80000);
      const venta = Math.floor(compra * (0.85 + Math.random() * 0.1)); // 85-95% de la compra
      const perdida = compra - venta;
      const perdidaPct = (perdida / compra) * 100;
      
      balanceBoca.push({
        idBoca: boca.id,
        periodoMes: periodo,
        compraKwh: compra,
        ventaKwh: venta,
        perdidaKwh: perdida,
        perdidaPct,
        fechaCalculo: new Date(),
      });
    }
  }
  await prisma.vwBalanceBocaMes.createMany({ data: balanceBoca });
  console.log(`✓ Creados ${balanceBoca.length} registros de balance por boca`);

  // VW Venta Por Segmento Mes
  const ventaSegmento = [];
  for (const segmento of segmentosDb) {
    for (const periodo of periodosMes) {
      const totalKwh = Math.floor(Math.random() * 20000 + 10000);
      ventaSegmento.push({
        idSegmento: segmento.id,
        periodoMes: periodo,
        totalKwh,
        totalImporte: totalKwh * (1.2 + Math.random() * 0.3),
        cantUsuarios: Math.floor(Math.random() * 50 + 10),
        pctParticipacion: Math.random() * 30 + 5,
        fechaCalculo: new Date(),
      });
    }
  }
  await prisma.vwVentaPorSegmentoMes.createMany({ data: ventaSegmento });
  console.log(`✓ Creados ${ventaSegmento.length} registros de venta por segmento`);

  // VW Venta Por Línea Mes
  const ventaLinea = [];
  for (const linea of lineasDb) {
    for (const periodo of periodosMes) {
      const totalKwh = Math.floor(Math.random() * 15000 + 5000);
      ventaLinea.push({
        idLinea: linea.id,
        periodoMes: periodo,
        totalKwh,
        totalImporte: totalKwh * (1.2 + Math.random() * 0.3),
        cantUsuarios: Math.floor(Math.random() * 30 + 5),
        fechaCalculo: new Date(),
      });
    }
  }
  await prisma.vwVentaPorLineaMes.createMany({ data: ventaLinea });
  console.log(`✓ Creados ${ventaLinea.length} registros de venta por línea`);

  // Resumen final
  console.log('\n✅ ========================================');
  console.log('✅ Seed completo finalizado exitosamente!');
  console.log('✅ ========================================\n');
  
  console.log('📊 RESUMEN DE DATOS CARGADOS:');
  console.log('─────────────────────────────────────');
  console.log(`📁 Catálogos:`);
  console.log(`   • ${segmentos.count} Segmentos`);
  console.log(`   • ${bocas.count} Bocas de Compra`);
  console.log(`   • ${lineas.count} Líneas`);
  console.log(`   • ${tiposPoste.count} Tipos de Poste`);
  console.log(`\n👥 Usuarios: ${usuarios.count}`);
  console.log(`⚡ Mediciones de Compra: ${medicionesCompra.length}`);
  console.log(`💰 Mediciones de Venta: ${medicionesVenta.length}`);
  console.log(`📅 Períodos mapeados: ${mapPeriodos.length}`);
  console.log(`🗼 Relevamientos de postes: ${relevamientos.length}`);
  console.log(`📄 Registros ETL: ${etlRaw.length + etlMatch.length}`);
  console.log(`\n🔐 USUARIOS DE AUTENTICACIÓN:`);
  console.log('─────────────────────────────────────');
  console.log('   👤 admin@cooperativa.com / admin123 (ADMIN)');
  console.log('   👤 operador@cooperativa.com / operador123 (OPERADOR)');
  console.log('   👤 viewer@cooperativa.com / viewer123 (VIEWER)');
  console.log(`\n🔑 API KEYS:`);
  console.log('─────────────────────────────────────');
  console.log('   🔑 n8n-integration: n8n-secret-key-2024');
  console.log('   🔑 powerbi-dashboard: powerbi-secret-key-2024');
  console.log('   🔑 mobile-app-dev: mobile-dev-key-2024 (INACTIVA)');
  console.log('\n📊 Vistas analíticas con datos de prueba generados');
  console.log('✓ Base de datos lista para testing de endpoints\n');
}

main()
  .catch(e => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
