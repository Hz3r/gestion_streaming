import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UsuarioRepository from '../repositories/UsuarioRepository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro_123';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Permitir login, health check y configuración pública sin autenticación
    if (
        req.path.includes('/login') || 
        req.path.includes('/health') || 
        (req.path === '/configuracion' && req.method === 'GET')
    ) {
        return next();
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acceso no autorizado. Token faltante.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        (req as any).user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

export const checkPermission = (permission: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;
            if (!user) return res.status(401).json({ message: 'Autenticación requerida' });

            const usuario = await UsuarioRepository.obtenerPorId(user.id);
            if (!usuario) return res.status(401).json({ message: 'Usuario no encontrado' });

            // Admin (ID 1) o permiso "all" tienen acceso total
            if (usuario.id_rol === 1 || usuario.permisos?.includes('all')) {
                return next();
            }

            if (usuario.permisos && usuario.permisos.includes(permission)) {
                return next();
            }

            return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
        } catch (error) {
            console.error('Error en checkPermission:', error);
            return res.status(500).json({ message: 'Error interno de servidor al validar permisos' });
        }
    };
};
