# 🇨🇱 CatálogoChileno - Plataforma Microservicios Full Stack

Proyecto desarrollado para la asignatura **Desarrollo Full Stack 2** (Duoc UC).
Ecosistema completo basado en **Java 21**, **Spring Boot 3.x / 4.x**, **Spring Cloud Gateway**, **OpenFeign**, **MySQL 8.0 en Docker**, y un frontend moderno desarrollado en **React 19**, **TypeScript estricto**, **Tailwind CSS v4** y componentes atómicos con **CVA / Shadcn UI**.

---

## 🏛️ 1. Arquitectura de la Solución

```mermaid
flowchart TD
    subgraph Frontend ["Frontend (Vite :5173)"]
        UI["React 19 + TypeScript + Tailwind v4"]
    end

    subgraph GatewayZone ["Punto Único de Entrada (:8000)"]
        GW["Spring Cloud Gateway\n(CORS + Enrutamiento)"]
    end

    subgraph Microservicios ["Microservicios Backend"]
        AUTH["servicio-autenticacion\n(:8080 - JWT / BCrypt)"]
        USERS["servicio-usuario\n(:8090 - Perfiles)"]
        CAT["servicio-catalogo\n(:8091 - Obras y Stock)"]
        CART["servicio-carrito\n(:8092 - Items y Carritos)"]
    end

    subgraph DatabaseZone ["Docker Compose (:3306)"]
        DB1[("bd_autenticacion")]
        DB2[("bd_usuarios")]
        DB3[("bd_catalogo_productos")]
        DB4[("bd_carrito")]
        PMA["phpMyAdmin (:8085)"]
    end

    UI -->|HTTP / JSON| GW
    GW -->|/auth/**| AUTH
    GW -->|/usuarios/**| USERS
    GW -->|/productos/**| CAT
    GW -->|/carrito/**| CART

    CART -->|Spring Cloud OpenFeign\nGET /productos/{id}/disponible| CAT

    AUTH --> DB1
    USERS --> DB2
    CAT --> DB3
    CART --> DB4
    PMA -.-> DatabaseZone
```

---

## 🚀 2. Inicio Rápido con Script Automatizado

Se incluye un script interactivo en la raíz del repositorio para gestionar todo el ecosistema con un solo comando:

```bash
./iniciar-servicios.sh
```

El menú permite:
1. **Levantar bases de datos** en Docker (MySQL + phpMyAdmin).
2. **Iniciar todos los microservicios** en segundo plano con logs centralizados en `./logs/`.
3. **Detener microservicios** de forma limpia.
4. **Iniciar Frontend Vite** (`npm run dev`).
5. **Ejecutar pruebas unitarias** (JUnit 5 + Mockito).
6. **Verificar estado de puertos**.

---

## ⚙️ 3. Inicio Manual Paso a Paso

