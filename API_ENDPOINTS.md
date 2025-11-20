# PI Endpoints - GridAnalytics Backend

## 🌐 Base URL

```
http://localhost:3000/api
```

> **Importante**: Todos los endpoints están bajo el prefijo `/api`

## ✅ Resumen de Cambios Implementados

1. **Removida toda la autenticación**: Todas las rutas son ahora públicas
2. **Creados endpoints para TODOS los modelos del schema de Prisma**
3. **Estructura modular**: Cada grupo de modelos tiene su propio módulo
4. **Jerarquía de distribución**: Endpoints para obtener boca → distribuidores → clientes

---

## 📋 Endpoints por Módulo

### 🔐 AUTH (`/api/auth`)

- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/register` - Registro de nuevo usuario
- `POST /api/auth/api-keys` - Crear API key

---

### 📚 CATÁLOGOS (`/api/catalogos`)

#### Bocas de Compra

- `GET /api/catalogos/bocas` - Listar bocas de compra
- `GET /api/catalogos/bocas/:id` - Obtener boca por ID
- `POST /api/catalogos/bocas` - Crear boca de compra
- `PUT /api/catalogos/bocas/:id` - Actualizar boca de compra
- `DELETE /api/catalogos/bocas/:id` - Eliminar boca de compra

#### Segmentos

- `GET /api/catalogos/segmentos` - Listar segmentos
- `GET /api/catalogos/segmentos/:id` - Obtener segmento por ID
- `POST /api/catalogos/segmentos` - Crear segmento
- `PUT /api/catalogos/segmentos/:id` - Actualizar segmento
- `DELETE /api/catalogos/segmentos/:id` - Eliminar segmento

#### Líneas Eléctricas

- `GET /api/catalogos/lineas` - Listar líneas
- `GET /api/catalogos/lineas/:id` - Obtener línea por ID
- `POST /api/catalogos/lineas` - Crear línea
- `PUT /api/catalogos/lineas/:id` - Actualizar línea
- `DELETE /api/catalogos/lineas/:id` - Eliminar línea

#### Tipos de Poste

- `GET /api/catalogos/tipos-poste` - Listar tipos de poste
- `GET /api/catalogos/tipos-poste/:id` - Obtener tipo por ID
- `POST /api/catalogos/tipos-poste` - Crear tipo de poste
- `PUT /api/catalogos/tipos-poste/:id` - Actualizar tipo de poste
- `DELETE /api/catalogos/tipos-poste/:id` - Eliminar tipo de poste

#### Usuarios (Suministros)

- `GET /api/catalogos/usuarios` - Listar usuarios
- `GET /api/catalogos/usuarios/:id` - Obtener usuario por ID
- `GET /api/catalogos/usuarios/suministro/:nroSuministro` - Obtener usuario por número de suministro
- `POST /api/catalogos/usuarios` - Crear usuario
- `PUT /api/catalogos/usuarios/:id` - Actualizar usuario
- `DELETE /api/catalogos/usuarios/:id` - Eliminar usuario

---

### 📊 MEDICIONES (`/api/mediciones`)

#### Mediciones de Compra

- `GET /api/mediciones/compra` - Listar mediciones de compra
  - Query params: `idBoca`, `periodoMes`, `limit`, `offset`
- `GET /api/mediciones/compra/:id` - Obtener medición de compra por ID
- `GET /api/mediciones/compra/boca/:idBoca` - Obtener mediciones por boca
  - Query params: `periodoInicio`, `periodoFin`, `limit`, `offset`

#### Mediciones de Venta

- `GET /api/mediciones/venta` - Listar mediciones de venta
  - Query params: `idUsuario`, `periodoBimestre`, `limit`, `offset`
- `GET /api/mediciones/venta/:id` - Obtener medición de venta por ID
- `GET /api/mediciones/venta/usuario/:idUsuario` - Obtener mediciones por usuario
  - Query params: `periodoInicio`, `periodoFin`, `limit`, `offset`
- `GET /api/mediciones/venta/suministro/:nroSuministro` - Obtener mediciones por suministro
  - Query params: `periodoInicio`, `periodoFin`, `limit`, `offset`

---

### 📈 VISTAS (`/api/vistas`)

#### Venta Mensualizada

- `GET /api/vistas/venta-mensualizada` - Listar ventas mensualizadas
  - Query params: `idUsuario`, `idSegmento`, `idLinea`, `periodoMes`, `limit`, `offset`
- `GET /api/vistas/venta-mensualizada/:id` - Obtener venta mensualizada por ID

#### Balance Boca Mes

- `GET /api/vistas/balance-boca-mes` - Listar balances por boca y mes
  - Query params: `idBoca`, `periodoMes`, `limit`, `offset`
- `GET /api/vistas/balance-boca-mes/:id` - Obtener balance por ID

#### Venta por Segmento Mes

- `GET /api/vistas/venta-segmento-mes` - Listar ventas por segmento y mes
  - Query params: `idSegmento`, `periodoMes`, `limit`, `offset`
- `GET /api/vistas/venta-segmento-mes/:id` - Obtener venta por segmento por ID

#### Venta por Línea Mes

- `GET /api/vistas/venta-linea-mes` - Listar ventas por línea y mes
  - Query params: `idLinea`, `periodoMes`, `limit`, `offset`
- `GET /api/vistas/venta-linea-mes/:id` - Obtener venta por línea por ID

---

### 🏗️ INFRAESTRUCTURA (`/infra`)

#### Relevamiento de Postes

- `GET /api/infra/postes` - Listar relevamientos de postes
  - Query params: `idLinea`, `idPosteType`, `estado`, `limit`, `offset`
- `GET /api/infra/postes/:id` - Obtener relevamiento de poste por ID

#### Distribuidores

- `GET /api/infra/distribuidores` - Listar distribuidores
  - Query params: `limit`, `offset`
- `GET /api/infra/distribuidores/:id` - Obtener distribuidor por ID

#### Map de Períodos

- `GET /api/infra/periodos` - Listar períodos
  - Query params: `tipo`, `limit`, `offset`
- `GET /api/infra/periodos/:id` - Obtener período por ID
- `GET /api/infra/periodos/clave/:clave` - Obtener período por clave normalizada

---

### 🔧 ETL (`/api/etl`)

- `POST /api/etl/compra/pdf` - Procesar compra desde PDF (n8n)
- `POST /api/etl/venta/csv` - Procesar ventas desde CSV
- `POST /api/etl/usuarios/csv` - Procesar usuarios desde CSV
- `POST /api/etl/lineas-postes/csv` - Procesar líneas y postes desde CSV
- `GET /api/etl/logs` - Obtener logs de ETL
  - Query params: `fuente`, `desde`, `hasta`, `limit`, `offset`
- `GET /api/etl/stats` - Obtener estadísticas de ETL
- `POST /api/etl/validate-csv` - Validar formato CSV
- `GET /api/etl/status/:hashDoc` - Verificar estado de procesamiento

---

### 📊 ANALYTICS (`/api/analytics`)

#### Balance y Análisis de Pérdidas

- `POST /api/analytics/mensualize-venta` - Mensualizar venta bimestral
- `GET /api/analytics/balance/general` - Balance general compra vs venta
  - Query params: `idBoca`, `periodoInicio`, `periodoFin`, `incluirDetalle`
- `GET /api/analytics/balance/compra` - Balance de compras por boca
  - Query params: `idBoca`, `periodoInicio`, `periodoFin`, `incluirDetalle`
- `GET /api/analytics/balance/venta` - Balance de ventas por boca
  - Query params: `idBoca`, `periodoInicio`, `periodoFin`, `incluirDetalle`
- `GET /api/analytics/analisis-perdida` - Análisis detallado de pérdidas
  - Query params: `idBoca`, `periodoInicio`, `periodoFin`, `incluirDetalle`
- `GET /api/analytics/resumen/:periodo` - Resumen consolidado por período
- `GET /api/analytics/top-perdidas/:periodo` - Top de pérdidas por período
  - Query params: `limite`
- `POST /api/analytics/alertas/:periodo` - Generar alertas automáticas

#### Jerarquía de Distribución (Boca → Distribuidores → Clientes)

- `GET /api/analytics/jerarquia/bocas` - Resumen de todas las bocas con estadísticas
  - Retorna: Total de distribuidores y clientes por boca
- `GET /api/analytics/jerarquia/boca/:idBoca` - Jerarquía completa de una boca específica
  - Retorna: Boca → Distribuidores → Clientes con datos completos

---

### 🔑 ADMIN (`/api/admin`)

#### API Keys

- `GET /api/admin/api-keys` - Listar API Keys
  - Query params: `activo`, `limit`, `offset`
- `GET /api/admin/api-keys/:id` - Obtener API Key por ID

#### ETL Raw

- `GET /api/admin/etl-raw` - Listar registros ETL raw
  - Query params: `fuente`, `hashDoc`, `limit`, `offset`
- `GET /api/admin/etl-raw/:id` - Obtener registro ETL raw por ID

#### ETL Matches

- `GET /api/admin/etl-matches` - Listar matches ETL
  - Query params: `entidadDestino`, `procesado`, `limit`, `offset`
- `GET /api/admin/etl-matches/:id` - Obtener match ETL por ID

---

### 🏥 SYSTEM

- `GET /health` - Health check del servicio
- `GET /healthz` - Health check del servicio (alias)
- `GET /readiness` - Readiness check
- `GET /` - Información general de la API
- `GET /docs` - Documentación Swagger UI
- `GET /docs/json` - Especificación OpenAPI en JSON

---

## 📦 Modelos del Schema Prisma Cubiertos

✅ **Todos los modelos tienen endpoints completos:**

1. ✅ `CatBocasCompra` - `/api/catalogos/bocas`
2. ✅ `CatSegmentos` - `/api/catalogos/segmentos`
3. ✅ `CatLineas` - `/api/catalogos/lineas`
4. ✅ `CatTiposPoste` - `/api/catalogos/tipos-poste`
5. ✅ `Usuarios` - `/api/catalogos/usuarios`
6. ✅ `MedicionesCompra` - `/api/mediciones/compra`
7. ✅ `MedicionesVenta` - `/api/mediciones/venta`
8. ✅ `MapPeriodos` - `/api/infra/periodos`
9. ✅ `RelevamientoPostes` - `/api/infra/postes`
10. ✅ `EtlFacturasRaw` - `/api/admin/etl-raw`
11. ✅ `EtlMatchFacturas` - `/api/admin/etl-matches`
12. ✅ `ApiKeys` - `/api/admin/api-keys`
13. ✅ `VwVentaMensualizada` - `/api/vistas/venta-mensualizada`
14. ✅ `VwBalanceBocaMes` - `/api/vistas/balance-boca-mes`
15. ✅ `VwVentaPorSegmentoMes` - `/api/vistas/venta-segmento-mes`
16. ✅ `VwVentaPorLineaMes` - `/api/vistas/venta-linea-mes`
17. ✅ `cat_distribuidor` - `/api/infra/distribuidores`

---

## 🎯 Características Implementadas

- ✅ **Sin autenticación**: Todas las rutas son públicas
- ✅ **Paginación**: Todos los endpoints de listado soportan `limit` y `offset`
- ✅ **Filtros**: Query params específicos por tipo de dato
- ✅ **Includes**: Relaciones incluidas en las respuestas
- ✅ **Schemas OpenAPI**: Documentación completa de todos los endpoints
- ✅ **Manejo de errores**: Validación y respuestas de error consistentes
- ✅ **CRUD completo**: Donde aplica (catálogos)
- ✅ **Jerarquía de distribución**: Endpoints para boca → distribuidores → clientes
- ✅ **Endpoints especializados**: Por boca, usuario, suministro, etc.

---

## 🚀 Cómo Usar

### Iniciar el servidor

```bash
npm run dev
```

### Acceder a la documentación

```
http://localhost:3000/docs
```

### Ejemplo de llamadas

```bash
# Listar todas las bocas de compra
curl http://localhost:3000/api/catalogos/bocas

