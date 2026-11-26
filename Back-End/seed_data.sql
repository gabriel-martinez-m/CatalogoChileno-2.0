-- =========================================================================
-- SEED DATA PARA CATÁLOGO CHILENO
-- =========================================================================
SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci';
SET CHARACTER SET utf8mb4;

-- 1. SERVICIO DE AUTENTICACIÓN (bd_autenticacion)
USE `bd_autenticacion`;

-- Contraseña encriptada con BCrypt para 'Password123!': $2a$10$I76yGuwL1PY0hfc7cDhQI.pzG09VGkNKYDKSel3eBAFqjfW3VqoKS
INSERT INTO `credencial` (`id_credencial`, `correo_electronico`, `contrasena_encriptada`, `rol`, `esta_activo`, `fecha_creacion`)
VALUES 
(1, 'cliente@test.cl', '$2a$10$I76yGuwL1PY0hfc7cDhQI.pzG09VGkNKYDKSel3eBAFqjfW3VqoKS', 'ROLE_CLIENTE', 1, NOW()),
(2, 'artista@test.cl', '$2a$10$I76yGuwL1PY0hfc7cDhQI.pzG09VGkNKYDKSel3eBAFqjfW3VqoKS', 'ROLE_ARTISTA', 1, NOW()),
(3, 'admin@test.cl', '$2a$10$I76yGuwL1PY0hfc7cDhQI.pzG09VGkNKYDKSel3eBAFqjfW3VqoKS', 'ROLE_ADMINISTRADOR', 1, NOW())
ON DUPLICATE KEY UPDATE `contrasena_encriptada` = VALUES(`contrasena_encriptada`), `esta_activo` = 1;

-- 2. SERVICIO DE USUARIOS (bd_usuarios)
USE `bd_usuarios`;

INSERT INTO `usuario_perfil` (`id_usuario`, `id_credencial_ref`, `nombre_completo`, `rut_chileno`, `telefono`, `esta_verificado`, `fecha_registro`)
VALUES
(1, 1, 'Gabriel Martínez (Cliente)', '19.876.543-2', '+56991234567', 1, NOW()),
(2, 2, 'Matías Valenzuela (Artista)', '18.765.432-1', '+56998765432', 1, NOW()),
(3, 3, 'Administrador CatálogoChileno', '11.111.111-1', '+56900000000', 1, NOW())
ON DUPLICATE KEY UPDATE `nombre_completo` = VALUES(`nombre_completo`), `esta_verificado` = 1;

-- Perfil de Artista y Datos Bancarios para el usuario 2
INSERT INTO `perfil_artista` (`id_perfil_artista`, `id_usuario`, `nombre_artistico`, `biografia`)
VALUES 
(1, 2, 'MatiasV Fotografía Aérea', 'Fotógrafo y operador de drone certificado DGAC en Chile, especializado en paisajes patagónicos.')
ON DUPLICATE KEY UPDATE `nombre_artistico` = VALUES(`nombre_artistico`), `biografia` = VALUES(`biografia`);

INSERT INTO `datos_bancarios` (`id_datos_bancarios`, `id_usuario`, `banco_nombre`, `tipo_cuenta`, `numero_cuenta`, `rut_titular`)
VALUES 
(1, 2, 'Banco Santander Chile', 'CORRIENTE', '000098765432', '18.765.432-1')
ON DUPLICATE KEY UPDATE `numero_cuenta` = VALUES(`numero_cuenta`);

-- 3. SERVICIO DE CATÁLOGO (bd_catalogo_productos)
USE `bd_catalogo_productos`;

-- Regiones de Chile
INSERT INTO `region` (`id`, `codigo`, `nombre`) VALUES
(1, 'CL-RM', 'Región Metropolitana de Santiago'),
(2, 'CL-VS', 'Región de Valparaíso'),
(3, 'CL-LL', 'Región de Los Lagos'),
(4, 'CL-MA', 'Región de Magallanes y Antártica Chilena'),
(5, 'CL-BI', 'Región del Biobío'),
(6, 'CL-AN', 'Región de Antofagasta'),
(7, 'CL-CO', 'Región de Coquimbo'),
(8, 'CL-AR', 'Región de La Araucanía')
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);

-- Comunas de Chile
INSERT INTO `comuna` (`id`, `nombre`, `id_region`) VALUES
(1, 'Santiago', 1),
(2, 'Valparaíso', 2),
(3, 'Puerto Varas', 3),
(4, 'Torres del Paine', 4),
(5, 'Concepción', 5),
(6, 'San Pedro de Atacama', 6),
(7, 'La Serena', 7),
(8, 'Pucón', 8)
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);

