import { NextFunction, Request, Response } from 'express';
import Ticket from '../models/ticketModel';
import catchAsync from '../utils/catchAsync';

export default {
  createTicket: catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      let createdBy;
      if (req.impersonater) {
        createdBy = req.impersonater.id;
      }

      const newTicket = await Ticket.create({
        user: req.user.id,
        createdBy,
      });

      res.status(200).json({
        status: 'success',
        data: {
          ticket: newTicket,
        },
      });
    }
  ),

  getMyTickets: catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const tickets = await Ticket.find({ user: req.user.id });

      res.status(200).json({
        status: 'success',
        lenth: tickets.length,
        data: {
          tickets,
        },
      });
    }
  ),
};
