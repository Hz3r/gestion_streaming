import { Router } from "express";
import PlataformaController from "../controllers/PlataformaController";

const router = Router();

router.post('/', PlataformaController.crear);
router.get('/', PlataformaController.obtenerTodas);
router.get('/:id', PlataformaController.obtenerPorId);
router.put('/:id', PlataformaController.actualizar);
router.delete('/:id', PlataformaController.eliminar);

export default router;