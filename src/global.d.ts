declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN_PROD: string;
      BOT_TOKEN_DEV: string;
      ADMIN_ID: number;
      CHANNEL_ID_PROD: number;
      CHANNEL_ID_DEV: number;
      PORT: number;
      NODE_ENV: "production" | "development";

      DOMAIN: string;
    }
  }
}

export {};
