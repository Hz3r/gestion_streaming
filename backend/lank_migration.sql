-- 1. TABLA: CUENTAS LANK (Tus activos de cobro)
CREATE TABLE IF NOT EXISTS lank_cuentas_madre (
    id_lank_madre INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(180) NOT NULL,
    password VARCHAR(150),
    metodo_acceso ENUM('Manual', 'Google') DEFAULT 'Manual',
    numero_vinculado VARCHAR(20),
    verificado TINYINT(1) DEFAULT 0,
    yape_numero VARCHAR(20),
    monto_farming DECIMAL(10,2) DEFAULT 0.00,
    bono_activo TINYINT(1) DEFAULT 0,
    estado_baneo ENUM('Limpio', 'Baneado') DEFAULT 'Limpio',
    fecha_desbaneo DATETIME NULL,
    plataformas_activas JSON,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. TABLA: CUENTAS STREAMING ROTATIVAS (Cuentas Cambiantes)
CREATE TABLE IF NOT EXISTS cuentas_rotativas_detalles (
    id_rotativa INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_cuenta_fija INT UNSIGNED NOT NULL,
    fecha_cancelacion_requerida DATE NOT NULL,
    estado_vigencia ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
    CONSTRAINT fk_rotativa_cuenta_fija FOREIGN KEY (id_cuenta_fija) REFERENCES cuentas(id_cuenta) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. AUDITORÍA DE CREDENCIALES (El historial de cambios de email/pass)
CREATE TABLE IF NOT EXISTS historial_credenciales (
    id_historial INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_cuenta INT UNSIGNED NOT NULL,
    email_anterior VARCHAR(180),
    email_nuevo VARCHAR(180),
    pass_anterior VARCHAR(150),
    pass_nuevo VARCHAR(150),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historial_cuenta FOREIGN KEY (id_cuenta) REFERENCES cuentas(id_cuenta) ON DELETE CASCADE
) ENGINE=InnoDB;