# Obtener usuarios (clientes/suministros)
curl http://localhost:3000/api/catalogos/usuarios?limit=10

# Obtener mediciones de compra para una boca específica
curl http://localhost:3000/api/mediciones/compra?idBoca=1

# Ver balance general
curl "http://localhost:3000/api/analytics/balance/general?periodoInicio=2024-01&periodoFin=2024-12"

# Listar ventas mensualizadas
curl http://localhost:3000/api/vistas/venta-mensualizada?limit=50

# Ver distribuidores
curl http://localhost:3000/api/infra/distribuidores

# Obtener jerarquía completa: Boca → Distribuidores → Clientes
curl http://localhost:3000/api/analytics/jerarquia/boca/1

# Resumen de todas las bocas con estadísticas
curl http://localhost:3000/api/analytics/jerarquia/bocas
```

---

## 🌳 Jerarquía de Distribución (NUEVO)

Los nuevos endpoints de jerarquía permiten obtener la estructura completa de distribución eléctrica:

### GET `/api/analytics/jerarquia/bocas`

Obtiene un resumen de todas las bocas con contadores:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "BC-SEGUI",
      "proveedor": "ENERSA",
      "activo": true,
      "totalDistribuidores": 6,
      "totalClientes": 3082
    }
  ],
  "meta": {
    "total": 5,
    "totalDistribuidores": 12,
    "totalClientes": 5003
  }
}
```

