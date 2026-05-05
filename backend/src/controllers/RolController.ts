import { Request, Response } from 'express';
import RolService from '../services/RolService.js';

class RolController {

    async obtenerTodos(req: Request, res: Response) {
        try {
            const roles = await RolService.obtenerTodos();
            res.status(200).json(roles);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async obtenerPorId(req: Request, res: Response) {
        try {
            const id = parseInt(String(req.params.id));
            const rol = await RolService.obtenerPorId(id);
            res.status(200).json(rol);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async crear(req: Request, res: Response) {
        try {
            const datos = req.body;
            const idGenerado = await RolService.crear(datos);
            res.status(201).json({
                message: 'Rol creado con éxito',
                id: idGenerado
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async actualizar(req: Request, res: Response) {
        try {
            const id = parseInt(String(req.params.id));
            const datos = req.body;
            await RolService.actualizar(id, datos);
            res.status(200).json({ message: 'Rol actualizado con éxito' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async eliminar(req: Request, res: Response) {
        try {
            const id = parseInt(String(req.params.id));
            await RolService.eliminar(id);
            res.status(200).json({ message: 'Rol eliminado con éxito' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

}

export default new RolController();
