import dotenv from 'dotenv';
import validateEnv from './utils/validateEnv';
import { connect } from 'mongoose';

dotenv.config({ path: './.env' });
validateEnv();

process.on('uncaughtException', (err: any) => {
  console.log('UNCAUGHT EXCEPTION! 🧨 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

import app from './app';

const DB = process.env.DATABASE!.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD!
);

connect(DB).then(() => console.log('DB connection succesful!'));

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err: any) => {
  console.log('UNHANDLED REJECTION! 🧨 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});
