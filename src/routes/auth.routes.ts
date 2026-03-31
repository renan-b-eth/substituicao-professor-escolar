import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const controller = new AuthController();

router.post('/login', controller.login.bind(controller));
router.post('/register', controller.register.bind(controller));
router.post('/refresh', controller.refreshToken.bind(controller));
router.post('/logout', controller.logout.bind(controller));
router.get('/me', controller.me.bind(controller));

export default router;