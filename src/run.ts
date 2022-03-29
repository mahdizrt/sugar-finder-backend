import * as dotenv from "dotenv";

import { app } from "./app";
import { bot } from "./bot";

dotenv.config();

const DEV = process.env.NODE_ENV === "development";

const PORT = process.env.PORT || 5000;

const domain = String(DEV ? process.env.DOMAIN_DEV : process.env.DOMAIN_PROD);
const secretPath = String(
  DEV ? process.env.BOT_TOKEN_DEV : process.env.BOT_TOKEN_PROD
);

const run = async () => {
  if (DEV) {
    app.listen(PORT, () => {
      console.log(`server started on port ${PORT}`);
    });
    bot.start({
      onStart() {
        console.log("bot started");
      },
    });
  } else {
    app.listen(PORT, () => {
      console.log(`server started on port ${PORT}`);
    });
    await bot.api.setWebhook(`${domain}/${secretPath}`);
    bot.start({
      onStart() {
        console.log("bot started");
      },
    });
  }
};

run();
