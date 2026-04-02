import { Router } from "express";
import CuentasController from "../controllers/CuentasController";

const router = Router();

router.post('/', CuentasController.crear);
router.get('/', CuentasController.obtenerTodas);
router.get('/:id', CuentasController.obtenerPorId);
router.put('/:id', CuentasController.actualizar);
router.delete('/:id', CuentasController.eliminar);

export default router;