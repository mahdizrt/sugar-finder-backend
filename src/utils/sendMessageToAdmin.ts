import * as dotenv from "dotenv";
import { RawApi } from "grammy";
import { Other } from "grammy/out/core/api";

import { bot } from "..";

dotenv.config();

const adminChatId = process.env.ADMIN_ID;

const sendMessageToAdmin = (
  message: string,
  other?: Other<RawApi, "sendMessage", "text">
) => {
  bot.api.sendMessage(adminChatId, message, other);
};

export { sendMessageToAdmin };
