import { Router } from 'express';
import UsuarioController from '../controllers/UsuarioController';

const router = Router();

// POST /api/usuarios/registrar
router.post('/registrar', UsuarioController.registrar);

// POST /api/usuarios/login
router.post('/login', UsuarioController.login);

export default router;
