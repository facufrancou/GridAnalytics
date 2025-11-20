-- Queries útiles para explorar los datos de prueba en GridAnalytics
-- Ejecuta estas queries en Prisma Studio o directamente en PostgreSQL

-- ============================================
-- RESUMEN GENERAL
-- ============================================

-- Contar registros en todas las tablas principales
SELECT 
    'Segmentos' as tabla, COUNT(*) as registros FROM cat_segmentos
UNION ALL
SELECT 'Bocas Compra', COUNT(*) FROM cat_bocas_compra
UNION ALL
SELECT 'Líneas', COUNT(*) FROM cat_lineas
UNION ALL
SELECT 'Tipos Poste', COUNT(*) FROM cat_tipos_poste
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM usuarios
UNION ALL
SELECT 'Mediciones Compra', COUNT(*) FROM mediciones_compra
UNION ALL
SELECT 'Mediciones Venta', COUNT(*) FROM mediciones_venta
UNION ALL
SELECT 'Relevamiento Postes', COUNT(*) FROM relevamiento_postes
ORDER BY registros DESC;

-- ============================================
-- USUARIOS Y SEGMENTOS
-- ============================================

-- Ver todos los usuarios con su segmento y línea
SELECT 
    u.nro_suministro,
    u.nombre,
    s.nombre as segmento,
    s.codigo as codigo_segmento,
    l.nombre as linea,
    u.activo
FROM usuarios u
JOIN cat_segmentos s ON u.id_segmento = s.id_segmento
LEFT JOIN cat_lineas l ON u.id_linea = l.id_linea
ORDER BY s.codigo, u.nro_suministro;

-- Cantidad de usuarios por segmento
SELECT 
    s.nombre as segmento,
    s.codigo,
    COUNT(*) as cantidad_usuarios,
    COUNT(CASE WHEN u.activo THEN 1 END) as activos,
    COUNT(CASE WHEN NOT u.activo THEN 1 END) as inactivos
FROM cat_segmentos s
LEFT JOIN usuarios u ON s.id_segmento = u.id_segmento
GROUP BY s.id_segmento, s.nombre, s.codigo
ORDER BY cantidad_usuarios DESC;

-- ============================================
-- MEDICIONES DE COMPRA
-- ============================================

-- Últimas mediciones de compra por boca
SELECT 
    b.nombre as boca,
    b.proveedor,
    mc.periodo_mes,
    mc.kwh_comprados,
    mc.importe,
    mc.fp_promedio as factor_potencia,
    mc.demanda_max_kw
FROM mediciones_compra mc
JOIN cat_bocas_compra b ON mc.id_boca = b.id_boca
ORDER BY mc.periodo_mes DESC, b.nombre
LIMIT 20;

-- Total de compras por boca (últimos 6 meses)
SELECT 
    b.nombre as boca,
    COUNT(*) as num_mediciones,
    SUM(mc.kwh_comprados) as total_kwh,
    ROUND(AVG(mc.kwh_comprados), 2) as promedio_kwh,
    SUM(mc.importe) as total_importe,
    ROUND(AVG(mc.fp_promedio), 3) as fp_promedio
FROM cat_bocas_compra b
JOIN mediciones_compra mc ON b.id_boca = mc.id_boca
GROUP BY b.id_boca, b.nombre
ORDER BY total_kwh DESC;

-- ============================================
-- MEDICIONES DE VENTA
-- ============================================

-- Ver mediciones de venta con detalles del usuario
SELECT 
    u.nro_suministro,
    u.nombre as usuario,
    s.nombre as segmento,
    mv.periodo_bimestre,
    mv.kwh_vendidos_bim,
    mv.importe,
    mv.lect_ini,
    mv.lect_fin,
    (mv.lect_fin - mv.lect_ini) as consumo_calculado
FROM mediciones_venta mv
JOIN usuarios u ON mv.id_usuario = u.id_usuario
JOIN cat_segmentos s ON u.id_segmento = s.id_segmento
ORDER BY mv.periodo_bimestre DESC, s.codigo, u.nro_suministro
LIMIT 30;

-- Consumo total por segmento
SELECT 
    s.nombre as segmento,
    COUNT(DISTINCT mv.id_usuario) as usuarios,
    COUNT(*) as num_facturas,
    SUM(mv.kwh_vendidos_bim) as total_kwh_vendidos,
    SUM(mv.importe) as total_facturado,
    ROUND(AVG(mv.kwh_vendidos_bim), 2) as promedio_kwh_por_factura
FROM cat_segmentos s
JOIN usuarios u ON s.id_segmento = u.id_segmento
JOIN mediciones_venta mv ON u.id_usuario = mv.id_usuario
GROUP BY s.id_segmento, s.nombre
ORDER BY total_kwh_vendidos DESC;

-- ============================================
-- BALANCE ENERGÉTICO
-- ============================================

-- Balance mensual por boca (compra vs venta)
SELECT 
    vbb.periodo_mes,
    b.nombre as boca,
    vbb.compra_kwh,
    vbb.venta_kwh,
    vbb.perdida_kwh,
    vbb.perdida_pct as perdida_porcentaje
