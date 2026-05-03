export interface ContratoDetalle {
    id_cuenta: number;
    perfiles_alquilados: number;
}

interface Contratos {
    id_contrato?: number;
    id_cliente: number;
    id_metodo: number;
    fecha_inicio: Date;
    fecha_vencimiento: Date;
    precio_unitario?: number;
    precio_total: number;
    estado_pagado: boolean;
    detalles?: ContratoDetalle[]; // Lista de cuentas (V1.5)
    tipo_contrato?: string;
}

export default Contratos;