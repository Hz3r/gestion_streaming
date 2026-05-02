import { Router } from "express";
import ClienteController from "../controllers/ClienteController";

const router = Router();

router.post('/', ClienteController.crear);
router.get('/', ClienteController.obtenerTodos);
router.get('/:id', ClienteController.obtenerPorId);
router.put('/:id', ClienteController.actualizar);
router.delete('/:id', ClienteController.eliminar);

export default router;
