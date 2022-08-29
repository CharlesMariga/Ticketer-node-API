import { Router } from 'express';
import authController from '../controllers/authController';
import userController from '../controllers/userController';

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post(
  '/impersonate',
  authController.protect,
  authController.restrictTo('admin'),
  authController.impersonate
);
router.post(
  '/endImpersonation',
  authController.protect,
  authController.endImpersonation
);

router.route('/:id').patch(authController.protect, userController.updateUser);

export default router;
