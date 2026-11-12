# 🇨🇱 CatálogoChileno - Ecosistema de Microservicios y Frontend

Proyecto desarrollado para la asignatura **Desarrollo Full Stack 2** (Duoc UC). Plataforma web para la venta de obras y fotografías digitales de artistas chilenos con licencias comerciales inmediatas.

---

## 🛠️ 1. Stack Tecnológico

### Backend (Microservicios)
- **Lenguaje:** Java 21 LTS
- **Framework:** Spring Boot 3.x / 4.x
- **Persistencia:** Spring Data JPA / Hibernate (Dialecto MySQL)
- **Validación:** Spring Validation (`@Valid`, Bean Validation)
- **Enrutamiento & Gateway:** Spring Cloud Gateway (CORS global + proxy reactivo en puerto `8000`)
- **Comunicación entre Microservicios:** Spring Cloud OpenFeign (comunicación HTTP síncrona declarativa)
- **Seguridad:** Spring Security + BCrypt + Tokens JWT (HMAC-SHA)
- **Pruebas Unitarias:** JUnit 5 (Jupiter) + Mockito (Mocks de repositorios y clientes Feign)
- **Gestor de Dependencias:** Apache Maven (Maven Wrapper `./mvnw`)

### Base de Datos & Contenedores
- **Motor BD:** MySQL 8.0 (4 bases de datos lógicamente aisladas)
- **Administrador Web:** phpMyAdmin (puerto `8085`)
- **Orquestación:** Docker & Docker Compose

### Frontend
- **Runtime & Bundler:** Vite 8+ con TypeScript en modo estricto
- **Librería UI:** React 19 (Hooks, Context API, inmutabilidad)
- **Enrutamiento:** React Router v7 Data Router (`createBrowserRouter` + `<RouterProvider />`)
- **Estilos:** Tailwind CSS v4 con variables temáticas y colores de marca
- **Componentes:** Arquitectura atómica estilo Shadcn UI con `class-variance-authority` (CVA) y utilidad `cn`
- **Iconografía:** Lucide React

---

## ⚙️ 2. ¿Cómo Funciona la Aplicación?

La plataforma opera bajo una arquitectura de microservicios coordinados por un **Gateway Central**:

```
[ Frontend: React 19 ]
         │
         ▼ (HTTP :8000)
[ Spring Cloud Gateway ]
    ├── /auth/**      ──►  [ servicio-autenticacion (:8080) ] ──► (bd_autenticacion)
    ├── /usuarios/**  ──►  [ servicio-usuario (:8090) ]       ──► (bd_usuarios)
    ├── /productos/** ──►  [ servicio-catalogo (:8091) ]      ──► (bd_catalogo_productos)
    └── /carrito/**   ──►  [ servicio-carrito (:8092) ]       ──► (bd_carrito)
                                 │ (OpenFeign)
                                 └──► Valida disponibilidad en servicio-catalogo
```

### Flujo de Negocio Principal:
1. **Inicio de Sesión:** El cliente ingresa sus credenciales en el Frontend. El Gateway redirige la petición a `servicio-autenticacion`, el cual verifica el hash BCrypt en MySQL y emite un token JWT.
2. **Exploración de Catálogo:** La aplicación consulta las obras aprobadas a través del Gateway hacia `servicio-catalogo`, cargando fotos, precios y ciudades chilenas (Torres del Paine, Valparaíso, Puerto Varas, Santiago, Concepción).
3. **Agregar al Carrito con OpenFeign:** Cuando el usuario hace clic en *"Agregar"*, `servicio-carrito` realiza una llamada síncrona vía **Spring Cloud OpenFeign** al endpoint `GET /productos/{id}/disponible` de `servicio-catalogo`. Si la obra está activa y aprobada, se crea el carrito y se persiste el ítem en la base de datos `bd_carrito`.
4. **Consulta y Gestión:** El usuario puede revisar su carrito con el desglose en CLP y los subtotales calculados.

---

## 🚀 3. ¿Cómo Poner en Marcha el Proyecto?

### Opción A: Con el Script Automatizado (Recomendada)
En la terminal, dentro de la carpeta principal:
```bash
./iniciar-servicios.sh
```
El menú interactivo te permite levantar Docker (opción 1), iniciar los microservicios en segundo plano (opción 2) y abrir el frontend (opción 4).

---

### Opción B: Inicio Manual por Terminales

