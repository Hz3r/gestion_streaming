
interface Rol {
    id_rol: number;
    nombre: string;
    permisos?: string[]; // JSON array de la DB
}

export default Rol;
