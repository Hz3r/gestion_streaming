import { ContratoDetalle } from "../models/Contratos.js";

interface ContratosDTO {
    readonly id_contrato: number;
    readonly id_cliente: number;
    readonly id_metodo: number;
    readonly fecha_inicio: Date;
    readonly fecha_vencimiento: Date;
    readonly precio_unitario?: number;
    readonly precio_total: number;
    readonly estado_pagado: boolean;
    readonly detalles?: ContratoDetalle[];
}

export default ContratosDTO;