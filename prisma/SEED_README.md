# Scripts de Seed - GridAnalytics

Este directorio contiene scripts para poblar la base de datos con datos de prueba.

## 📋 Scripts Disponibles

### `seed-complete.ts` - Seed Completo (RECOMENDADO para testing)

Script completo que carga **todas las tablas** con datos ficticios realistas para probar todos los endpoints.

#### 🎯 Datos que carga:

**Catálogos Base:**
- ✅ 5 Segmentos (Residencial, Comercial, Industrial, Alumbrado Público, Rural)
- ✅ 5 Bocas de Compra
- ✅ 7 Líneas de distribución
- ✅ 7 Tipos de Poste

**Usuarios y Mediciones:**
- ✅ 14 Usuarios (distribución por segmentos)
- ✅ 30 Mediciones de Compra (6 meses x 5 bocas)
- ✅ 42 Mediciones de Venta (3 bimestres x 14 usuarios)
- ✅ 15 Mapeos de Períodos (mensuales y bimestrales)

**Infraestructura:**
- ✅ ~80 Relevamientos de Postes (distribución por líneas)

**ETL:**
- ✅ 40 Registros ETL Raw (facturas)
- ✅ 10 Registros ETL Match

**Autenticación:**
- ✅ 3 Usuarios de autenticación (admin, operador, viewer)
- ✅ 3 API Keys (n8n, powerbi, mobile-dev)

**Vistas Analíticas:**
- ✅ 60 Registros de Venta Mensualizada
- ✅ 30 Registros de Balance por Boca
- ✅ 30 Registros de Venta por Segmento
- ✅ 42 Registros de Venta por Línea

#### 📊 Total: ~400 registros en todas las tablas

---

## 🚀 Uso

### Opción 1: Seed Completo (recomendado)

```bash
# Ejecutar el seed completo
npm run db:seed:complete
```

Este script:
1. **Limpia** todos los datos existentes
2. Carga datos en **TODAS** las tablas
3. Genera datos **relacionados** correctamente (con FKs válidas)
4. Usa valores **realistas** para pruebas

### Opción 2: Seed Simple (legacy)

```bash
# Ejecutar el seed original
npm run db:seed
```

---

## 🔐 Credenciales de Prueba

### Usuarios de Autenticación

| Email | Contraseña | Rol | Descripción |
|-------|-----------|-----|-------------|
| `admin@cooperativa.com` | `admin123` | ADMIN | Acceso completo al sistema |
| `operador@cooperativa.com` | `operador123` | OPERADOR | Operaciones de red |
| `viewer@cooperativa.com` | `viewer123` | VIEWER | Solo consultas |

### API Keys

| Nombre | Key | Scopes | Estado |
|--------|-----|--------|--------|
| `n8n-integration` | `n8n-secret-key-2024` | etl:write, mediciones:write | ✅ Activa |
| `powerbi-dashboard` | `powerbi-secret-key-2024` | analytics:read, mediciones:read | ✅ Activa |
| `mobile-app-dev` | `mobile-dev-key-2024` | usuarios:read, mediciones:read | ❌ Inactiva |

---

## 🧪 Testing de Endpoints

Con el seed completo puedes probar:

### Módulo Analytics
- ✅ Balance energético por boca
- ✅ Consumo por segmento
- ✅ Consumo por línea
- ✅ Pérdidas de energía
- ✅ Tendencias temporales

### Módulo Catálogos
- ✅ CRUD de segmentos
- ✅ CRUD de bocas de compra
- ✅ CRUD de líneas
- ✅ CRUD de tipos de poste

### Módulo Auth
- ✅ Login con diferentes roles
- ✅ Refresh tokens
- ✅ Validación de API keys

### Módulo ETL
- ✅ Carga de facturas
- ✅ Procesamiento ETL
- ✅ Matcheo de datos

---

## 📁 Estructura de Datos

### Períodos Disponibles

**Mensuales:** 2024-01 a 2024-10 (10 meses)
**Bimestrales:** 
- 2024-05/06
- 2024-07/08
- 2024-09/10

### Usuarios por Segmento

| Segmento | Cantidad | Rango Suministros |
|----------|----------|-------------------|
| Residencial | 5 | 10001-10005 |
| Comercial | 3 | 20001-20003 |
| Industrial | 2 | 30001-30002 |
| Alumbrado Público | 2 | 40001-40002 |
| Rural | 2 | 50001-50002 |

---

## 🔄 Reset Completo

Si necesitas empezar desde cero:

```bash
# Resetear la base de datos y volver a ejecutar el seed
npm run db:reset

# Luego ejecutar el seed completo
npm run db:seed:complete
```

---

## 📝 Notas

- Los datos son **ficticios** pero **realistas**
- Las relaciones (FKs) están correctamente establecidas
- Los valores numéricos están en rangos lógicos
- Fechas centradas en 2024 para consistencia
- Algunos registros tienen valores null para probar casos edge

---

## 🐛 Troubleshooting

### Error: "Unique constraint violation"
Ejecuta primero `npm run db:reset` para limpiar la BD.

### Error: "Foreign key constraint"
Asegúrate de que el schema está actualizado con `npm run db:generate`.

### Error: "Cannot find module"
Instala las dependencias con `npm install`.

---

## 📞 Soporte

Para reportar problemas con el seed, abre un issue en el repositorio.
