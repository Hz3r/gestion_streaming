import { Request, Response } from "express";
import RotativasRepository from "../repositories/RotativasRepository";
import HistorialCredencialesRepository from "../repositories/HistorialCredencialesRepository";

class RotativasController {
    async crearRotativa(req: Request, res: Response) {
        try {
            const id = await RotativasRepository.crear(req.body);
            res.status(201).json({ message: "Configuración rotativa creada", id_rotativa: id });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async obtenerPorCuenta(req: Request, res: Response) {
        try {
            const id_cuenta = parseInt(req.params.id_cuenta);
            const rotativa = await RotativasRepository.obtenerPorCuenta(id_cuenta);
            res.status(200).json(rotativa || {});
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async actualizarRotativa(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            await RotativasRepository.actualizar(id, req.body);
            res.status(200).json({ message: "Configuración rotativa actualizada" });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async obtenerHistorial(req: Request, res: Response) {
        try {
            const id_cuenta = parseInt(req.params.id_cuenta);
            const historial = await HistorialCredencialesRepository.obtenerPorCuenta(id_cuenta);
            res.status(200).json(historial);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new RotativasController();
