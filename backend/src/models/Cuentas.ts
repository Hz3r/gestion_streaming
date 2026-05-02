interface Cuentas{
    id_cuenta:number,
    email:string,
    contraseña:string,
    fecha_compra:Date,
    fecha_expiracion:Date,
    id_plataforma:number,
    id_proveedor:number,
    estado:'Activa'|'Caída'|'Renovada',
    capacidad_total:number,
    perfiles_en_uso:number
}

export default Cuentas