export default interface CuentasRotativasDetalles {
    id_rotativa?: number;
    id_cuenta_fija: number;
    fecha_cancelacion_requerida: string;
    estado_vigencia?: 'Activo' | 'Inactivo';
}
