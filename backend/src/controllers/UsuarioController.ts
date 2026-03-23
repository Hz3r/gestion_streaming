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
}

export default new UsuarioController();