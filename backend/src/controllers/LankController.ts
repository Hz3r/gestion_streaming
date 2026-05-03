import { Request, Response } from "express";
import LankService from "../services/LankService";

class LankController {
    async crear(req: Request, res: Response) {
        try {
            const id = await LankService.crearCuenta(req.body);
            res.status(201).json({ message: "Cuenta Lank creada exitosamente", id_lank_madre: id });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async obtenerTodas(req: Request, res: Response) {
        try {
            const cuentas = await LankService.obtenerTodas();
            res.status(200).json(cuentas);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async obtenerPorId(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const cuenta = await LankService.obtenerPorId(id);
            if (!cuenta) return res.status(404).json({ message: "Cuenta no encontrada" });
            res.status(200).json(cuenta);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async actualizar(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            await LankService.actualizar(id, req.body);
            res.status(200).json({ message: "Cuenta Lank actualizada" });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async eliminar(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            await LankService.eliminar(id);
            res.status(200).json({ message: "Cuenta Lank eliminada" });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async syncFromN8n(req: Request, res: Response) {
        try {
            const result = await LankService.syncFromN8n(req.body);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new LankController();
