import { Router } from 'express'
import { registerUser, loginUser, refresh, protectedRoute, logout } from '../controllers/authController'
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();
router.post('/register',registerUser);
router.post('/login', loginUser);
router.post('/refresh', refresh);
router.get('/protectedroute', verifyToken, protectedRoute);
router.post('/logout', logout);

export default router;