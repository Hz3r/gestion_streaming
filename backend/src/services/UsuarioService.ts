//librerias
import bcrypt from 'bcrypt';
import UsuarioRepository from '../repositories/UsuarioRepository';
import Usuario from '../models/Usuario';
import UsuarioDTO from '../dtos/UsuarioDTO';


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
            nombre: usuario.nombre,
            id_rol: usuario.id_rol
        };

        return userDTO;
    }







}

export default new UsuarioService();
