import ClienteRepository from "../repositories/ClienteRepository.js";
import Cliente from "../models/Cliente.js";
import ClienteDTO from "../dtos/ClienteDTO.js";

class ClienteService {
    async crearCliente(cliente: Cliente): Promise<ClienteDTO> {
        const id = await ClienteRepository.crear(cliente);
        return {
            id_cliente: id,
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            estado: cliente.estado,
            tipo: cliente.tipo
        };
    }

    async obtenerTodos(): Promise<ClienteDTO[]> {
        const clientes = await ClienteRepository.obtenerTodos();
        return clientes.map(c => ({
            id_cliente: c.id_cliente!,
            nombre: c.nombre,
            telefono: c.telefono,
            estado: c.estado,
            tipo: c.tipo
        }));
    }

    async obtenerPorId(id: number): Promise<ClienteDTO> {
        const cliente = await ClienteRepository.obtenerPorId(id);
        if (!cliente) {
            throw new Error('Cliente no encontrado');
        }
        return {
            id_cliente: cliente.id_cliente!,
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            estado: cliente.estado,
            tipo: cliente.tipo
        };
    }

    async actualizarCliente(id: number, cliente: Cliente): Promise<ClienteDTO> {
        const existe = await ClienteRepository.obtenerPorId(id);
        if (!existe) {
            throw new Error('Cliente no encontrado');
        }
        await ClienteRepository.actualizar(id, cliente);
        return {
            id_cliente: id,
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            estado: cliente.estado,
            tipo: cliente.tipo
        };
    }

    async eliminarCliente(id: number): Promise<void> {
        const existe = await ClienteRepository.obtenerPorId(id);
        if (!existe) {
            throw new Error('Cliente no encontrado');
        }
        await ClienteRepository.eliminar(id);
    }
}

export default new ClienteService();
