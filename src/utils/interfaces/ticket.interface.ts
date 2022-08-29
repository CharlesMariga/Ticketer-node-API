import IUser from './user.interface';

export interface ITicket {
  id: number;
  ticketNumber: string;
  user: IUser | string;
  createdBy: IUser | string;
  createdAt: Date;
}
