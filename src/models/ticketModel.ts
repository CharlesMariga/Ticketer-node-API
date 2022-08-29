import {
  model,
  Schema,
  Types,
  Model,
  Query,
  CallbackWithoutResultAndOptionalError,
} from 'mongoose';
import { ITicket } from '../utils/interfaces/ticket.interface';

const ticketSchema = new Schema<ITicket, Model<ITicket>>({
  ticketNumber: {
    type: String,
    unique: true,
    default: () => `T-${Math.round(Math.random() * 100000)}`,
    required: [true, 'A ticket must have a ticket number'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  createdBy: {
    type: Types.ObjectId,
    ref: 'User',
  },
  user: {
    type: Types.ObjectId,
    ref: 'User',
    required: [true, 'A ticket must belong to a user'],
  },
});

ticketSchema.index({ ticketNumber: 1 });

ticketSchema.pre<Query<ITicket[], ITicket>>(
  /^find/,
  function (next: CallbackWithoutResultAndOptionalError) {
    this.populate({
      path: 'createdBy',
      select: 'id name',
    }).populate({ path: 'user', select: 'id name' });
    next();
  }
);

export default model<ITicket>('Ticket', ticketSchema);
