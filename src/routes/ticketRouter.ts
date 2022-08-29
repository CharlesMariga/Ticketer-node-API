import { Router } from 'express';
import authController from '../controllers/authController';
import ticketController from '../controllers/ticketController';

const router = Router();

router.use(authController.protect);

router.route('/').post(ticketController.createTicket);
router.route('/getMyTickets').get(ticketController.getMyTickets);

export default router;
