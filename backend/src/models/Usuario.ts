interface Usuario {
    id_usuario: number;
    nombre: string;
    email?: string;
    contraseña: string;
    id_rol: number;
    foto_perfil?: string;
    permisos?: string[]; // Traídos del join con roles
}

export default Usuario;
