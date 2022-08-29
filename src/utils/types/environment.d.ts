declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      PORT: number;
      DATABASE: string;
      DATABASE_PASSWORD: string;
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      JWT_COOKIE_EXPIRES_IN: number;
    }
  }
}

export {};
