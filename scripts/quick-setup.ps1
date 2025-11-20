# Script de configuración rápida para GridAnalytics (Windows)
# Este script configura la base de datos y carga datos de prueba

Write-Host "🚀 GridAnalytics - Configuración Rápida" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

function Print-Step {
    param($message)
    Write-Host "➤ $message" -ForegroundColor Blue
}

function Print-Success {
    param($message)
    Write-Host "✓ $message" -ForegroundColor Green
}

function Print-Error {
    param($message)
    Write-Host "✗ $message" -ForegroundColor Red
}

# 1. Verificar que existe .env
Print-Step "Verificando archivo .env..."
if (-not (Test-Path .env)) {
    Print-Error "No se encontró el archivo .env"
    Write-Host "Por favor, crea un archivo .env con DATABASE_URL configurado"
    exit 1
}
Print-Success "Archivo .env encontrado"

# 2. Instalar dependencias si es necesario
if (-not (Test-Path node_modules)) {
    Print-Step "Instalando dependencias..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Print-Error "Error instalando dependencias"
        exit 1
    }
    Print-Success "Dependencias instaladas"
}

# 3. Generar cliente Prisma
Print-Step "Generando cliente Prisma..."
npm run db:generate
if ($LASTEXITCODE -ne 0) {
    Print-Error "Error generando cliente Prisma"
    exit 1
}
Print-Success "Cliente Prisma generado"

# 4. Ejecutar migraciones
Print-Step "Ejecutando migraciones de base de datos..."
npm run db:migrate:deploy
if ($LASTEXITCODE -ne 0) {
    Print-Error "Error ejecutando migraciones"
    exit 1
}
Print-Success "Migraciones aplicadas"

# 5. Ejecutar seed completo
Print-Step "Cargando datos de prueba (seed completo)..."
npm run db:seed:complete
if ($LASTEXITCODE -ne 0) {
    Print-Error "Error cargando datos de prueba"
    exit 1
}
Print-Success "Datos de prueba cargados"

# 6. Verificar datos
Print-Step "Verificando datos cargados..."
npm run db:verify
if ($LASTEXITCODE -ne 0) {
    Print-Error "Error verificando datos"
    exit 1
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ ¡Configuración completada!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 Credenciales de prueba:" -ForegroundColor Yellow
Write-Host "   Admin:    admin@cooperativa.com / admin123"
Write-Host "   Operador: operador@cooperativa.com / operador123"
Write-Host "   Viewer:   viewer@cooperativa.com / viewer123"
Write-Host ""
Write-Host "🚀 Comandos útiles:" -ForegroundColor Yellow
Write-Host "   npm run dev          - Iniciar servidor en modo desarrollo"
Write-Host "   npm run db:studio    - Abrir Prisma Studio"
Write-Host "   npm run db:verify    - Verificar datos en BD"
Write-Host ""
