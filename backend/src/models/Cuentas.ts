interface Cuentas {
    id_cuenta: number;
    email: string;
    contraseña: string;
    fecha_compra: Date;
    fecha_expiracion: Date;
    id_plataforma: number;
    id_proveedor: number;
    estado: 'Activa' | 'Caída' | 'Renovada';
    capacidad_total: number;
    perfiles_en_uso: number;
    // Nuevos campos
    costo_total: number;
    meses_duracion: number;
    es_lank?: boolean;
}

export default Cuentas;