### Paso 1: Base de Datos Docker
```bash
cd Back-End
docker compose up -d
```
- **MySQL:** `localhost:3306` (Usuario: `root`, Password: `rootpassword`)
- **phpMyAdmin:** [http://localhost:8085](http://localhost:8085)

### Paso 2: Microservicios (En terminales separadas o con Maven)
```bash
# Terminal 1: Gateway
cd Back-End/gateway && ./mvnw spring-boot:run

# Terminal 2: Autenticación
cd Back-End/autenticacion && ./mvnw spring-boot:run

# Terminal 3: Catálogo
cd Back-End/catalogo && ./mvnw spring-boot:run

# Terminal 4: Carrito
cd Back-End/carrito && ./mvnw spring-boot:run

# Terminal 5 (Opcional): Usuarios
cd Back-End/usuarios && ./mvnw spring-boot:run
```

### Paso 3: Frontend (React 19 + Tailwind v4)
```bash
cd Front-End
npm run dev
```
Acceder en el navegador a: **[http://localhost:5173](http://localhost:5173)**.

---

## 👤 4. Credenciales de Prueba (Seed Data)

El script inicial `seed_data.sql` precarga usuarios listos para la demostración:

| Rol | Correo | Contraseña | ID Usuario |
| :--- | :--- | :--- | :--- |
| **Cliente** | `cliente@test.cl` | `Password123!` | `1` |
| **Artista** | `artista@test.cl` | `Password123!` | `2` |

> En la pantalla de Login del Frontend, existe un botón de acceso directo **"👤 Cargar Cliente"** para rellenar automáticamente las credenciales.

---

## 🧪 5. Pruebas Unitarias (JUnit 5 + Mockito)

El proyecto cuenta con suites de pruebas unitarias aisladas con **Mockito**:

### Ejecutar todas las pruebas:
```bash
# Autenticación (5 tests unitarios + 1 contexto)
cd Back-End/autenticacion && ./mvnw test

# Catálogo (5 tests unitarios + 1 contexto)
cd Back-End/catalogo && ./mvnw test

# Carrito (5 tests unitarios + 1 contexto)
cd Back-End/carrito && ./mvnw test
```

### Casos de Prueba Cubiertos:
- **`AutenticacionServicioTest`**:
  - `autenticar_CredencialesValidas_RetornaJwt`: Emisión de JWT y guardado de refresh token.
  - `autenticar_CorreoNoExiste_LanzaExcepcion`: Excepción ante email inexistente.
  - `autenticar_ContrasenaErronea_LanzaExcepcion`: Excepción ante clave errónea con BCrypt.
  - `autenticar_CuentaDesactivada_LanzaExcepcion`: Bloqueo de cuentas inactivas.
  - `registrar_UsuarioNuevo_LlamaFeignYGuarda`: Creación de credenciales y llamada Feign a `servicio-usuario`.
- **`CarritoServicioTest`**:
  - `agregarItem_ProductoDisponible_CreaOCarritoYAgregaItem`: Valida con `CatalogoClienteFeign`, calcula subtotales y persiste.
  - `agregarItem_ProductoNoDisponible_LanzaExcepcion`: Lanza `IllegalStateException` y no guarda si catálogo rechaza el producto.
  - `agregarItem_ProductoYaExisteEnCarrito_IncrementaCantidad`: Incrementa cantidad sin duplicar fila.
  - `obtenerOCrearCarrito_SinIdentificador_LanzaExcepcion`: Validación de parámetros obligatorios.
  - `vaciarCarrito_Exitoso`: Vaciado de ítems y persistencia.
- **`ProductoServicioTest`**:
  - `estaDisponibleParaCompra_ProductoAprobado_RetornaTrue`: Endpoint consumido por Carrito vía Feign.
  - `estaDisponibleParaCompra_ProductoPendiente_RetornaFalse`: Rechazo si el producto aún está en moderación.
  - `aprobarProducto_Exitoso`: Transición de estado a `APROBADO`.

---

## 🗺️ 6. Mapeo de Puertos y Servicios

| Componente | Puerto | Protocolo / URL | Descripción |
| :--- | :--- | :--- | :--- |
| **Frontend (Vite)** | `5173` | [http://localhost:5173](http://localhost:5173) | UI React 19 + Tailwind CSS v4 |
| **Gateway** | `8000` | [http://localhost:8000](http://localhost:8000) | Enrutador global y CORS |
| **Autenticación** | `8080` | [http://localhost:8080](http://localhost:8080) | Login JWT, registro, BCrypt |
| **Usuarios** | `8090` | [http://localhost:8090](http://localhost:8090) | Perfiles de clientes y artistas |
| **Catálogo** | `8091` | [http://localhost:8091](http://localhost:8091) | Productos, stock, categorías |
| **Carrito** | `8092` | [http://localhost:8092](http://localhost:8092) | Carritos, ítems, Feign |
| **MySQL 8.0** | `3306` | `localhost:3306` | 4 bases de datos lógicamente aisladas |
| **phpMyAdmin** | `8085` | [http://localhost:8085](http://localhost:8085) | Visor web de base de datos MySQL |

---

## 📂 7. Estructura del Proyecto

```
CatalogoChileno/
├── Back-End/
│   ├── docker-compose.yml       # MySQL 8.0 + phpMyAdmin
│   ├── init.sql                 # Creación de bases de datos
│   ├── seed_data.sql            # Datos de prueba (usuarios y productos)
│   ├── gateway/                 # Microservicio Spring Cloud Gateway (:8000)
│   ├── autenticacion/           # Microservicio JWT & BCrypt (:8080)
│   ├── catalogo/                # Microservicio Obras y Productos (:8091)
│   ├── carrito/                 # Microservicio Carrito de Compras (:8092)
│   └── usuarios/                # Microservicio Perfiles (:8090)
├── Front-End/                   # React 19 + TypeScript + Tailwind v4 + CVA (:5173)
│   ├── src/
│   │   ├── client/              # Layout y páginas públicas (Login, Catálogo, Carrito)
│   │   ├── components/ui/       # Componentes atómicos (Button, Input, Badge, Card)
│   │   ├── context/             # AuthContext y CartContext
│   │   ├── interfaces/          # Tipado estricto TS
│   │   ├── router/              # Data Router (createBrowserRouter)
│   │   └── services/            # Clientes API vía Gateway
├── Documentos/                  # Especificación de Requisitos y Diagramas UML
├── logs/                        # Logs de ejecución en background
├── iniciar-servicios.sh         # Script de orquestación
└── README.md                    # Documentación del proyecto
```
