import { Router } from "express";
import RotativasController from "../controllers/RotativasController";

const router = Router();

// Gestión de Configuración Rotativa
router.post('/', RotativasController.crearRotativa);
router.get('/cuenta/:id_cuenta', RotativasController.obtenerPorCuenta);
router.put('/:id', RotativasController.actualizarRotativa);

// Historial de Credenciales
router.get('/historial/:id_cuenta', RotativasController.obtenerHistorial);

export default router;
