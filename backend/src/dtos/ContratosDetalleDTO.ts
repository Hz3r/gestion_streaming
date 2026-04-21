interface ContratosDetalleDTO{
    readonly id_contrato:number,
    readonly nombre_cliente:string,
    readonly email_cuenta:string,
    readonly nombre_plataforma:string,
    readonly nombre_metodo_pago:string,
    readonly perfiles_alquilados:number,
    readonly fecha_inicio:Date,
    readonly fecha_vencimiento:Date,
    readonly precio_unitario:number,
    readonly precio_total:number,
    readonly estado_pagado:boolean
}

export default ContratosDetalleDTO;
