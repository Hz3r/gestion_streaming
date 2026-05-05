import { Router } from "express";
import Metodo_PagoController from "../controllers/Metodo_PagoController.js";

const router = Router();

router.post('/', Metodo_PagoController.crear);
router.get('/', Metodo_PagoController.obtenerTodos);
router.get('/:id', Metodo_PagoController.obtenerPorId);
router.put('/:id', Metodo_PagoController.actualizar);
router.delete('/:id', Metodo_PagoController.eliminar);

export default router;
