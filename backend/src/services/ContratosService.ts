import Contratos from "../models/Contratos";
import ContratosDTO from "../dtos/ContratosDTO";
import ContratosDetalleDTO from "../dtos/ContratosDetalleDTO";
import ContratoRepository from "../repositories/ContratoRepository";
import CuentaRepository from "../repositories/CuentaRepository";

class ContratoService{

    async crearContrato(contrato:Contratos):Promise<ContratosDTO> {
        // 1. Validar que la cuenta exista
        const cuenta = await CuentaRepository.obtenerPorId(contrato.id_cuenta);
        if(!cuenta){
            throw new Error('La cuenta especificada no existe');
        }

        // 2. Validar que la cuenta esté activa
        if(cuenta.estado === 'Caída'){
            throw new Error('No se puede crear un contrato sobre una cuenta caída');
        }

        // 3. Validar disponibilidad de perfiles usando capacidad_total y perfiles_en_uso de la cuenta
        const perfilesDisponibles = cuenta.capacidad_total - cuenta.perfiles_en_uso;

        if(contrato.perfiles_alquilados > perfilesDisponibles){
            throw new Error(
                `No hay suficientes perfiles disponibles. ` +
                `Capacidad total: ${cuenta.capacidad_total}, ` +
                `En uso: ${cuenta.perfiles_en_uso}, ` +
                `Disponibles: ${perfilesDisponibles}, ` +
                `Solicitados: ${contrato.perfiles_alquilados}`
            );
        }

        // 4. Validar fechas
        const fechaInicio = new Date(contrato.fecha_inicio);
        const fechaVencimiento = new Date(contrato.fecha_vencimiento);

        if(fechaInicio >= fechaVencimiento){
            throw new Error('La fecha de inicio debe ser anterior a la fecha de vencimiento');
        }

        // 5. Calcular precio_total
        contrato.precio_total = contrato.precio_unitario * contrato.perfiles_alquilados;

        // 6. Insertar y obtener el id generado
        const id_contrato = await ContratoRepository.crearContrato(contrato);

        // 7. Actualizar perfiles_en_uso en la cuenta (incrementar)
        await CuentaRepository.actualizarPerfilesEnUso(contrato.id_cuenta, contrato.perfiles_alquilados);

        return {
            id_contrato,
            id_cliente: contrato.id_cliente,
            id_cuenta: contrato.id_cuenta,
            id_metodo: contrato.id_metodo,
            perfiles_alquilados: contrato.perfiles_alquilados,
            fecha_inicio: contrato.fecha_inicio,
            fecha_vencimiento: contrato.fecha_vencimiento,
            precio_unitario: contrato.precio_unitario,
            precio_total: contrato.precio_total,
            estado_pagado: contrato.estado_pagado
        };
    }

    async obtenerTodos():Promise<ContratosDTO[]> {
        const contratos = await ContratoRepository.obtenerTodos();
        return contratos.map(c => ({
            id_contrato: c.id_contrato!,
            id_cliente: c.id_cliente,
            id_cuenta: c.id_cuenta,
            id_metodo: c.id_metodo,
            perfiles_alquilados: c.perfiles_alquilados,
            fecha_inicio: c.fecha_inicio,
            fecha_vencimiento: c.fecha_vencimiento,
            precio_unitario: c.precio_unitario,
            precio_total: c.precio_total!,
            estado_pagado: c.estado_pagado
        }));
    }

    async obtenerPorId(id:number):Promise<ContratosDTO> {
        const contrato = await ContratoRepository.obtenerPorId(id);
        if(!contrato){
            throw new Error('Contrato no encontrado');
        }
        return {
            id_contrato: contrato.id_contrato!,
            id_cliente: contrato.id_cliente,
            id_cuenta: contrato.id_cuenta,
            id_metodo: contrato.id_metodo,
            perfiles_alquilados: contrato.perfiles_alquilados,
            fecha_inicio: contrato.fecha_inicio,
            fecha_vencimiento: contrato.fecha_vencimiento,
            precio_unitario: contrato.precio_unitario,
            precio_total: contrato.precio_total!,
            estado_pagado: contrato.estado_pagado
        };
    }

    async obtenerDetalleTodos():Promise<ContratosDetalleDTO[]> {
        return await ContratoRepository.obtenerDetalleTodos();
    }

    async obtenerDetallePorId(id:number):Promise<ContratosDetalleDTO> {
        const detalle = await ContratoRepository.obtenerDetallePorId(id);
        if(!detalle){
            throw new Error('Contrato no encontrado');
        }
        return detalle;
    }

    async obtenerPorCliente(id_cliente:number):Promise<ContratosDTO[]> {
        const contratos = await ContratoRepository.obtenerPorCliente(id_cliente);
        return contratos.map(c => ({
            id_contrato: c.id_contrato!,
            id_cliente: c.id_cliente,
            id_cuenta: c.id_cuenta,
            id_metodo: c.id_metodo,
            perfiles_alquilados: c.perfiles_alquilados,
            fecha_inicio: c.fecha_inicio,
            fecha_vencimiento: c.fecha_vencimiento,
            precio_unitario: c.precio_unitario,
            precio_total: c.precio_total!,
            estado_pagado: c.estado_pagado
        }));
    }

