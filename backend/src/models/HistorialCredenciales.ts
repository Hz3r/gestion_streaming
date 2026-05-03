export default interface HistorialCredenciales {
    id_historial?: number;
    id_cuenta: number;
    email_anterior?: string;
    email_nuevo?: string;
    pass_anterior?: string;
    pass_nuevo?: string;
    fecha_cambio?: string;
}
