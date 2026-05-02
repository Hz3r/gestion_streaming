import Cuentas from "../models/Cuentas";
import CuentasDTO from "../dtos/CuentasDTO";
import CuentaRepository from "../repositories/CuentaRepository";

class CuentaService {

    async crearCuenta(cuentas: Cuentas): Promise<CuentasDTO> {
        await CuentaRepository.crearCuenta(cuentas);
        return {
            email: cuentas.email,
            contraseña: cuentas.contraseña,
            fecha_compra: cuentas.fecha_compra,
            fecha_expiracion: cuentas.fecha_expiracion,
            id_plataforma: cuentas.id_plataforma,
            id_proveedor: cuentas.id_proveedor,
            estado: cuentas.estado,
            capacidad_total: cuentas.capacidad_total,
            perfiles_en_uso: 0
        };
    }

    async obtenerTodas(): Promise<CuentasDTO[]> {
        const cuentas = await CuentaRepository.obtenerTodas();
        return cuentas.map(c => ({
            email: c.email,
            contraseña: c.contraseña,
            fecha_compra: c.fecha_compra,
            fecha_expiracion: c.fecha_expiracion,
            id_plataforma: c.id_plataforma,
            id_proveedor: c.id_proveedor,
            estado: c.estado,
            capacidad_total: c.capacidad_total,
            perfiles_en_uso: c.perfiles_en_uso
        }));
    }

    async obtenerPorId(id: number): Promise<CuentasDTO> {
        const cuenta = await CuentaRepository.obtenerPorId(id);
        if (!cuenta) {
            throw new Error('Cuenta no encontrada');
        }
        return {
            email: cuenta.email,
            contraseña: cuenta.contraseña,
            fecha_compra: cuenta.fecha_compra,
            fecha_expiracion: cuenta.fecha_expiracion,
            id_plataforma: cuenta.id_plataforma,
            id_proveedor: cuenta.id_proveedor,
            estado: cuenta.estado,
            capacidad_total: cuenta.capacidad_total,
            perfiles_en_uso: cuenta.perfiles_en_uso
        };
    }

    async actualizarCuenta(id: number, cuentas: Cuentas): Promise<CuentasDTO> {
        const existe = await CuentaRepository.obtenerPorId(id);
        if (!existe) {
            throw new Error('Cuenta no encontrada');
        }
        await CuentaRepository.actualizar(id, cuentas);
        return {
            email: cuentas.email,
            contraseña: cuentas.contraseña,
            fecha_compra: cuentas.fecha_compra,
            fecha_expiracion: cuentas.fecha_expiracion,
            id_plataforma: cuentas.id_plataforma,
            id_proveedor: cuentas.id_proveedor,
            estado: cuentas.estado,
            capacidad_total: cuentas.capacidad_total,
            perfiles_en_uso: existe.perfiles_en_uso
        };
    }

    async eliminarCuenta(id: number): Promise<void> {
        const existe = await CuentaRepository.obtenerPorId(id);
        if (!existe) {
            throw new Error('Cuenta no encontrada');
        }
        await CuentaRepository.eliminar(id);
    }
}

export default new CuentaService();