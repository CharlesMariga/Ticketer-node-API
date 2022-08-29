import { Request, Response, NextFunction } from 'express';
import User from '../models/userModel';
import IUser from '../utils/interfaces/user.interface';
import jwt from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

const signToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET as jwt.Secret, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (
  user: IUser,
  statusCode: number,
  req: Request,
  res: Response
) => {
  const token = signToken(user.id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export default {
  signup: catchAsync(
    async (
      req: Request<Record<string, never>, Record<string, never>, IUser>,
      res: Response,
      next: NextFunction
    ) => {
      const { name, email, password, passwordConfirm } = req.body;
      const newUser = await User.create({
        name,
        email,
        password,
        passwordConfirm,
      });
      createSendToken(newUser, 201, req, res);
    }
  ),

  login: catchAsync(
    async (
      req: Request<Record<string, never>, Record<string, never>, IUser>,
      res: Response,
      next: NextFunction
    ) => {
      const { email, password } = req.body;

      // 1) Check if email and password exists
      if (!email || !password)
        return next(new AppError('Please provide email and passowrd!', 400));

      // 2) Check if user exists && password is correct
      const user = await User.findOne({ email }).select('+password');
      const correct = await user?.correctPassword(
        password,
        user?.password || ''
      );

      if (!user || !correct)
        return next(new AppError('Incorrect email or password', 404));

      // 3) If everything is ok, send token to client
      createSendToken(user, 200, req, res);
    }
  ),
};
