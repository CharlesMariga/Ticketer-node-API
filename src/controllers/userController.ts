import { Request, Response, NextFunction } from 'express';
import User from '../models/userModel';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';

export default {
  updateUser: catchAsync(
    async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
      // 1) Update the user
      const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      // 2) Check if the user exists
      if (!user) return next(new AppError('No user found with that ID', 404));

      // 3) Return the updated user
      res.status(200).json({
        statu: 'success',
        data: {
          user,
        },
      });
    }
  ),
};
