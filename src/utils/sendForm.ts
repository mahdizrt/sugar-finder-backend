import * as dotenv from "dotenv";
import { Context } from "grammy";
import { Menu } from "@grammyjs/menu";
import { ReplyToMessageContext } from "@grammyjs/stateless-question/dist/source/identifier";

import { bot } from "..";
import { messages, nouns } from "../nouns";
import { sendMessageToAdmin } from "./sendMessageToAdmin";
import { saveForm } from "./saveForm";
import { createForm } from "./formTemplate";
import { dispatch, getState } from "../store";
import { setMessageId } from "../store/infoSlice";

dotenv.config();

const deleteForm = async (chatId: number) => {
  const { message_id } = getState().info;

  await bot.api.deleteMessage(chatId, message_id + 1);
  await bot.api.deleteMessage(chatId, message_id + 2);
};

export const submitFormMenu = new Menu("submit-form-menu")
  .text(nouns.YES, async (ctx) => {
    await sendMessageToAdmin(createForm(), {
      parse_mode: "Markdown",
    });

    saveForm();

    ctx.chat?.id && (await deleteForm(ctx.chat.id));

    ctx.reply(messages.FORM_SUCCESS_MESSAGE);
  })
  .text(nouns.NO, async (ctx) => {
    ctx.chat?.id && (await deleteForm(ctx.chat.id));
    ctx.reply(messages.FORM_ERROR_MESSAGE);
  });

const sendForm = async (ctx: ReplyToMessageContext<Context>, form: string) => {
  ctx.chat?.id &&
    (await bot.api.sendMessage(ctx.chat.id, form, {
      parse_mode: "Markdown",
    }));

  dispatch(setMessageId(ctx.message.message_id));

  await ctx.reply(messages.FORM_VALID_MESSAGE, {
    reply_markup: submitFormMenu,
  });
};

export { sendForm };
