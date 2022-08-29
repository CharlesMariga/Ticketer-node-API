import IUser from './user.interface';

export interface ITicket {
  id: number;
  createdBy: IUser | string;
  onBehalfOf: IUser | string;
  createdAt: Date;
}