FROM vw_balance_boca_mes vbb
JOIN cat_bocas_compra b ON vbb.id_boca = b.id_boca
ORDER BY vbb.periodo_mes DESC, b.nombre;

-- Resumen de pérdidas por boca
SELECT 
    b.nombre as boca,
    COUNT(*) as periodos,
    ROUND(AVG(vbb.compra_kwh), 2) as promedio_compra,
    ROUND(AVG(vbb.venta_kwh), 2) as promedio_venta,
    ROUND(AVG(vbb.perdida_kwh), 2) as promedio_perdida,
    ROUND(AVG(vbb.perdida_pct), 2) as promedio_perdida_pct
FROM vw_balance_boca_mes vbb
JOIN cat_bocas_compra b ON vbb.id_boca = b.id_boca
GROUP BY b.id_boca, b.nombre
ORDER BY promedio_perdida_pct DESC;

-- ============================================
-- VISTAS ANALÍTICAS
-- ============================================

-- Venta mensualizada por usuario (últimos meses)
SELECT 
    vm.periodo_mes,
    u.nro_suministro,
    u.nombre as usuario,
    s.nombre as segmento,
    vm.kwh_vendidos_mes,
    vm.importe_mes
FROM vw_venta_mensualizada vm
JOIN usuarios u ON vm.id_usuario = u.id_usuario
JOIN cat_segmentos s ON u.id_segmento = s.id_segmento
WHERE vm.periodo_mes >= '2024-08'
ORDER BY vm.periodo_mes DESC, s.codigo, u.nro_suministro
LIMIT 30;

-- Venta por segmento mensual
SELECT 
    vps.periodo_mes,
    s.nombre as segmento,
    vps.total_kwh,
    vps.total_importe,
    vps.cant_usuarios,
    vps.pct_participacion
FROM vw_venta_por_segmento_mes vps
JOIN cat_segmentos s ON vps.id_segmento = s.id_segmento
ORDER BY vps.periodo_mes DESC, vps.total_kwh DESC;

-- Venta por línea mensual
SELECT 
    vpl.periodo_mes,
    l.nombre as linea,
    l.zona,
    vpl.total_kwh,
    vpl.total_importe,
    vpl.cant_usuarios
FROM vw_venta_por_linea_mes vpl
JOIN cat_lineas l ON vpl.id_linea = l.id_linea
ORDER BY vpl.periodo_mes DESC, vpl.total_kwh DESC;

-- ============================================
-- INFRAESTRUCTURA
-- ============================================

-- Relevamiento de postes por línea y estado
SELECT 
    l.nombre as linea,
    l.zona,
    tp.nombre as tipo_poste,
    rp.estado,
    COUNT(*) as cantidad
FROM relevamiento_postes rp
JOIN cat_lineas l ON rp.id_linea = l.id_linea
JOIN cat_tipos_poste tp ON rp.id_poste_tipo = tp.id_poste_tipo
GROUP BY l.nombre, l.zona, tp.nombre, rp.estado
ORDER BY l.nombre, cantidad DESC;

-- Resumen de estado de postes por línea
SELECT 
    l.nombre as linea,
    COUNT(*) as total_postes,
    COUNT(CASE WHEN rp.estado = 'Bueno' THEN 1 END) as buenos,
    COUNT(CASE WHEN rp.estado = 'Regular' THEN 1 END) as regulares,
    COUNT(CASE WHEN rp.estado = 'Malo' THEN 1 END) as malos,
    COUNT(CASE WHEN rp.estado = 'A reemplazar' THEN 1 END) as a_reemplazar
FROM cat_lineas l
LEFT JOIN relevamiento_postes rp ON l.id_linea = rp.id_linea
GROUP BY l.id_linea, l.nombre
ORDER BY total_postes DESC;

-- ============================================
-- ETL
-- ============================================

-- Registros ETL raw por fuente
SELECT 
    fuente,
    COUNT(*) as total_registros,
    COUNT(DISTINCT hash_doc) as documentos_unicos,
    COUNT(DISTINCT campo) as campos_diferentes
FROM etl_facturas_raw
GROUP BY fuente
ORDER BY total_registros DESC;

-- ETL match por entidad destino y estado
SELECT 
    entidad_destino,
    procesado,
    COUNT(*) as cantidad
FROM etl_match_facturas
GROUP BY entidad_destino, procesado
ORDER BY entidad_destino, procesado;

-- ============================================
-- AUTENTICACIÓN
-- ============================================

-- Usuarios de autenticación
SELECT 
    email,
    role as rol,
    name as nombre,
    activo,
    last_login as ultimo_login,
    created_at as creado
FROM users_auth
ORDER BY role, email;

-- API Keys activas
SELECT 
    name as nombre,
    scopes as permisos,
    activo,
    last_used as ultimo_uso,
    created_at as creada
FROM api_keys
ORDER BY activo DESC, name;

-- ============================================
-- PERIODOS
-- ============================================

-- Mapa de períodos disponibles
SELECT 
    tipo,
    clave_normalizada,
    fecha_inicio,
    fecha_fin,
    dias_periodo
FROM map_periodos
ORDER BY tipo, fecha_inicio;
