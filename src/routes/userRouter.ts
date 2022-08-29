import { Router } from 'express';
import authController from '../controllers/authController';

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post(
  '/impersonate',
  authController.protect,
  authController.restrictTo('admin'),
  authController.impersonate
);

export default router;
