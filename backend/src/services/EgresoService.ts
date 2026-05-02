import Egresos from "../models/Egresos";
import EgresosDTO from "../dtos/EgresosDTO";
import EgresoRepository from "../repositories/EgresoRepository";

class EgresoService {
    async crearEgreso(egreso: Egresos): Promise<EgresosDTO> {
        const id = await EgresoRepository.crear(egreso);
        return {
            id_egreso: id,
            ...egreso
        };
    }

    async obtenerTodos(): Promise<EgresosDTO[]> {
        return await EgresoRepository.obtenerTodos();
    }

    async obtenerPorMes(mes: number, anio: number): Promise<EgresosDTO[]> {
        return await EgresoRepository.obtenerPorMes(mes, anio);
    }

    async eliminarEgreso(id: number): Promise<void> {
        await EgresoRepository.eliminar(id);
    }
}

export default new EgresoService();
