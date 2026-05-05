import { Request, Response } from "express";
import PlataformaService from "../services/PlataformaService.js";

class PlataformaController{

    async crear(req:Request, res:Response){
        try {
            const datos = req.body;
            const resultado = await PlataformaService.crearPlataforma(datos);
            res.status(201).json({
                message: 'Plataforma creada con éxito',
                data: resultado
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async obtenerTodas(req:Request, res:Response){
        try {
            const plataformas = await PlataformaService.obtenerTodas();
            res.status(200).json(plataformas);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async obtenerPorId(req:Request, res:Response){
        try {
            const id = parseInt(req.params.id as string);
            const plataforma = await PlataformaService.obtenerPorId(id);
            res.status(200).json(plataforma);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async actualizar(req:Request, res:Response){
        try {
            const id = parseInt(req.params.id as string);
            const datos = req.body;
            const resultado = await PlataformaService.actualizarPlataforma(id, datos);
            res.status(200).json({
                message: 'Plataforma actualizada con éxito',
                data: resultado
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async eliminar(req:Request, res:Response){
        try {
            const id = parseInt(req.params.id as string);
            await PlataformaService.eliminarPlataforma(id);
            res.status(200).json({ message: 'Plataforma eliminada con éxito' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new PlataformaController();
