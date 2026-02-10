
import { create } from '@auth/controllers/seeds';
import express, {Router} from 'express';

const router: Router = express.Router();

export const seeedRoutes = (): Router => {
    router.post('/seed/:count', create);
    return router;
};