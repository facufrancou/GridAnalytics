#!/bin/bash

# Script de configuración rápida para GridAnalytics
# Este script configura la base de datos y carga datos de prueba

echo "🚀 GridAnalytics - Configuración Rápida"
echo "======================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_step() {
    echo -e "${BLUE}➤ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 1. Verificar que existe .env
print_step "Verificando archivo .env..."
if [ ! -f .env ]; then
    print_error "No se encontró el archivo .env"
    echo "Por favor, crea un archivo .env con DATABASE_URL configurado"
    exit 1
fi
print_success "Archivo .env encontrado"

# 2. Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    print_step "Instalando dependencias..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Error instalando dependencias"
        exit 1
    fi
    print_success "Dependencias instaladas"
fi

# 3. Generar cliente Prisma
print_step "Generando cliente Prisma..."
npm run db:generate
if [ $? -ne 0 ]; then
    print_error "Error generando cliente Prisma"
    exit 1
fi
print_success "Cliente Prisma generado"

# 4. Ejecutar migraciones
print_step "Ejecutando migraciones de base de datos..."
npm run db:migrate:deploy
if [ $? -ne 0 ]; then
    print_error "Error ejecutando migraciones"
    exit 1
fi
print_success "Migraciones aplicadas"

# 5. Ejecutar seed completo
print_step "Cargando datos de prueba (seed completo)..."
npm run db:seed:complete
if [ $? -ne 0 ]; then
    print_error "Error cargando datos de prueba"
    exit 1
fi
print_success "Datos de prueba cargados"

# 6. Verificar datos
print_step "Verificando datos cargados..."
npm run db:verify
if [ $? -ne 0 ]; then
    print_error "Error verificando datos"
    exit 1
fi

echo ""
echo "======================================"
echo -e "${GREEN}✅ ¡Configuración completada!${NC}"
echo "======================================"
echo ""
echo "🔐 Credenciales de prueba:"
echo "   Admin:    admin@cooperativa.com / admin123"
echo "   Operador: operador@cooperativa.com / operador123"
echo "   Viewer:   viewer@cooperativa.com / viewer123"
echo ""
echo "🚀 Comandos útiles:"
echo "   npm run dev          - Iniciar servidor en modo desarrollo"
echo "   npm run db:studio    - Abrir Prisma Studio"
echo "   npm run db:verify    - Verificar datos en BD"
echo ""
