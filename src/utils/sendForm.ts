import * as dotenv from "dotenv";
import { Context } from "grammy";
import { Menu } from "@grammyjs/menu";
import { ReplyToMessageContext } from "@grammyjs/stateless-question/dist/source/identifier";

import { bot } from "..";
import { messages, nouns } from "../nouns";
import { sendMessageToAdmin } from "./sendMessageToAdmin";
import { saveForm } from "./saveForm";
import { createForm } from "./formTemplate";

dotenv.config();

const deleteForm = async (chatId: number, message_id: number) => {
  await bot.api.deleteMessage(chatId, message_id);
  await bot.api.deleteMessage(chatId, message_id - 1);
};

export const submitFormMenu = new Menu("submit-form-menu")
  .text(nouns.YES, async (ctx) => {
    await sendMessageToAdmin(createForm(), {
      parse_mode: "Markdown",
    });

    saveForm();

    ctx.chat?.id &&
      (await deleteForm(
        ctx.chat.id,
        ctx.callbackQuery.message?.message_id as number
      ));

    ctx.reply(messages.FORM_SUCCESS_MESSAGE);
  })
  .text(nouns.NO, async (ctx) => {
    ctx.chat?.id &&
      (await deleteForm(
        ctx.chat.id,
        ctx.callbackQuery.message?.message_id as number
      ));
    ctx.reply(messages.FORM_ERROR_MESSAGE);
  });

const sendForm = async (ctx: ReplyToMessageContext<Context>, form: string) => {
  ctx.chat?.id &&
    (await bot.api.sendMessage(ctx.chat.id, form, {
      parse_mode: "Markdown",
    }));

  await ctx.reply(messages.FORM_VALID_MESSAGE, {
    reply_markup: submitFormMenu,
  });
};

export { sendForm };
