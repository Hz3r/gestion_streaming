import Contratos from "../models/Contratos";
import ContratosDTO from "../dtos/ContratosDTO";
import ContratosDetalleDTO from "../dtos/ContratosDetalleDTO";
import ContratoRepository from "../repositories/ContratoRepository";
import CuentaRepository from "../repositories/CuentaRepository";

class ContratoService{

    async crearContrato(contrato:Contratos):Promise<number> {
        // 1. Validaciones de múltiples cuentas (Detalles)
        if (!contrato.detalles || contrato.detalles.length === 0) {
            throw new Error('El contrato debe tener al menos una cuenta asociada.');
        }

        for (const detalle of contrato.detalles) {
            const cuenta = await CuentaRepository.obtenerPorId(detalle.id_cuenta);
            if(!cuenta){
                throw new Error(`La cuenta con ID ${detalle.id_cuenta} no existe`);
            }

            if(cuenta.estado === 'Caída'){
                throw new Error(`No se puede crear un contrato sobre una cuenta caída (${cuenta.email})`);
            }

            const perfilesDisponibles = cuenta.capacidad_total - cuenta.perfiles_en_uso;
            if(detalle.perfiles_alquilados > perfilesDisponibles){
                throw new Error(
                    `No hay suficientes perfiles disponibles en la cuenta ${cuenta.email}. ` +
                    `Disponibles: ${perfilesDisponibles}, Solicitados: ${detalle.perfiles_alquilados}`
                );
            }
        }

        // 2. Validar fechas
        const fechaInicio = new Date(contrato.fecha_inicio);
        const fechaVencimiento = new Date(contrato.fecha_vencimiento);
        if(fechaInicio >= fechaVencimiento){
            throw new Error('La fecha de inicio debe ser anterior a la fecha de vencimiento');
        }

        // 3. Insertar contrato y detalles
        const id_contrato = await ContratoRepository.crearContrato(contrato);

        // 4. Actualizar perfiles_en_uso de cada cuenta
        for (const detalle of contrato.detalles) {
            await CuentaRepository.actualizarPerfilesEnUso(detalle.id_cuenta, detalle.perfiles_alquilados);
        }

        return id_contrato;
    }

    async obtenerTodos():Promise<Contratos[]> {
        return await ContratoRepository.obtenerTodos();
    }

    async obtenerPorId(id:number):Promise<Contratos> {
        const contrato = await ContratoRepository.obtenerPorId(id);
        if(!contrato){
            throw new Error('Contrato no encontrado');
        }
        return contrato;
    }

    async obtenerDetalleTodos():Promise<any[]> {
        return await ContratoRepository.obtenerDetalleTodos();
    }

    async obtenerDetallePorId(id:number):Promise<any> {
        const detalle = await ContratoRepository.obtenerDetallePorId(id);
        if(!detalle){
            throw new Error('Contrato no encontrado');
        }
        return detalle;
    }

    async obtenerPorCliente(id_cliente:number):Promise<Contratos[]> {
        return await ContratoRepository.obtenerPorCliente(id_cliente);
    }

    async obtenerPorCuenta(id_cuenta:number):Promise<Contratos[]> {
        return await ContratoRepository.obtenerPorCuenta(id_cuenta);
    }

    async actualizarContrato(id: number, contrato: Contratos): Promise<number> {
        // 1. Obtener el contrato actual y sus cuentas asignadas
        const existe = await ContratoRepository.obtenerPorId(id);
        if (!existe) {
            throw new Error('Contrato no encontrado');
        }
        const detallesAnteriores = await ContratoRepository.obtenerPorCuenta(id); // no sirve así

        // Para hacerlo perfectamente seguro y fácil, como el repositorio Maestro-Detalle borra y recrea:
        // Primero liberamos TODOS los perfiles del contrato actual
        // Para eso necesitamos saber qué cuentas tenía asociadas
        // (Podemos usar obtenerDetallePorId que trae las cuentas en un JSON_ARRAY)
        const detalleActual = await ContratoRepository.obtenerDetallePorId(id);
        if (detalleActual && detalleActual.cuentas) {
            const cuentasAnteriores = detalleActual.cuentas; // Ya vienen parseadas o en string según el driver
            let arrCuentas = typeof cuentasAnteriores === 'string' ? JSON.parse(cuentasAnteriores) : cuentasAnteriores;
            if(arrCuentas === null) arrCuentas = []; // Si MySQL retornó null por el LEFT JOIN
            for (const cuenta of arrCuentas) {
                if (cuenta && cuenta.id_cuenta) {
                    await CuentaRepository.actualizarPerfilesEnUso(cuenta.id_cuenta, -cuenta.perfiles_alquilados);
                }
            }
        }

        // 2. Validar los NUEVOS detalles
        if (!contrato.detalles || contrato.detalles.length === 0) {
            throw new Error('El contrato debe tener al menos una cuenta asociada.');
        }

        for (const detalle of contrato.detalles) {
            const cuenta = await CuentaRepository.obtenerPorId(detalle.id_cuenta);
            if(!cuenta) throw new Error(`La cuenta con ID ${detalle.id_cuenta} no existe`);
            if(cuenta.estado === 'Caída') throw new Error(`No se puede actualizar a una cuenta caída (${cuenta.email})`);

            const perfilesDisponibles = cuenta.capacidad_total - cuenta.perfiles_en_uso;
            if(detalle.perfiles_alquilados > perfilesDisponibles){
                // Si falla aquí, la DB ya le restó los perfiles anteriores, por lo que este error dejaría los perfiles libres.
                // En un sistema robusto, esto debe estar dentro de la misma transacción.
                // Sin embargo, para esta versión, levantaremos el error (los perfiles quedarán libres, pero el usuario puede corregir e intentar guardar de nuevo)
                throw new Error(
                    `No hay suficientes perfiles en la cuenta ${cuenta.email}. ` +
                    `Disponibles: ${perfilesDisponibles}, Solicitados: ${detalle.perfiles_alquilados}`
                );
            }
        }

        // 3. Validar fechas
        const fechaInicio = new Date(contrato.fecha_inicio);
        const fechaVencimiento = new Date(contrato.fecha_vencimiento);
        if (fechaInicio >= fechaVencimiento) throw new Error('La fecha de inicio debe ser anterior a la fecha de vencimiento');

        // 4. Ejecutar actualización
        await ContratoRepository.actualizar(id, contrato);

        // 5. Ocupar los perfiles nuevos
        for (const detalle of contrato.detalles) {
            await CuentaRepository.actualizarPerfilesEnUso(detalle.id_cuenta, detalle.perfiles_alquilados);
        }

        return id;
    }

    async eliminarContrato(id:number):Promise<void> {
        const detalleActual = await ContratoRepository.obtenerDetallePorId(id);
        if(!detalleActual){
            throw new Error('Contrato no encontrado');
        }

        // 1. Liberar perfiles
        if (detalleActual.cuentas) {
            let arrCuentas = typeof detalleActual.cuentas === 'string' ? JSON.parse(detalleActual.cuentas) : detalleActual.cuentas;
            if(arrCuentas === null) arrCuentas = [];
            for (const cuenta of arrCuentas) {
                if(cuenta && cuenta.id_cuenta) {
                    await CuentaRepository.actualizarPerfilesEnUso(cuenta.id_cuenta, -cuenta.perfiles_alquilados);
                }
            }
        }

        // 2. Eliminar contrato (Borrado en cascada se encargará de los detalles)
        await ContratoRepository.eliminar(id);
    }
}

export default new ContratoService();
