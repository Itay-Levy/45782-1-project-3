import { Router } from 'express';
import { register, login, checkEmail } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/check-email/:email', checkEmail);

export default router;
