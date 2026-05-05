import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UsuarioRepository from '../repositories/UsuarioRepository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro_123';

class AuthController {
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Email y contraseña son requeridos' });
            }

            const usuario = await UsuarioRepository.buscarPorEmail(email);
            if (!usuario) {
                return res.status(401).json({ message: 'Credenciales incorrectas' });
            }

            // Comparar contraseña (soporta tanto bcrypt como texto plano temporalmente por si la BD tiene texto plano)
            let isMatch = false;
            if (usuario.contraseña.startsWith('$2a$') || usuario.contraseña.startsWith('$2b$')) {
                isMatch = await bcrypt.compare(password, usuario.contraseña);
            } else {
                isMatch = password === usuario.contraseña;
            }

            if (!isMatch) {
                return res.status(401).json({ message: 'Credenciales incorrectas' });
            }

            // Generar Token
            const token = jwt.sign(
                { id: usuario.id_usuario, rol: usuario.id_rol, email: usuario.email },
                JWT_SECRET,
                { expiresIn: '8h' }
            );

            res.status(200).json({
                message: 'Login exitoso',
                token,
                usuario: {
                    id: usuario.id_usuario,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.id_rol,
                    foto: usuario.foto_perfil,
                    permisos: usuario.permisos
                }
            });
        } catch (error: any) {
            console.error('Error en login:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    async me(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const usuario = await UsuarioRepository.obtenerPorId(userId);
            
            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            res.status(200).json({
                usuario: {
                    id: usuario.id_usuario,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.id_rol,
                    foto: usuario.foto_perfil,
                    permisos: usuario.permisos
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
}

export default new AuthController();
