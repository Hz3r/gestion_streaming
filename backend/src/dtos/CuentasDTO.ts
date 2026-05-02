interface CuentasDTO{
    id_cuenta?: number;
    email: string;
    contraseña: string;
    fecha_compra: string | Date;
    fecha_expiracion: string | Date;
    id_plataforma: number;
    plataforma?: string;
    id_proveedor: number;
    proveedor?: string;
    estado: 'Activa' | 'Caída' | 'Renovada';
    capacidad_total: number;
    perfiles_en_uso: number;
}

export default CuentasDTO