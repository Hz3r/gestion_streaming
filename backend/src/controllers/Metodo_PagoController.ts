import { Request, Response } from "express";
import Metodo_PagoService from "../services/Metodo_PagoService.js";

class Metodo_PagoController {

    async crear(req: Request, res: Response) {
        try {
            const datos = req.body;
            const resultado = await Metodo_PagoService.crearMetodo(datos);
            res.status(201).json({
                message: 'Método de pago creado con éxito',
                data: resultado
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async obtenerTodos(req: Request, res: Response) {
        try {
            const metodos = await Metodo_PagoService.obtenerTodos();
            res.status(200).json(metodos);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async obtenerPorId(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const metodo = await Metodo_PagoService.obtenerPorId(id);
            res.status(200).json(metodo);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async actualizar(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const datos = req.body;
            const resultado = await Metodo_PagoService.actualizarMetodo(id, datos);
            res.status(200).json({
                message: 'Método de pago actualizado con éxito',
                data: resultado
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async eliminar(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            await Metodo_PagoService.eliminarMetodo(id);
            res.status(200).json({ message: 'Método de pago eliminado con éxito' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new Metodo_PagoController();
