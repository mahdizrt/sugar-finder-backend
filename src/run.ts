import * as dotenv from "dotenv";

import { app } from "./app";
import { bot } from "./bot";

dotenv.config();

const DEV = process.env.NODE_ENV === "development";

const PORT = process.env.PORT || 5000;

const domain = String(process.env.DOMAIN);
const secretPath = String(process.env.BOT_TOKEN_PROD);

const run = async () => {
  if (DEV) {
    app.listen(PORT, () => {
      console.log(`server started on port ${PORT}`);
    });
  } else {
    app.listen(PORT, async () => {
      await bot.api.setWebhook(`https://${domain}/${secretPath}`);
      console.log(`server started on port ${PORT}`);
    });
  }
};

run();
