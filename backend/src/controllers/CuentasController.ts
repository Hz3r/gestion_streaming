import CuentasService from "../services/CuentaService.js";
import NotificacionService from "../services/NotificacionService.js";
import { Request, Response } from "express";

class CuentasController {

    async crear(req: Request, res: Response) {
        try {
            const datos = req.body;
            const resultado = await CuentasService.crearCuenta(datos);
            
            // Disparar escaneo de notificaciones
            NotificacionService.generarNotificacionesVencimiento().catch(console.error);

            res.status(201).json({
                message: 'Cuenta creada con éxito',
                data: resultado
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async obtenerTodas(req: Request, res: Response) {
        try {
            const cuentas = await CuentasService.obtenerTodas();
            res.status(200).json(cuentas);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async obtenerPorId(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const cuenta = await CuentasService.obtenerPorId(id);
            res.status(200).json(cuenta);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async actualizar(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const datos = req.body;
            const resultado = await CuentasService.actualizarCuenta(id, datos);

            // Disparar escaneo de notificaciones
            NotificacionService.generarNotificacionesVencimiento().catch(console.error);

            res.status(200).json({
                message: 'Cuenta actualizada con éxito',
                data: resultado
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async eliminar(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            await CuentasService.eliminarCuenta(id);
            res.status(200).json({ message: 'Cuenta eliminada con éxito' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new CuentasController();