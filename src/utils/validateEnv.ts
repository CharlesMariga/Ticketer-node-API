import { cleanEnv, port, str, url, num } from 'envalid';

function validateEnv(): void {
  cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'production'] }),
    PORT: port({ default: 3000 }),
    DATABASE: url(),
    DATABASE_PASSWORD: str(),
    JWT_COOKIE_EXPIRES_IN: num(),
    JWT_SECRET: str(),
    JWT_EXPIRES_IN: str(),
  });
}

export default validateEnv;
