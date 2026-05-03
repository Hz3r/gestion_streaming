export default interface LankCuentasMadre {
    id_lank_madre?: number;
    correo: string;
    password?: string;
    metodo_acceso?: 'Manual' | 'Google';
    numero_vinculado?: string;
    verificado?: boolean;
    yape_numero?: string;
    monto_farming?: number;
    bono_activo?: boolean;
    estado_baneo?: 'Limpio' | 'Baneado';
    fecha_desbaneo?: string;
    plataformas_activas?: string; // JSON string
    pagado?: boolean;
    fecha_creacion?: string;
}