-- Categorías temáticas
INSERT INTO `categoria` (`id`, `nombre`, `slug`, `descripcion`, `activa`) VALUES
(1, 'Paisajes Chilenos', 'paisajes-chilenos', 'Fotografías de ultra alta resolución de naturaleza y paisajes chilenos.', 1),
(2, 'Dron & Video 4K', 'dron-video-4k', 'Tomas aéreas cinematográficas en 4K y 60fps con operador certificado.', 1),
(3, 'Cultura & Urbana', 'cultura-urbana', 'Escenas urbanas, arquitectura y patrimonio cultural chileno.', 1)
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`), `descripcion` = VALUES(`descripcion`);

-- Obras y Productos disponibles para venta
INSERT INTO `producto` (
    `id`, `id_artista`, `titulo`, `descripcion`, `precio`, 
    `tipo_medio`, `tipo_venta`, `estado`, `formato`, 
    `ancho`, `alto`, `duracion_segundos`, `url_previsualizacion`, 
    `id_categoria`, `id_region`, `id_comuna`, `fecha_creacion`
) VALUES
(
    1, 2, 'Atardecer en Cuernos del Paine', 
    'Fotografía panorámica en ultra alta resolución (8K RAW) capturada durante la hora dorada en la Patagonia chilena.',
    24990.00, 'FOTO', 'VENTA_NORMAL', 'APROBADO', 'JPG RAW',
    7680, 4320, 0, 'https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=1200&q=80',
    1, 4, 4, NOW()
),
(
    2, 2, 'Vuelo Dron 4K sobre Cerros de Valparaíso', 
    'Toma aérea fluida en 4K 60fps mostrando los tradicionales funiculares y casas patrimoniales de Valparaíso.',
    39990.00, 'VIDEO', 'VENTA_NORMAL', 'APROBADO', 'MP4 Pro-Res',
    3840, 2160, 45, 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
    2, 2, 2, NOW()
),
(
    3, 2, 'Reflejo del Volcán Osorno en Lago Llanquihue', 
    'Amanecer en aguas calmas reflejando la silueta perfecta del Volcán Osorno desde la costanera de Frutillar.',
    19990.00, 'FOTO', 'VENTA_NORMAL', 'APROBADO', 'JPG RAW',
    6000, 4000, 0, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    1, 3, 3, NOW()
),
(
    4, 2, 'Gran Santiago Crepuscular y Cordillera Nevada', 
    'Fotografía nocturna de alta exposición con la Cordillera de los Andes nevada de fondo y las luces de Santiago.',
    29990.00, 'FOTO', 'VENTA_NORMAL', 'APROBADO', 'JPG RAW',
    5472, 3648, 0, 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
    3, 1, 1, NOW()
),
(
    5, 2, 'Desembocadura del Río Biobío al Atardecer',
    'Panorámica en alta definición de la costa y la desembocadura del histórico río Biobío en Concepción.',
    22990.00, 'FOTO', 'VENTA_NORMAL', 'APROBADO', 'JPG RAW',
    6000, 4000, 0, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    1, 5, 5, NOW()
),
(
    6, 2, 'Amanecer en el Desierto de Atacama',
    'Fotografía de larga exposición del cielo estrellado sobre el Valle de la Luna, San Pedro de Atacama.',
    27990.00, 'FOTO', 'VENTA_NORMAL', 'PENDIENTE_REVISION', 'JPG RAW',
    6000, 4000, 0, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    1, 1, 1, NOW()
),
(
    7, 2, 'Costanera de Valparaíso en 4K',
    'Video en 4K de la costanera y los cerros de Valparaíso durante el atardecer.',
    34990.00, 'VIDEO', 'VENTA_NORMAL', 'PENDIENTE_REVISION', 'MP4 Pro-Res',
    3840, 2160, 30, 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
    2, 2, 2, NOW()
),
(
    8, 2, 'Atardecer en el Valle de la Luna',
    'Captura panorámica en alta definición sobre las dunas y formaciones rocosas del desierto más árido del mundo.',
    26990.00, 'FOTO', 'VENTA_NORMAL', 'APROBADO', 'JPG RAW',
    6000, 4000, 0, 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    1, 6, 6, NOW()
),
(
    9, 2, 'Cielos Estrellados del Valle del Elqui',
    'Astrofotografía nocturna de la Vía Láctea capturada bajo los cielos despejados de la Región de Coquimbo.',
    31990.00, 'FOTO', 'VENTA_NORMAL', 'APROBADO', 'JPG RAW',
    7200, 4800, 0, 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80',
    1, 7, 7, NOW()
),
(
    10, 2, 'Vuelo Dron 4K sobre el Volcán Villarrica',
    'Toma aérea cinematográfica rodeando el cráter nevado del Volcán Villarrica y los bosques nativos de la Araucanía.',
    42990.00, 'VIDEO', 'VENTA_NORMAL', 'APROBADO', 'MP4 Pro-Res',
    3840, 2160, 50, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    2, 8, 8, NOW()
)
ON DUPLICATE KEY UPDATE 
    `titulo` = VALUES(`titulo`), 
    `descripcion` = VALUES(`descripcion`),
    `precio` = VALUES(`precio`), 
    `id_comuna` = VALUES(`id_comuna`),
    `id_region` = VALUES(`id_region`),
    `estado` = VALUES(`estado`);
