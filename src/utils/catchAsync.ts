import { NextFunction } from "express";

type Handler = (req: any, res: any, next: NextFunction) => Promise<void>;

export default (fn: Handler) => (req: any, res: any, next: NextFunction) => {
  fn(req, res, next).catch((err: any) => next(err));
};
