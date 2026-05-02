import Cuentas from "../models/Cuentas";
import CuentasDTO from "../dtos/CuentasDTO";
import CuentaRepository from "../repositories/CuentaRepository";

class CuentaService {

    async crearCuenta(cuentas: Cuentas): Promise<CuentasDTO> {
        const id = await CuentaRepository.crearCuenta(cuentas);
        // Al crear, no tenemos los nombres de plataforma/proveedor por el JOIN, 
        // pero podemos retornar el objeto básico o hacer un fetch extra si es necesario.
        // Por ahora retornamos lo básico.
        return {
            id_cuenta: id,
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
            id_cuenta: c.id_cuenta,
            email: c.email,
            contraseña: c.contraseña,
            fecha_compra: c.fecha_compra,
            fecha_expiracion: c.fecha_expiracion,
            id_plataforma: c.id_plataforma,
            plataforma: (c as any).plataforma,
            id_proveedor: c.id_proveedor,
            proveedor: (c as any).proveedor,
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
            id_cuenta: cuenta.id_cuenta,
            email: cuenta.email,
            contraseña: cuenta.contraseña,
            fecha_compra: cuenta.fecha_compra,
            fecha_expiracion: cuenta.fecha_expiracion,
            id_plataforma: cuenta.id_plataforma,
            plataforma: (cuenta as any).plataforma,
            id_proveedor: cuenta.id_proveedor,
            proveedor: (cuenta as any).proveedor,
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
            id_cuenta: id,
            email: cuentas.email,
            contraseña: cuentas.contraseña,
            fecha_compra: cuentas.fecha_compra,
            fecha_expiracion: cuentas.fecha_expiracion,
            id_plataforma: cuentas.id_plataforma,
            id_proveedor: cuentas.id_proveedor,
            estado: cuentas.estado,
            capacidad_total: cuentas.capacidad_total,
            perfiles_en_uso: (existe as any).perfiles_en_uso
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