//librerias
import bcrypt from 'bcrypt';
import UsuarioRepository from '../repositories/UsuarioRepository';
import Usuario from '../models/Usuario';
import { UsuarioDTO, UpdatePerfilDTO, UpdatePasswordDTO } from '../dtos/UsuarioDTO';


class UsuarioService{

    //METODO DE REGISTRO 
    async registrarUsuario(datos:Usuario): Promise<number> {

        //validar si ya existe el usuario
            
        const existe =  await UsuarioRepository.buscarPorNombre(datos.nombre);    
        if(existe){
            throw new Error('El usuario ya existe');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(datos.contraseña, salt);
        
        const nuevoUsuario : Usuario ={
            ...datos,
            contraseña: passwordHash,
        }

        return await UsuarioRepository.crear(nuevoUsuario);

    }


    async login(nombre: string, clavePlana: string): Promise<UsuarioDTO> {
        // 1. Buscar al usuario
        const usuario = await UsuarioRepository.buscarPorNombre(nombre);
        if (!usuario) throw new Error('Credenciales inválidas');

        // 2. Comparar contraseñas (La encriptada vs la que escribió el usuario)
        const esCorrecta = await bcrypt.compare(clavePlana, usuario.contraseña);
        if (!esCorrecta) throw new Error('Credenciales inválidas');

        // 3. Mapear a DTO (No devolvemos la contraseña)
        const userDTO: UsuarioDTO = {
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre,
            email: usuario.email,
            id_rol: usuario.id_rol,
            foto_perfil: usuario.foto_perfil
        };

        return userDTO;
    }

    async actualizarPerfil(id:number, datos:UpdatePerfilDTO):Promise<number>{
        const usuarioExistente = await UsuarioRepository.obtenerPorId(id);
        if(!usuarioExistente){
            throw new Error('Usuario no encontrado');
        }
        return await UsuarioRepository.actualizarPerfil(id, datos.nombre, datos.email, datos.foto_perfil);
    }

    async actualizarPassword(id:number, datos:UpdatePasswordDTO):Promise<number>{
        const usuario = await UsuarioRepository.obtenerPorId(id);
        if(!usuario) throw new Error('Usuario no encontrado');

        const esCorrecta = await bcrypt.compare(datos.passwordActual, usuario.contraseña);
        if(!esCorrecta) throw new Error('La contraseña actual es incorrecta');

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(datos.passwordNueva, salt);

        return await UsuarioRepository.actualizarPassword(id, passwordHash);
    }

    async eliminar(id:number):Promise<number>{

        const usuario = await UsuarioRepository.obtenerPorId(id);
        if(!usuario){
            throw new Error('Usuario no encontrado');
        }
        return await UsuarioRepository.eliminar(id);
    }

    async actualizar(id:number, usuario:Usuario):Promise<number>{
        const usuarioExistente = await UsuarioRepository.obtenerPorId(id);
        if(!usuarioExistente){
            throw new Error('Usuario no encontrado');
        }
        return await UsuarioRepository.actualizar(id, usuario);
    }

    async obtenerTodos():Promise<Usuario[]>{ 
        return await UsuarioRepository.obtenerTodos();
    }

    async obtenerPorId(id:number):Promise<Usuario | null>{
        return await UsuarioRepository.obtenerPorId(id);
    }

    async obtenerEstadisticas(id:number): Promise<{ total_contratos: number }> {
        return await UsuarioRepository.obtenerEstadisticas(id);
    }







}

export default new UsuarioService();
