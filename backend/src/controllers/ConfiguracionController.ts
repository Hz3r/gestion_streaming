import { Request, Response } from "express";
import ConfiguracionService from "../services/ConfiguracionService.js";

class ConfiguracionController {
    async obtenerConfiguracion(req: Request, res: Response) {
        try {
            const config = await ConfiguracionService.obtenerConfiguracion();
            res.json(config);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async actualizarConfiguracion(req: Request, res: Response) {
        try {
            await ConfiguracionService.actualizarConfiguracion(req.body);
            res.json({ message: "Configuración actualizada correctamente" });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new ConfiguracionController();
