import * as dotenv from "dotenv";

import { app } from "./app";
import { bot } from "./bot";

dotenv.config();

const DEV = process.env.NODE_ENV === "development";

const PORT = process.env.PORT || 5000;

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
    app.listen(PORT, async () => {
      console.log(`server started on port ${PORT}`);
    });
  }
};

run();
