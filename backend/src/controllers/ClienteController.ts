import { Request, Response } from "express";
import ClienteService from "../services/ClienteService";

class ClienteController {
    async crear(req: Request, res: Response) {
        try {
            const datos = req.body;
            const resultado = await ClienteService.crearCliente(datos);
            res.status(201).json({
                message: 'Cliente creado con éxito',
                data: resultado
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async obtenerTodos(req: Request, res: Response) {
        try {
            const clientes = await ClienteService.obtenerTodos();
            res.status(200).json(clientes);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async obtenerPorId(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const cliente = await ClienteService.obtenerPorId(id);
            res.status(200).json(cliente);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async actualizar(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const datos = req.body;
            const resultado = await ClienteService.actualizarCliente(id, datos);
            res.status(200).json({
                message: 'Cliente actualizado con éxito',
                data: resultado
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async eliminar(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            await ClienteService.eliminarCliente(id);
            res.status(200).json({ message: 'Cliente eliminado con éxito' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new ClienteController();
