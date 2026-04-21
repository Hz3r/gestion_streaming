interface ContratosDTO{
    readonly id_contrato:number,
    readonly id_cliente:number,
    readonly id_cuenta:number,
    readonly id_metodo:number,
    readonly perfiles_alquilados:number,
    readonly fecha_inicio:Date,
    readonly fecha_vencimiento:Date,
    readonly precio_unitario:number,
    readonly precio_total:number,
    readonly estado_pagado:boolean
 }

 export default ContratosDTO;