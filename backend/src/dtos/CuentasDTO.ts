interface CuentasDTO{
    email:string,
    contraseña:string,
    fecha_compra: string|Date,
    fecha_expiracion: string|Date,
    id_plataforma:number,
    id_proveedor:number,
    estado:'Activa'|'Caída'|'Renovada',
    capacidad_total:number,
    perfiles_en_uso:number
}

export default CuentasDTO