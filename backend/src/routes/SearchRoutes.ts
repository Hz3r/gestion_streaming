import { Router } from 'express';
import { globalSearch } from '../controllers/SearchController';

const router = Router();

router.get('/', globalSearch);

export default router;
