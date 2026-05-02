export interface UsuarioDTO {
    id_usuario?: number;
    nombre: string;
    email?: string;
    contraseña?: string;
    id_rol: number;
    foto_perfil?: string;
}

export interface UpdatePerfilDTO {
    nombre: string;
    email: string;
    foto_perfil?: string;
}

export interface UpdatePasswordDTO {
    passwordActual: string;
    passwordNueva: string;
}