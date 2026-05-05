import EgresoService from "../services/EgresoService.js";
import { Request, Response } from "express";

class EgresoController {
    async crear(req: Request, res: Response) {
        try {
            const data = req.body;
            const resultado = await EgresoService.crearEgreso(data);
            res.status(201).json({ message: 'Egreso registrado con éxito', data: resultado });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async obtenerTodos(req: Request, res: Response) {
        try {
            const data = await EgresoService.obtenerTodos();
            res.status(200).json(data);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async obtenerPorMes(req: Request, res: Response) {
        try {
            const mes = parseInt(req.params.mes as string);
            const anio = parseInt(req.params.anio as string);
            const data = await EgresoService.obtenerPorMes(mes, anio);
            res.status(200).json(data);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async eliminar(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            await EgresoService.eliminarEgreso(id);
            res.status(200).json({ message: 'Egreso eliminado con éxito' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new EgresoController();
