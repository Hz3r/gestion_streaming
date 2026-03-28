import { Request, Response } from "express";
import ProveedorService from "../services/ProveedorService";

class ProveedorController {

    async crear(req: Request, res: Response) {
        try {
            const datos = req.body;
            const resultado = await ProveedorService.crearProveedor(datos);
            res.status(201).json({
                message: 'Proveedor creado con éxito',
                data: resultado
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async obtenerTodos(req: Request, res: Response) {
        try {
            const proveedores = await ProveedorService.obtenerTodos();
            res.status(200).json(proveedores);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async obtenerPorId(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const proveedor = await ProveedorService.obtenerPorId(id);
            res.status(200).json(proveedor);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async actualizar(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const datos = req.body;
            const resultado = await ProveedorService.actualizarProveedor(id, datos);
            res.status(200).json({
                message: 'Proveedor actualizado con éxito',
                data: resultado
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async eliminar(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            await ProveedorService.eliminarProveedor(id);
            res.status(200).json({ message: 'Proveedor eliminado con éxito' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new ProveedorController();