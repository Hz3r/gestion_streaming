interface Usuario {
    id_usuario: number;
    nombre: string;
    email?: string;
    contraseña: string;
    id_rol: number;
    foto_perfil?: string;
}

export default Usuario;
