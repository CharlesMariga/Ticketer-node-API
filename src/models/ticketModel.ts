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
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  createdBy: {
    type: Types.ObjectId,
    ref: 'User',
    required: [true, 'A ticket must have a createdBy field'],
  },
  onBehalfOf: {
    type: Types.ObjectId,
    ref: 'User',
    required: false,
  },
});

ticketSchema.pre<Query<ITicket[], ITicket>>(
  /^find/,
  function (next: CallbackWithoutResultAndOptionalError) {
    this.populate('createdBy').populate('onBehalfOf');
  }
);

export default model<ITicket>('Ticket', ticketSchema);
