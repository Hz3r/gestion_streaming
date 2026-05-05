import { Router } from "express";
import CuentasController from "../controllers/CuentasController.js";
import { checkPermission } from "../middlewares/authMiddleware.js";
import { PERMISOS } from "../constants/Permisos.js";

const router = Router();

router.post('/', checkPermission(PERMISOS.CUENTAS_CREATE), CuentasController.crear);
router.get('/', CuentasController.obtenerTodas);
router.get('/:id', CuentasController.obtenerPorId);
router.put('/:id', CuentasController.actualizar);
router.delete('/:id', checkPermission(PERMISOS.CUENTAS_DELETE), CuentasController.eliminar);

export default router;