    async obtenerPorCuenta(id_cuenta:number):Promise<ContratosDTO[]> {
        const contratos = await ContratoRepository.obtenerPorCuenta(id_cuenta);
        return contratos.map(c => ({
            id_contrato: c.id_contrato!,
            id_cliente: c.id_cliente,
            id_cuenta: c.id_cuenta,
            id_metodo: c.id_metodo,
            perfiles_alquilados: c.perfiles_alquilados,
            fecha_inicio: c.fecha_inicio,
            fecha_vencimiento: c.fecha_vencimiento,
            precio_unitario: c.precio_unitario,
            precio_total: c.precio_total!,
            estado_pagado: c.estado_pagado
        }));
    }

    async actualizarContrato(id: number, contrato: Contratos): Promise<ContratosDTO> {
        // 1. Obtener el contrato actual de la base de datos
        const existe = await ContratoRepository.obtenerPorId(id);
        if (!existe) {
            throw new Error('Contrato no encontrado');
        }

        // 2. Normalizar IDs a números para comparaciones seguras
        const idCuentaActual = Number(existe.id_cuenta);
        const idCuentaNueva = Number(contrato.id_cuenta);
        const perfilesNuevos = Number(contrato.perfiles_alquilados);
        const perfilesAnteriores = Number(existe.perfiles_alquilados);

        // 3. Validar que la cuenta nueva exista y esté activa
        const cuentaNueva = await CuentaRepository.obtenerPorId(idCuentaNueva);
        if (!cuentaNueva) {
            throw new Error('La cuenta especificada no existe');
        }
        if (cuentaNueva.estado === 'Caída') {
            throw new Error('No se puede actualizar un contrato a una cuenta caída');
        }

        // 4. Validar disponibilidad de perfiles
        // Si es la misma cuenta, liberamos virtualmente los perfiles actuales para el cálculo
        const perfilesEnUsoReal = Number(cuentaNueva.perfiles_en_uso);
        const perfilesDisponibles = (idCuentaActual === idCuentaNueva)
            ? (Number(cuentaNueva.capacidad_total) - perfilesEnUsoReal + perfilesAnteriores)
            : (Number(cuentaNueva.capacidad_total) - perfilesEnUsoReal);

        if (perfilesNuevos > perfilesDisponibles) {
            throw new Error(
                `No hay suficientes perfiles disponibles en la cuenta. ` +
                `Disponibles: ${perfilesDisponibles}, Solicitados: ${perfilesNuevos}`
            );
        }

        // 5. Validar fechas
        const fechaInicio = new Date(contrato.fecha_inicio);
        const fechaVencimiento = new Date(contrato.fecha_vencimiento);
        if (fechaInicio >= fechaVencimiento) {
            throw new Error('La fecha de inicio debe ser anterior a la fecha de vencimiento');
        }

        // 6. Recalcular precio_total
        contrato.precio_total = Number(contrato.precio_unitario) * perfilesNuevos;

        // 7. Ajustar perfiles_en_uso en las cuentas involucradas
        if (idCuentaActual !== idCuentaNueva) {
            // Caso A: Cambió de cuenta
            // - Restar de la cuenta vieja
            await CuentaRepository.actualizarPerfilesEnUso(idCuentaActual, -perfilesAnteriores);
            // - Sumar a la cuenta nueva
            await CuentaRepository.actualizarPerfilesEnUso(idCuentaNueva, perfilesNuevos);
        } else {
            // Caso B: Misma cuenta, solo cambió la cantidad (o no)
            const diferencia = perfilesNuevos - perfilesAnteriores;
            if (diferencia !== 0) {
                await CuentaRepository.actualizarPerfilesEnUso(idCuentaNueva, diferencia);
            }
        }

        // 8. Actualizar el registro del contrato
        await ContratoRepository.actualizar(id, contrato);

        return {
            id_contrato: id,
            id_cliente: contrato.id_cliente,
            id_cuenta: idCuentaNueva,
            id_metodo: contrato.id_metodo,
            perfiles_alquilados: perfilesNuevos,
            fecha_inicio: contrato.fecha_inicio,
            fecha_vencimiento: contrato.fecha_vencimiento,
            precio_unitario: contrato.precio_unitario,
            precio_total: contrato.precio_total,
            estado_pagado: contrato.estado_pagado
        };
    }

    async eliminarContrato(id:number):Promise<void> {
        const existe = await ContratoRepository.obtenerPorId(id);
        if(!existe){
            throw new Error('Contrato no encontrado');
        }

        await ContratoRepository.eliminar(id);

        // Decrementar perfiles_en_uso de la cuenta asociada
        await CuentaRepository.actualizarPerfilesEnUso(existe.id_cuenta, -existe.perfiles_alquilados);
    }

}

export default new ContratoService();
