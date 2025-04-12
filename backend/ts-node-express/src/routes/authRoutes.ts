import { Router } from 'express'
import { registerUser, loginUser, refresh, verifyToken, protectedRoute } from '../controllers/authController'

const router = Router();
router.post('/register',registerUser);
router.post('/login', loginUser);
router.post('/refresh', refresh);
router.get('/protectedroute', verifyToken, protectedRoute)

export default router;