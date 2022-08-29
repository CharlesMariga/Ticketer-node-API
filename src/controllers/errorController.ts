import { Request, Response, NextFunction } from 'express';
import { CastError } from 'mongoose';

import AppError from '../utils/appError';
import IDuplicateKeyError from '../utils/interfaces/duplicatekey.inteface';
import IValidationError from '../utils/interfaces/validationError';

const handleCastErrorDB = (err: CastError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  const newError = new AppError(message, 400);
  return newError;
};

const handleDuplicateFieldsDB = (err: IDuplicateKeyError): AppError => {
  const message = `Duplicate field value "${err.keyValue.name}". Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: IValidationError): AppError => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please login again', 401);

const sendErrorDev = (err: AppError, req: Request, res: Response) => {
  if (req.originalUrl.startsWith('/api'))
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  res
    .status(err.statusCode)
    .render('error', { title: 'Something went wrong!', msg: err.message });
};

const sendErrorProd = (err: AppError, req: Request, res: Response) => {
  // A) API
  if (req.originalUrl.startsWith('/api'))
    if (err.isOperational) {
      // Operational error that we trust: send error message to the client
      return res
        .status(err.statusCode)
        .json({ status: err.status, message: err.message });
      // Programming or other unknow error: don't send error message to the client
    } else {
      // 1) Log the error
      console.error('Error: 🧨🧨', err);

      // 2) Send generic message
      return res
        .status(500)
        .json({ status: 'err', message: 'Something went very wrong' });
    }
  // B) Rendered website
  else if (err.isOperational) {
    // Operational error that we trust: send error message to the client
    return res
      .status(err.statusCode)
      .render('error', { title: 'Something went wrong!', msg: err.message });
    // Programming or other unknow error: don't send error message to the client
  } else {
    // 1) Log the error
    console.error('Error: 🧨🧨', err);

    // 2) Send generic message
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: 'Please try again later',
    });
  }
};

export default (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') sendErrorDev(err, req, res);
  else if (process.env.NODE_ENV === 'production') {
    let error: AppError | null = null;

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error || err, req, res);
  }
};
