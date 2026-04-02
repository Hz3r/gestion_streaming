interface CuentasDTO{
    email:string,
    contraseña:string,
    fecha_compra: string|Date,
    fecha_expiracion: string|Date,
    id_plataforma:number,
    id_proveedor:number,
    estado:'Activa'|'Caída'|'Renovada'
}

export default CuentasDTO