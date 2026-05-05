import { Request, Response } from "express";
import NotificacionService from "../services/NotificacionService.js";
import RotativasRepository from "../repositories/RotativasRepository.js";
import HistorialCredencialesRepository from "../repositories/HistorialCredencialesRepository.js";

class RotativasController {
    async crearRotativa(req: Request, res: Response) {
        try {
            const id = await RotativasRepository.crear(req.body);

            // Disparar escaneo de notificaciones
            NotificacionService.generarNotificacionesVencimiento().catch(console.error);

            res.status(201).json({ message: "Configuración rotativa creada", id_rotativa: id });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async obtenerPorCuenta(req: Request, res: Response) {
        try {
            const id_cuenta = parseInt(req.params.id_cuenta as string);
            const rotativa = await RotativasRepository.obtenerPorCuenta(id_cuenta);
            res.status(200).json(rotativa || {});
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async actualizarRotativa(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            await RotativasRepository.actualizar(id, req.body);

            // Disparar escaneo de notificaciones
            NotificacionService.generarNotificacionesVencimiento().catch(console.error);

            res.status(200).json({ message: "Configuración rotativa actualizada" });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async obtenerHistorial(req: Request, res: Response) {
        try {
            const id_cuenta = parseInt(req.params.id_cuenta as string);
            const historial = await HistorialCredencialesRepository.obtenerPorCuenta(id_cuenta);
            res.status(200).json(historial);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new RotativasController();
