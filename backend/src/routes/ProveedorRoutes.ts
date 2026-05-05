import { Router } from "express";
import ProveedorController from "../controllers/ProveedorController.js";

const router = Router();

router.post('/', ProveedorController.crear);
router.get('/', ProveedorController.obtenerTodos);
router.get('/:id', ProveedorController.obtenerPorId);
router.put('/:id', ProveedorController.actualizar);
router.delete('/:id', ProveedorController.eliminar);

export default router;