import { Request, Response, NextFunction } from 'express';
import User from '../models/userModel';
import IUser from '../utils/interfaces/user.interface';
import jwt, { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

const signToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET as jwt.Secret, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const promisifyVerify = (
  token: string,
  key: string,
  options = {}
): JwtPayload => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, key, options, (error, payload) => {
      if (error) return reject(error);
      resolve(payload);
    });
  });
};

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
      req: Request<Record<string, never>, Record<string, never>, IUser> & IUser,
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

  protect: catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      let token = '';
      // 1) Getting the token and check if it exists
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies?.jwt) {
        token = req.cookies.jwt;
      }

      if (!token)
        return next(
          new AppError('You are not logged in! Please login to get access', 401)
        );

      // 2) Verify token
      const decoded: JwtPayload = await promisifyVerify(
        token,
        process.env.JWT_SECRET as string
      );

      // 3) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser)
        return next(
          new AppError('The user belonging to the token no longer exists', 401)
        );

      // 4) Check if user changed password after the jwt token was used
      if (!decoded.iat)
        return next(
          new AppError('You are not logged in! Please login to get access', 401)
        );
      if (currentUser.changedPasswordAfter(decoded.iat))
        return next(
          new AppError(
            'User recently changed password! Please log in again',
            401
          )
        );

      // 5) Check if impersonated use exists
      // 5) Grant  access to protected route
      if (decoded.impersonater) {
        const impersonatorUser = await User.findById(decoded.impersonater);
        if (!impersonatorUser)
          return next(new AppError("The impersonator doesn't exists", 404));
        req.impersonater = impersonatorUser;
      }
      req.user = currentUser;
      res.locals.user = currentUser;
      next();
    }
  ),

  impersonate: catchAsync(
    async (
      req: Request<
        Record<string, never>,
        Record<string, never>,
        { email: string }
      >,
      res: Response,
      next: NextFunction
    ) => {
      // 1) Check whether a user with that email exists
      const user = await User.findOne({ email: req.body.email });
      if (!user)
        return next(new AppError("User with that email doesn't exists", 404));

      // 2) Send to the user a new token and the impersonated user
      const token = jwt.sign(
        { id: user.id, impersonater: req.user.id },
        process.env.JWT_SECRET as jwt.Secret,
        {
          expiresIn: process.env.JWT_EXPIRES_IN,
        }
      );

      res.cookie('jwt', token, {
        expires: new Date(
          Date.now() +
            Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      });
      user.password = undefined;

      res.status(200).json({
        status: 'success',
        token,
        data: {
          user,
        },
      });
    }
  ),

  endImpersonation: catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // 1) Get the impersonator
      const user = await User.findById(req.impersonater.id);

      if (!user)
        return next(new AppError("The impersonator doesn't exists", 404));

      // 2) Retun the impersonator
      res.status(200).json({
        status: 'success',
        data: {
          user,
        },
      });
    }
  ),

  restrictTo:
    (...roles: string[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
      if (!roles.includes(req.user.role))
        return next(
          new AppError('You do not have permission to perform this action', 403)
        );

      next();
    },
};
