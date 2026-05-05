import { Router } from 'express';
import { globalSearch } from '../controllers/SearchController.js';

const router = Router();

router.get('/', globalSearch);

export default router;
