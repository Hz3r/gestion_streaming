import { Router } from "express";
import CuentasController from "../controllers/CuentasController";
import { checkPermission } from "../middlewares/authMiddleware";
import { PERMISOS } from "../constants/Permisos";

const router = Router();

router.post('/', checkPermission(PERMISOS.CUENTAS_CREATE), CuentasController.crear);
router.get('/', CuentasController.obtenerTodas);
router.get('/:id', CuentasController.obtenerPorId);
router.put('/:id', CuentasController.actualizar);
router.delete('/:id', checkPermission(PERMISOS.CUENTAS_DELETE), CuentasController.eliminar);

export default router;