import type { FinanzasResumenDTO, FinanzasPendienteDTO } from "../dtos/FinanzasDTO";
import FinanzasRepository from "../repositories/FinanzasRepository";

class FinanzasService {

    // Resumen general de todos los meses disponibles
    async obtenerResumenGeneral(): Promise<FinanzasResumenDTO[]> {
        return await FinanzasRepository.obtenerResumenGeneral();
    }

    // Resumen de un mes/año específico
    async obtenerResumenMensual(mes: number, anio: number): Promise<FinanzasResumenDTO> {
        if (mes < 1 || mes > 12) {
            throw new Error('El mes debe estar entre 1 y 12');
        }
        if (anio < 2000 || anio > 2100) {
            throw new Error('Año inválido');
        }

        const resumen = await FinanzasRepository.obtenerResumenMensual(mes, anio);
        if (!resumen) {
            // Si no hay datos, retornar ceros
            return {
                mes,
                anio,
                ingresos_reales: 0,
                ingresos_pendientes: 0,
                ingresos_proyectados: 0
            };
        }
        return resumen;
    }

    // Resumen anual (todos los meses de un año)
    async obtenerResumenAnual(anio: number): Promise<FinanzasResumenDTO[]> {
        if (anio < 2000 || anio > 2100) {
            throw new Error('Año inválido');
        }
        return await FinanzasRepository.obtenerResumenAnual(anio);
    }

    // Detalle de contratos pendientes de un mes
    async obtenerPendientesMensual(mes: number, anio: number): Promise<FinanzasPendienteDTO[]> {
        if (mes < 1 || mes > 12) {
            throw new Error('El mes debe estar entre 1 y 12');
        }
        return await FinanzasRepository.obtenerPendientesMensual(mes, anio);
    }
}

export default new FinanzasService();
