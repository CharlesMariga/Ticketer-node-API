import express, { Application, json } from 'express';
import morgan from 'morgan';
import cors from 'cors';

import userRouter from './routes/userRouter';
import errorController from './controllers/errorController';

const app: Application = express();

// MIDDLEWARES
// -- Implement CORS
app.use(cors({ credentials: true }));
app.options('*', cors);

// -- Development requests console logs
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// -- Body parser, reading the data from body into req.body
// --- while also limiting the size of data to 10kb
app.use(json({ limit: '10kb' }));

app.use('/api/v1/users', userRouter);

app.use(errorController);

export default app;
