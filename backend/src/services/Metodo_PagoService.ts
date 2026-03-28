import Metodo_PagoRepository from "../repositories/Metodo_PagoRepository";
import Metodo_Pago from "../models/Metodo_Pago";
import Metodo_PagoDTO from "../dtos/Metodo_PagoDTO";

class Metodo_PagoService {

    async crearMetodo(metodo_pago: Metodo_Pago): Promise<Metodo_PagoDTO> {
        await Metodo_PagoRepository.crear(metodo_pago);
        return {
            nombre: metodo_pago.nombre
        }
    }

    async obtenerTodos(): Promise<Metodo_PagoDTO[]> {
        const metodos = await Metodo_PagoRepository.obtenerTodos();
        return metodos.map(m => ({
            nombre: m.nombre
        }));
    }

    async obtenerPorId(id: number): Promise<Metodo_PagoDTO> {
        const metodo = await Metodo_PagoRepository.obtenerPorId(id);
        if (!metodo) {
            throw new Error('Método de pago no encontrado');
        }
        return {
            nombre: metodo.nombre
        }
    }

    async actualizarMetodo(id: number, metodo_pago: Metodo_Pago): Promise<Metodo_PagoDTO> {
        const existe = await Metodo_PagoRepository.obtenerPorId(id);
        if (!existe) {
            throw new Error('Método de pago no encontrado');
        }
        await Metodo_PagoRepository.actualizar(id, metodo_pago);
        return {
            nombre: metodo_pago.nombre
        }
    }

    async eliminarMetodo(id: number): Promise<void> {
        const existe = await Metodo_PagoRepository.obtenerPorId(id);
        if (!existe) {
            throw new Error('Método de pago no encontrado');
        }
        await Metodo_PagoRepository.eliminar(id);
    }
}

export default new Metodo_PagoService();
