import { Router } from 'express';
import RolController from '../controllers/RolController.js';

const router = Router();

// GET /api/roles - Listar todos los roles
router.get('/', RolController.obtenerTodos);

// GET /api/roles/:id - Obtener un rol por ID
router.get('/:id', RolController.obtenerPorId);

// POST /api/roles - Crear un nuevo rol
router.post('/', RolController.crear);

// PUT /api/roles/:id - Actualizar un rol
router.put('/:id', RolController.actualizar);

// DELETE /api/roles/:id - Eliminar un rol
router.delete('/:id', RolController.eliminar);

export default router;
