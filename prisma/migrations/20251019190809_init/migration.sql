-- CreateTable
CREATE TABLE `usuarios` (
    `usuario_id` INTEGER NOT NULL AUTO_INCREMENT,
    `dni` VARCHAR(8) NOT NULL,
    `correo` VARCHAR(100) NOT NULL,
    `contrasena_hash` VARCHAR(255) NOT NULL,
    `rol` ENUM('admin', 'docente', 'estudiante') NOT NULL,
    `nombres` VARCHAR(100) NOT NULL,
    `apellidos` VARCHAR(100) NOT NULL,
    `telefono` VARCHAR(15) NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,
    `estado` ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',

    UNIQUE INDEX `usuarios_dni_key`(`dni`),
    UNIQUE INDEX `usuarios_correo_key`(`correo`),
    INDEX `idx_usuarios_dni`(`dni`),
    INDEX `idx_usuarios_correo`(`correo`),
    INDEX `idx_usuarios_rol`(`rol`),
    INDEX `idx_usuarios_estado`(`estado`),
    PRIMARY KEY (`usuario_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estudiantes` (
    `estudiante_id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `codigo_interno` VARCHAR(20) NOT NULL,
    `modalidad` ENUM('ORDINARIO', 'PRIMERA_OPCION', 'DIRIMENCIA') NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `estudiantes_usuario_id_key`(`usuario_id`),
    UNIQUE INDEX `estudiantes_codigo_interno_key`(`codigo_interno`),
    INDEX `idx_estudiantes_codigo`(`codigo_interno`),
    INDEX `idx_modalidad`(`modalidad`),
    PRIMARY KEY (`estudiante_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cursos` (
    `curso_id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `area` ENUM('A', 'B', 'C', 'D') NOT NULL,
    `descripcion` TEXT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estado` ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',

    INDEX `idx_area`(`area`),
    INDEX `idx_estado`(`estado`),
    PRIMARY KEY (`curso_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grupos` (
    `grupo_id` INTEGER NOT NULL AUTO_INCREMENT,
    `area` ENUM('A', 'B', 'C', 'D') NOT NULL,
    `modalidad` ENUM('ORDINARIO', 'PRIMERA_OPCION', 'DIRIMENCIA') NOT NULL,
    `nombre_grupo` VARCHAR(50) NOT NULL,
    `dias` VARCHAR(50) NOT NULL,
    `hora_inicio` TIME NOT NULL,
    `hora_fin` TIME NOT NULL,
    `capacidad` INTEGER NOT NULL DEFAULT 30,
    `estado` ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    INDEX `idx_area_modalidad`(`area`, `modalidad`),
    INDEX `idx_estado`(`estado`),
    UNIQUE INDEX `uk_grupo_unico`(`area`, `modalidad`, `nombre_grupo`),
    PRIMARY KEY (`grupo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matriculas` (
    `matricula_id` INTEGER NOT NULL AUTO_INCREMENT,
    `estudiante_id` INTEGER NOT NULL,
    `grupo_id` INTEGER NOT NULL,
    `fecha_matricula` DATE NOT NULL,
    `monto_pagado` DECIMAL(10, 2) NOT NULL,
    `estado` ENUM('MATRICULADO', 'RETIRADO') NOT NULL DEFAULT 'MATRICULADO',
    `fecha_retiro` DATE NULL,
    `motivo_retiro` TEXT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    INDEX `idx_estudiante`(`estudiante_id`),
    INDEX `idx_grupo`(`grupo_id`),
    INDEX `idx_fecha_matricula`(`fecha_matricula`),
    INDEX `idx_estado`(`estado`),
    PRIMARY KEY (`matricula_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asistencias` (
    `asistencia_id` INTEGER NOT NULL AUTO_INCREMENT,
    `estudiante_id` INTEGER NOT NULL,
    `grupo_id` INTEGER NOT NULL,
    `fecha_clase` DATE NOT NULL,
    `estado` ENUM('PRESENTE', 'TARDANZA', 'AUSENTE') NOT NULL,
    `hora_registro` TIME NULL,
    `observaciones` TEXT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_fecha_clase`(`fecha_clase`),
    INDEX `idx_estudiante_fecha`(`estudiante_id`, `fecha_clase`),
    INDEX `idx_grupo_fecha`(`grupo_id`, `fecha_clase`),
    UNIQUE INDEX `uk_asistencia_diaria`(`estudiante_id`, `grupo_id`, `fecha_clase`),
    PRIMARY KEY (`asistencia_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluaciones` (
    `evaluacion_id` INTEGER NOT NULL AUTO_INCREMENT,
    `grupo_id` INTEGER NOT NULL,
    `numero_semana` INTEGER NOT NULL,
    `fecha_evaluacion` DATE NOT NULL,
    `descripcion` VARCHAR(200) NULL,
    `duracion_minutos` INTEGER NOT NULL DEFAULT 120,
    `estado` ENUM('PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA') NOT NULL DEFAULT 'PROGRAMADA',
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    INDEX `idx_grupo_fecha`(`grupo_id`, `fecha_evaluacion`),
    INDEX `idx_numero_semana`(`numero_semana`),
    INDEX `idx_estado`(`estado`),
    PRIMARY KEY (`evaluacion_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notas` (
    `nota_id` INTEGER NOT NULL AUTO_INCREMENT,
    `evaluacion_id` INTEGER NOT NULL,
    `estudiante_id` INTEGER NOT NULL,
    `curso_id` INTEGER NOT NULL,
    `nota` DECIMAL(4, 2) NOT NULL,
    `observaciones` TEXT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    INDEX `idx_evaluacion`(`evaluacion_id`),
    INDEX `idx_estudiante`(`estudiante_id`),
    INDEX `idx_curso`(`curso_id`),
    INDEX `idx_nota`(`nota`),
    UNIQUE INDEX `uk_nota_unica`(`evaluacion_id`, `estudiante_id`, `curso_id`),
    PRIMARY KEY (`nota_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `estudiantes` ADD CONSTRAINT `estudiantes_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`usuario_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matriculas` ADD CONSTRAINT `matriculas_estudiante_id_fkey` FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes`(`estudiante_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matriculas` ADD CONSTRAINT `matriculas_grupo_id_fkey` FOREIGN KEY (`grupo_id`) REFERENCES `grupos`(`grupo_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asistencias` ADD CONSTRAINT `asistencias_estudiante_id_fkey` FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes`(`estudiante_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asistencias` ADD CONSTRAINT `asistencias_grupo_id_fkey` FOREIGN KEY (`grupo_id`) REFERENCES `grupos`(`grupo_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluaciones` ADD CONSTRAINT `evaluaciones_grupo_id_fkey` FOREIGN KEY (`grupo_id`) REFERENCES `grupos`(`grupo_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notas` ADD CONSTRAINT `notas_estudiante_id_fkey` FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes`(`estudiante_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notas` ADD CONSTRAINT `notas_evaluacion_id_fkey` FOREIGN KEY (`evaluacion_id`) REFERENCES `evaluaciones`(`evaluacion_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notas` ADD CONSTRAINT `notas_curso_id_fkey` FOREIGN KEY (`curso_id`) REFERENCES `cursos`(`curso_id`) ON DELETE CASCADE ON UPDATE CASCADE;
