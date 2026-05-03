import { Router } from 'express';
import UsuarioController from '../controllers/UsuarioController';

const router = Router();

// POST /api/usuarios/registrar
router.post('/registrar', UsuarioController.registrar);

// POST /api/usuarios/login
router.post('/login', UsuarioController.login);

// DELETE /api/usuarios/:id - Eliminar un usuario
router.delete('/:id', UsuarioController.eliminar);

// PUT /api/usuarios/:id - Actualizar un usuario
router.put('/:id', UsuarioController.actualizar);

// GET /api/usuarios - Listar todos los usuarios
router.get('/', UsuarioController.obtenerTodos);

// GET /api/usuarios/:id - Obtener un usuario por ID
router.get('/:id', UsuarioController.obtenerPorId);

// PUT /api/usuarios/perfil/:id - Actualizar perfil
router.put('/perfil/:id', UsuarioController.actualizarPerfil);

// PUT /api/usuarios/password/:id - Actualizar contraseña
router.put('/password/:id', UsuarioController.actualizarPassword);

// GET /api/usuarios/stats/:id - Obtener estadísticas
router.get('/stats/:id', UsuarioController.obtenerEstadisticas);

export default router;

