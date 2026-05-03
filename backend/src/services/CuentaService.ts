import Cuentas from "../models/Cuentas";
import CuentasDTO from "../dtos/CuentasDTO";
import CuentaRepository from "../repositories/CuentaRepository";

class CuentaService {

    async crearCuenta(cuentas: Cuentas): Promise<CuentasDTO> {
        // La lógica financiera se maneja mediante TRIGGERS en la base de datos
        const id = await CuentaRepository.crearCuenta(cuentas);
        return {
            id_cuenta: id,
            ...cuentas,
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
            perfiles_en_uso: c.perfiles_en_uso,
            costo_total: c.costo_total,
            meses_duracion: c.meses_duracion
        }));
    }

    async obtenerPorId(id: number): Promise<CuentasDTO> {
        const cuenta = await CuentaRepository.obtenerPorId(id);
        if (!cuenta) throw new Error('Cuenta no encontrada');
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
            perfiles_en_uso: cuenta.perfiles_en_uso,
            costo_total: cuenta.costo_total,
            meses_duracion: cuenta.meses_duracion
        };
    }

    async actualizarCuenta(id: number, cuentas: Cuentas): Promise<CuentasDTO> {
        const existe = await CuentaRepository.obtenerPorId(id);
        if (!existe) throw new Error('Cuenta no encontrada');

        // Sincronización de Historial de Credenciales (Módulo Cuentas Rotativas)
        if (existe.email !== cuentas.email || existe.contraseña !== cuentas.contraseña) {
            const HistorialRepository = require('../repositories/HistorialCredencialesRepository').default;
            await HistorialRepository.crear({
                id_cuenta: id,
                email_anterior: existe.email,
                email_nuevo: cuentas.email,
                pass_anterior: existe.contraseña,
                pass_nuevo: cuentas.contraseña
            });
        }

        // La sincronización de egresos (Inversión, Caída/Recuperación) 
        // se maneja ahora mediante el TRIGGER tg_sincronizar_finanzas_update
        await CuentaRepository.actualizar(id, cuentas);
        
        return {
            id_cuenta: id,
            ...cuentas,
            perfiles_en_uso: existe.perfiles_en_uso
        };
    }

    async eliminarCuenta(id: number): Promise<void> {
        const existe = await CuentaRepository.obtenerPorId(id);
        if (!existe) throw new Error('Cuenta no encontrada');
        
        // La limpieza de egresos se maneja mediante el TRIGGER tg_limpiar_finanzas_delete
        await CuentaRepository.eliminar(id);
    }
}

export default new CuentaService();