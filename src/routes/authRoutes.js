import { Router } from 'express';
import {
  login,
  validateToken,
  changePassword,
  forgotPassword,
  resetPasswordForm,
  resetPassword,
} from '../controller/authController';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.post('/login', login); 
router.get('/validate-token', authenticate, validateToken); 
router.post('/change-password', authenticate, changePassword); 
router.post('/forgot-password', forgotPassword); 
router.get('/reset/:token', resetPasswordForm); 
router.post('/reset/:token', resetPassword); 

export default router;
