import { Router } from 'express'
import { registerUser, loginUser, refresh, verifyToken, protectedRoute, logout } from '../controllers/authController'

const router = Router();
router.post('/register',registerUser);
router.post('/login', loginUser);
router.post('/refresh', refresh);
router.get('/protectedroute', verifyToken, protectedRoute);
router.delete('/logout', logout);

export default router;