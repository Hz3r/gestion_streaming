import { Router } from "express";
import ContratosController from "../controllers/ContratosController";

const router = Router();

// Rutas de detalle (con JOINs) — van antes de /:id para evitar conflicto
router.get('/detalle', ContratosController.obtenerDetalleTodos);
router.get('/detalle/:id', ContratosController.obtenerDetallePorId);

// Rutas de consulta por relación
router.get('/cliente/:id_cliente', ContratosController.obtenerPorCliente);
router.get('/cuenta/:id_cuenta', ContratosController.obtenerPorCuenta);

// CRUD estándar
router.post('/', ContratosController.crear);
router.get('/', ContratosController.obtenerTodos);
router.get('/:id', ContratosController.obtenerPorId);
router.put('/:id', ContratosController.actualizar);
router.delete('/:id', ContratosController.eliminar);

export default router;
