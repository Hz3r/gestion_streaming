interface Contratos{
    id_contrato?:number,
    id_cliente:number,
    id_cuenta:number,
    id_metodo:number,
    perfiles_alquilados:number,
    fecha_inicio:Date,
    fecha_vencimiento:Date,
    precio_unitario:number,
    precio_total?:number,
    estado_pagado:boolean
 }

 export default Contratos;