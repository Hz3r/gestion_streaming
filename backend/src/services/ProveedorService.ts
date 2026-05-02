import ProveedorRepository from "../repositories/ProveedorRepository";
import Proveedor from "../models/Proveedor";
import ProveedorDTO from "../dtos/ProveedorDTO";

class ProveedorService {

    async crearProveedor(proveedor: Proveedor): Promise<ProveedorDTO> {
        const id = await ProveedorRepository.crearProveedor(proveedor);
        return {
            id_proveedor: id,
            nombre: proveedor.nombre,
            url_contacto: proveedor.url_contacto,
            reputacion: proveedor.reputacion
        }
    }

    async obtenerTodos(): Promise<ProveedorDTO[]> {
        const proveedores = await ProveedorRepository.obtenerTodos();
        return proveedores.map(p => ({
            id_proveedor: p.id_proveedor,
            nombre: p.nombre,
            url_contacto: p.url_contacto,
            reputacion: p.reputacion
        }));
    }

    async obtenerPorId(id: number): Promise<ProveedorDTO> {
        const proveedor = await ProveedorRepository.obtenerPorId(id);
        if (!proveedor) {
            throw new Error('Proveedor no encontrado');
        }
        return {
            id_proveedor: proveedor.id_proveedor,
            nombre: proveedor.nombre,
            url_contacto: proveedor.url_contacto,
            reputacion: proveedor.reputacion
        }
    }

    async actualizarProveedor(id: number, proveedor: Proveedor): Promise<ProveedorDTO> {
        const existe = await ProveedorRepository.obtenerPorId(id);
        if (!existe) {
            throw new Error('Proveedor no encontrado');
        }
        await ProveedorRepository.actualizar(id, proveedor);
        return {
            id_proveedor: id,
            nombre: proveedor.nombre,
            url_contacto: proveedor.url_contacto,
            reputacion: proveedor.reputacion
        }
    }

    async eliminarProveedor(id: number): Promise<void> {
        const existe = await ProveedorRepository.obtenerPorId(id);
        if (!existe) {
            throw new Error('Proveedor no encontrado');
        }
        await ProveedorRepository.eliminar(id);
    }
}

export default new ProveedorService();