#### Paso 1: Levantar Bases de Datos (Docker)
```bash
cd Back-End
docker compose up -d
```
- **MySQL:** `localhost:3306` (Usuario: `root`, Contraseña: `root`)
- **phpMyAdmin:** [http://localhost:8085](http://localhost:8085)

#### Paso 2: Iniciar Microservicios
Abre terminales separadas para cada servicio:
```bash
# Terminal 1 - Gateway
cd Back-End/gateway && ./mvnw spring-boot:run

# Terminal 2 - Catálogo
cd Back-End/catalogo && ./mvnw spring-boot:run

# Terminal 3 - Carrito
cd Back-End/carrito && ./mvnw spring-boot:run

# Terminal 4 - Autenticación
cd Back-End/autenticacion && ./mvnw spring-boot:run

# Terminal 5 (Opcional) - Usuarios
cd Back-End/usuarios && ./mvnw spring-boot:run
```

#### Paso 3: Iniciar Frontend
```bash
cd Front-End
npm run dev
```
Abre en tu navegador: **[http://localhost:5173](http://localhost:5173)**

---

## 🧪 4. ¿Cómo Hacer las Pruebas?

### A. Prueba Funcional en el Navegador (Flujo Completo)

1. **Entrar al sistema:** Ingresa a [http://localhost:5173/login](http://localhost:5173/login).
2. **Cargar credenciales de prueba:** Haz clic en el botón de atajo **"👤 Cargar Cliente"** (rellena automáticamente `cliente@test.cl` / `Password123!`) y presiona **"Ingresar a CatálogoChileno"**.
3. **Verificar sesión:** En la barra superior aparecerá tu nombre (*Gabriel Martínez*) con sesión activa.
4. **Ver Catálogo:** Explora las tarjetas de obras chilenas con sus respectivas ciudades y precios en CLP.
5. **Agregar al Carrito:** Haz clic en **"Agregar"** en cualquier producto (ej: *Atardecer en Cuernos del Paine*).
6. **Verificar Carrito:** Haz clic en el botón **Carrito** en la esquina superior derecha o en *"Revisar Carrito"* para comprobar los ítems agregados y el total calculado.
7. **Verificar Persistencia en MySQL:** Ingresa a phpMyAdmin en [http://localhost:8085](http://localhost:8085) (usuario `root`, password `root`), ve a la base de datos `bd_carrito` y revisa la tabla `item_carrito` para confirmar la creación física del registro.

---

### B. Pruebas Unitarias Automatizadas (JUnit 5 + Mockito)

Las pruebas están construidas con **JUnit 5** y **Mockito**, aislando la lógica de negocio y simulando las dependencias externas (bases de datos y clientes Feign).

Para ejecutarlas desde la consola:

```bash
# 1. Pruebas de Autenticación (5 tests unitarios)
cd Back-End/autenticacion && ./mvnw test

# 2. Pruebas de Catálogo (5 tests unitarios)
cd Back-End/catalogo && ./mvnw test

# 3. Pruebas de Carrito y Feign (5 tests unitarios)
cd Back-End/carrito && ./mvnw test
```

#### ¿Qué evalúa cada prueba?
- **`AutenticacionServicioTest`**:
  - `autenticar_CredencialesValidas_RetornaJwt`: Verifica la emisión exitosa del token JWT y el registro de la sesión.
  - `autenticar_CorreoNoExiste_LanzaExcepcion`: Asegura que el sistema arroje error ante correos no registrados.
  - `autenticar_ContrasenaErronea_LanzaExcepcion`: Valida que BCrypt rechace contraseñas incorrectas.
  - `autenticar_CuentaDesactivada_LanzaExcepcion`: Verifica que cuentas inactivas no puedan ingresar.
  - `registrar_UsuarioNuevo_LlamaFeignYGuarda`: Comprueba la persistencia de credenciales y la sincronización vía Feign con el microservicio de usuarios.
- **`CarritoServicioTest`**:
  - `agregarItem_ProductoDisponible_CreaOCarritoYAgregaItem`: Simula la respuesta exitosa de `CatalogoClienteFeign`, calcula subtotales y comprueba el guardado en base de datos.
  - `agregarItem_ProductoNoDisponible_LanzaExcepcion`: Comprueba que si Catálogo responde que el producto no está disponible, se cancele la operación y no se guarde nada en MySQL.
  - `agregarItem_ProductoYaExisteEnCarrito_IncrementaCantidad`: Verifica que agregar un producto repetido incremente la cantidad sin duplicar filas.
  - `obtenerOCrearCarrito_SinIdentificador_LanzaExcepcion`: Asegura validación obligatoria de usuario o token.
  - `vaciarCarrito_Exitoso`: Valida el vaciado de ítems del carrito.
- **`ProductoServicioTest`**:
  - `estaDisponibleParaCompra_ProductoAprobado_RetornaTrue`: Comprueba el endpoint que consume el Carrito vía Feign.
  - `estaDisponibleParaCompra_ProductoPendiente_RetornaFalse`: Valida el rechazo si la obra aún no ha sido aprobada.
  - `aprobarProducto_Exitoso`: Evalúa el cambio de estado a `APROBADO`.
