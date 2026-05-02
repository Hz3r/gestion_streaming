interface Notificacion {
    id_notificacion: number;
    id_usuario: number;
    titulo: string;
    mensaje: string;
    tipo: 'success' | 'warning' | 'info' | 'error';
    leida: boolean;
    link?: string;
    fecha_creacion: Date;
}

export default Notificacion;
