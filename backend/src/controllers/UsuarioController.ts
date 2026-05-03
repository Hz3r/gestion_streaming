import { Request, Response } from 'express';
import UsuarioService from '../services/UsuarioService';

class UsuarioController {

    async registrar(req: Request, res: Response) {
        try {
            const datos = req.body;

            const idGenerado = await UsuarioService.registrarUsuario(datos);

            res.status(201).json({
                message: 'Usuario creado con éxito',
                id: idGenerado
            });
        } catch (error: any) {
            res.status(400).json({
                message: error.message
            });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { nombre, contraseña } = req.body;

            const usuarioValido = await UsuarioService.login(nombre, contraseña);

            res.status(200).json({
                message: 'Bienvenido al sistema',
                user: usuarioValido
            });
        } catch (error: any) {
            res.status(401).json({
                message: 'Credenciales incorrectas'
            });
        }
    }

    async eliminar(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const eliminado = await UsuarioService.eliminar(id);
            res.status(200).json({
                message: 'Usuario eliminado con éxito',
                eliminado
            });
        } catch (error: any) {
            res.status(400).json({
                message: error.message
            });
        }
    }

    async actualizar(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const datos = req.body;
            const actualizado = await UsuarioService.actualizar(id, datos);
            res.status(200).json({
                message: 'Usuario actualizado con éxito',
                actualizado
            });
        } catch (error: any) {
            res.status(400).json({
                message: error.message
            });
        }
    }

    async obtenerTodos(req: Request, res: Response) {
        try {
            const usuarios = await UsuarioService.obtenerTodos();
            res.status(200).json(usuarios);
        } catch (error: any) {
            res.status(400).json({
                message: error.message
            });
        }
    }

    async obtenerPorId(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const usuario = await UsuarioService.obtenerPorId(id);
            res.status(200).json(usuario);
        } catch (error: any) {
            res.status(400).json({
                message: error.message
            });
        }
    }

    async actualizarPerfil(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const datos = req.body;
            await UsuarioService.actualizarPerfil(id, datos);
            res.json({ message: 'Perfil actualizado con éxito' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async actualizarPassword(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const datos = req.body;
            await UsuarioService.actualizarPassword(id, datos);
            res.json({ message: 'Contraseña actualizada con éxito' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async obtenerEstadisticas(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const stats = await UsuarioService.obtenerEstadisticas(id);
            res.json(stats);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

}


export default new UsuarioController();