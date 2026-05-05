import { Router } from "express";
import ConfiguracionController from "../controllers/ConfiguracionController.js";

const router = Router();

router.get("/", ConfiguracionController.obtenerConfiguracion);
router.put("/", ConfiguracionController.actualizarConfiguracion);

export default router;
