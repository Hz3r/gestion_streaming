import { Router } from "express";
import EgresoController from "../controllers/EgresoController.js";

const router = Router();

router.post('/', EgresoController.crear);
router.get('/', EgresoController.obtenerTodos);
router.get('/:anio/:mes', EgresoController.obtenerPorMes);
router.delete('/:id', EgresoController.eliminar);

export default router;
