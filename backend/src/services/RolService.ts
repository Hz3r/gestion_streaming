import RolRepository from '../repositories/RolRepository';
import Rol from '../models/Roles';
import RolDTO from '../dtos/RolDTO';


class RolService {

    async obtenerTodos(): Promise<RolDTO[]> {
        const roles = await RolRepository.obtenerTodos();
        return roles.map(rol => ({
            id_rol: rol.id_rol,
            nombre: rol.nombre
        }));
    }

    async obtenerPorId(id: number): Promise<RolDTO> {
        const rol = await RolRepository.obtenerPorId(id);
        if (!rol) {
            throw new Error('Rol no encontrado');
        }
        return {
            id_rol: rol.id_rol,
            nombre: rol.nombre
        };
    }

    async crear(datos: Rol): Promise<number> {
        // Validar que no exista un rol con ese nombre
        const existe = await RolRepository.buscarPorNombre(datos.nombre);
        if (existe) {
            throw new Error('Ya existe un rol con ese nombre');
        }
        return await RolRepository.crear(datos);
    }

    async actualizar(id: number, datos: Rol): Promise<boolean> {
        // Validar que el rol exista
        const rolExistente = await RolRepository.obtenerPorId(id);
        if (!rolExistente) {
            throw new Error('Rol no encontrado');
        }

        // Validar que no exista otro rol con el mismo nombre
        const duplicado = await RolRepository.buscarPorNombre(datos.nombre);
        if (duplicado && duplicado.id_rol !== id) {
            throw new Error('Ya existe otro rol con ese nombre');
        }

        return await RolRepository.actualizar(id, datos);
    }

    async eliminar(id: number): Promise<boolean> {
        const rol = await RolRepository.obtenerPorId(id);
        if (!rol) {
            throw new Error('Rol no encontrado');
        }
        return await RolRepository.eliminar(id);
    }

}

export default new RolService();
