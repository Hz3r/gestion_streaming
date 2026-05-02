import { Request, Response } from "express";
import NotificacionService from "../services/NotificacionService";

class NotificacionController {
    async obtenerPorUsuario(req: Request, res: Response) {
        try {
            const id_usuario = parseInt(req.params.id_usuario as string);
            const notificaciones = await NotificacionService.obtenerNotificacionesUsuario(id_usuario);
            res.json(notificaciones);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async marcarLeida(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            await NotificacionService.marcarLeida(id);
            res.json({ message: "Notificación marcada como leída" });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async marcarTodasLeidas(req: Request, res: Response) {
        try {
            const id_usuario = parseInt(req.params.id_usuario as string);
            await NotificacionService.marcarTodasLeidas(id_usuario);
            res.json({ message: "Todas las notificaciones marcadas como leídas" });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async crear(req: Request, res: Response) {
        try {
            const id = await NotificacionService.crearNotificacion(req.body);
            res.status(201).json({ id, message: "Notificación creada" });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new NotificacionController();