### GET `/api/analytics/jerarquia/boca/:idBoca`

Obtiene la jerarquía completa de una boca específica con todos sus distribuidores y clientes:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "BC-SEGUI",
    "proveedor": "ENERSA",
    "latitud": "-31.967046949",
    "longitud": "-60.134711284",
    "totalDistribuidores": 6,
    "totalClientes": 3082,
    "distribuidores": [
      {
        "id": 1,
        "nombre": "DIST1",
        "ubicacion": "SEGUI RURAL",
        "totalClientes": 129,
        "clientes": [
          {
            "id": 305,
            "nroSuministro": "406",
            "nombre": "Cliente Ejemplo",
            "direccion": "Dirección ejemplo",
            "segmentoNombre": "T1 rural residencial",
            "lineaNombre": "Línea 1",
            "latitud": "-31.938",
            "longitud": "-60.131"
          }
        ]
      }
    ]
  }
}
```

**Casos de uso:**

- 📍 Visualización en mapas (coordenadas de boca → distribuidor → cliente)
- 📊 Dashboards jerárquicos en Power BI
- 🔍 Análisis de distribución por zona
- 📈 Estadísticas agrupadas por boca/distribuidor

---

## 📝 Notas Importantes

1. **Todas las rutas son públicas** - No se requiere autenticación
2. **Los datos se retornan con todas sus relaciones** donde sea relevante
3. **Paginación por defecto**: limit=100, offset=0
4. **Formato de respuesta consistente**:
   ```json
   {
     "success": true,
     "data": [...],
     "pagination": {
       "total": 150,
       "limit": 100,
       "offset": 0,
       "hasMore": true
     }
   }
   ```
