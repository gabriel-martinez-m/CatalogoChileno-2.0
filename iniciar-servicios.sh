#!/bin/bash
# ==============================================================================
# Script de Gestión y Orquestación - CatálogoChileno
# Duoc UC - Desarrollo Full Stack 2
# ==============================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/Back-End"
FRONTEND_DIR="$PROJECT_ROOT/Front-End"
LOGS_DIR="$PROJECT_ROOT/logs"

mkdir -p "$LOGS_DIR"

mostrar_menu() {
    clear
    echo "=========================================================="
    echo "        🇨🇱 CATÁLOGO CHILENO - GESTOR DE SERVICIOS         "
    echo "=========================================================="
    echo "1) Verificar y Levantar Docker (MySQL 3306 + phpMyAdmin 8085)"
    echo "2) Iniciar todos los Microservicios en segundo plano (Logs en ./logs/)"
    echo "3) Detener todos los Microservicios en segundo plano"
    echo "4) Iniciar Frontend React 19 (Vite en http://localhost:5173)"
    echo "5) Ejecutar Pruebas Unitarias (JUnit 5 + Mockito)"
    echo "6) Ver estado de puertos y servicios"
    echo "0) Salir"
    echo "=========================================================="
    read -p "Seleccione una opción: " opcion
}

iniciar_docker() {
    echo "--> Iniciando Docker Compose..."
    cd "$BACKEND_DIR" && docker compose up -d
    echo "✔ Docker activo: MySQL (3306), phpMyAdmin (http://localhost:8085)"
    read -p "Presione enter para continuar..."
}

iniciar_microservicios() {
    echo "--> Levantando microservicios en segundo plano..."
    
    echo "1. Gateway (Puerto 8000)..."
    cd "$BACKEND_DIR/gateway" && nohup ./mvnw spring-boot:run > "$LOGS_DIR/gateway.log" 2>&1 &
    
    echo "2. Autenticación (Puerto 8080)..."
    cd "$BACKEND_DIR/autenticacion" && nohup ./mvnw spring-boot:run > "$LOGS_DIR/autenticacion.log" 2>&1 &
    
    echo "3. Catálogo (Puerto 8091)..."
    cd "$BACKEND_DIR/catalogo" && nohup ./mvnw spring-boot:run > "$LOGS_DIR/catalogo.log" 2>&1 &
    
    echo "4. Carrito (Puerto 8092)..."
    cd "$BACKEND_DIR/carrito" && nohup ./mvnw spring-boot:run > "$LOGS_DIR/carrito.log" 2>&1 &
    
    echo "5. Usuarios (Puerto 8090)..."
    cd "$BACKEND_DIR/usuarios" && nohup ./mvnw spring-boot:run > "$LOGS_DIR/usuarios.log" 2>&1 &

    echo ""
    echo "✔ Todos los servicios están iniciando. Revisa los logs en: $LOGS_DIR"
    echo "  - Gateway:       http://localhost:8000"
    echo "  - Autenticacion: http://localhost:8080"
    echo "  - Usuarios:      http://localhost:8090"
    echo "  - Catalogo:      http://localhost:8091"
    echo "  - Carrito:       http://localhost:8092"
    read -p "Presione enter para continuar..."
}

detener_microservicios() {
    echo "--> Deteniendo procesos de Spring Boot..."
    pkill -f "catalogo" 2>/dev/null
    pkill -f "autenticacion" 2>/dev/null
    pkill -f "carrito" 2>/dev/null
    pkill -f "usuarios" 2>/dev/null
    pkill -f "gateway" 2>/dev/null
    echo "✔ Microservicios detenidos."
    read -p "Presione enter para continuar..."
}

iniciar_frontend() {
    echo "--> Iniciando Frontend Vite (React 19 + Tailwind CSS v4)..."
    cd "$FRONTEND_DIR" && npm run dev
}

ejecutar_tests() {
    echo "=========================================================="
    echo "  EJECUTANDO PRUEBAS UNITARIAS (JUNIT 5 + MOCKITO)       "
    echo "=========================================================="
    echo "1. Pruebas de AutenticacionServicio..."
    cd "$BACKEND_DIR/autenticacion" && ./mvnw test -Dtest=AutenticacionServicioTest
    
    echo ""
    echo "2. Pruebas de ProductoServicio (Catálogo)..."
    cd "$BACKEND_DIR/catalogo" && ./mvnw test -Dtest=ProductoServicioTest
    
    echo ""
    echo "3. Pruebas de CarritoServicio (Feign + Persistencia)..."
    cd "$BACKEND_DIR/carrito" && ./mvnw test -Dtest=CarritoServicioTest

    echo ""
    echo "✔ Todas las suites de pruebas unitarias finalizadas."
    read -p "Presione enter para continuar..."
}

ver_estado() {
    echo "=========================================================="
    echo "  ESTADO DE PUERTOS Y PROCESOS ACTIVOS                   "
    echo "=========================================================="
    for port in 8000 8080 8090 8091 8092 3306 8085 5173; do
        PID=$(lsof -ti :$port 2>/dev/null)
        if [ -n "$PID" ]; then
            echo "Puerto $port: ACTIVO (PID $PID)"
        else
            echo "Puerto $port: Inactivo"
        fi
    done
    echo "=========================================================="
    read -p "Presione enter para continuar..."
}

while true; do
    mostrar_menu
    case $opcion in
        1) iniciar_docker ;;
        2) iniciar_microservicios ;;
        3) detener_microservicios ;;
        4) iniciar_frontend ;;
        5) ejecutar_tests ;;
        6) ver_estado ;;
        0) echo "¡Hasta luego!"; exit 0 ;;
        *) echo "Opción no válida."; sleep 1 ;;
    esac
done
