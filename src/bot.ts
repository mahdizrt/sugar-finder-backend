import * as dotenv from "dotenv";
import { Bot, Context, InlineKeyboard, Keyboard } from "grammy";
import { hydrate, HydrateFlavor } from "@grammyjs/hydrate";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebase";
import { typeQuestion, questions } from "./questions";
import {
  submitFormMenu,
  chatIdConvertor,
  createMessage,
  getChatIdFromMessage,
} from "./utils";
import { nouns, messages } from "./nouns";
import { Menu } from "@grammyjs/menu";
import { getFormWithCode } from "./utils/getFormWithCode";
import { isUserBlocked } from "./utils/isUserBlocked";
import { MessageType } from "./@types/types";
import { getPhotoUrl } from "./utils/getPhotoUrl";

dotenv.config();

export type MyContext = HydrateFlavor<Context>;

const DEV = process.env.NODE_ENV === "development";
const CHANNEL_ID = DEV
  ? process.env.CHANNEL_ID_DEV
  : process.env.CHANNEL_ID_PROD;
const BOT_TOKEN = DEV ? process.env.BOT_TOKEN_DEV : process.env.BOT_TOKEN_PROD;
const bot = new Bot<MyContext>(BOT_TOKEN);

bot.use(hydrate());
bot.use(submitFormMenu);
questions.forEach((question) => bot.use(question.middleware()));

const blockUserInlineKeyboard = new InlineKeyboard().text(
  `${nouns.MESSAGE_BLOCK_USER}${"⛔️☠"}`,
  "user-block"
);
const UnBlockUserInlineKeyboard = new InlineKeyboard().text(
  `${nouns.UNBLOCK} 🎉`,
  "user-unblock"
);

bot.callbackQuery("user-block", async (ctx) => {
  if (!ctx.callbackQuery.message?.text) return;

  const blockChatId = chatIdConvertor.parse(
    getChatIdFromMessage(ctx.callbackQuery.message.text)
  );

  const chatId = ctx.callbackQuery.from.id.toString();

  const blackListRef = doc(db, "blacklist", chatId);
  const blackList = await (await getDoc(blackListRef)).data();

  if (!blackList) {
    await setDoc(doc(db, "blacklist/", chatId), {
      users: [blockChatId],
    });
  } else {
    if (blackList.users.includes(blockChatId)) return;

    await updateDoc(blackListRef, {
      users: [...blackList.users, blockChatId],
    });
  }

  await ctx.editMessageReplyMarkup({
    reply_markup: UnBlockUserInlineKeyboard,
  });

  await ctx.answerCallbackQuery({
    text: "Blocked",
  });
});

bot.callbackQuery("user-unblock", async (ctx) => {
  if (!ctx.callbackQuery.message?.text) return;

  const unBlockChatId = chatIdConvertor.parse(
    getChatIdFromMessage(ctx.callbackQuery.message.text)
  );

  const chatId = ctx.callbackQuery.from.id.toString();

  const blackListRef = doc(db, "blacklist", chatId);
  const blackList = await (await getDoc(blackListRef)).data();

  if (!blackList) return;

  await updateDoc(blackListRef, {
    users: blackList.users.filter((user: number) => user !== unBlockChatId),
  });

  await ctx.editMessageReplyMarkup({
    reply_markup: blockUserInlineKeyboard,
  });

  await ctx.answerCallbackQuery({
    text: "UnBlocked",
  });
});

const deleteFormMenu = new Menu("delete-form-menu").text(
  nouns.YES,
  async (ctx) => {
    if (!ctx.chat?.id) return;

    const formsRef = collection(db, "forms");
    const formQuery = query(formsRef, where("chat_id", "==", ctx.chat.id));
    const formsSnap = await getDocs(formQuery);
    formsSnap.docs.forEach(async (formDoc) => {
      formDoc.data()?.message_id &&
        (await bot.api.deleteMessage(CHANNEL_ID, formDoc.data().message_id));
      await deleteDoc(doc(db, "forms", formDoc.id));
    });

    await ctx.reply(messages.MESSAGE_DELETE_FORM_SUCCESS);
  }
);
bot.use(deleteFormMenu);

const createForm = async (ctx: Context) => {
  if (!ctx.chat?.id) return;

  const formsRef = collection(db, "forms");
  const formQuery = query(formsRef, where("chat_id", "==", ctx.chat.id));
  const formsSnap = await getDocs(formQuery);
  const form = formsSnap.docs.map((formDoc) => formDoc.data())[0];

  if (form) {
    await ctx.reply(messages.MESSAGE_DELETE_FORM, {
      reply_markup: deleteFormMenu,
    });
    return;
  }

  typeQuestion.replyWithMarkdown(ctx, messages.FORM_TYPE_QUESTION);
};
bot.hears(nouns.CREATE_FORM, createForm);
bot.command("create", createForm);

const mainKeyboard = new Keyboard().text(nouns.CREATE_FORM);

bot.hears("ping", (ctx) => {
  ctx.reply("pong");
});

bot.on("message", async (ctx, next) => {
  if (ctx.message?.photo?.length) return next();

  const { reply_to_message } = ctx.message;
  const text = ctx.message.text;
  const toChatId = chatIdConvertor.parse(
    getChatIdFromMessage(ctx.message.reply_to_message?.text || "")
  );
  if (reply_to_message?.text && !isNaN(toChatId)) {
    const isBlocked = await isUserBlocked(ctx.chat.id, toChatId);
    if (isBlocked) {
      await ctx.reply(messages.MESSAGE_IN_BLACKLISTED);
      return;
    }

    const messageData: MessageType = {
      from: ctx.from?.id || 0,
      to: toChatId,
      timestamp: serverTimestamp(),
      first_name: ctx.from?.first_name || "",
      text: text || "",
    };

    await addDoc(collection(db, "messages"), messageData);

    await bot.api.sendMessage(
      toChatId,
      createMessage({
        code: chatIdConvertor.toString(ctx.chat.id),
        text: text,
      }),
      {
        reply_markup: blockUserInlineKeyboard,
      }
    );
    await ctx.reply(messages.MESSAGE_SUCCESS_SEND);
  }
  next();
});

bot.on(":photo", async (ctx) => {
  const reply_to_message = ctx.message?.reply_to_message;
  if (!ctx.message?.photo.length) return;

  const photoId = ctx.message.photo[ctx.message?.photo.length - 1].file_id;
  const toChatId = chatIdConvertor.parse(
    getChatIdFromMessage(reply_to_message?.text || "")
  );
  if (reply_to_message?.text && !isNaN(toChatId)) {
    const isBlocked = await isUserBlocked(ctx.chat.id, toChatId);
    if (isBlocked) {
      await ctx.reply(messages.MESSAGE_IN_BLACKLISTED);
      return;
    }

    const photoUrl = await getPhotoUrl(photoId);

    const messageData: MessageType = {
      from: ctx.from?.id || 0,
      to: toChatId,
      timestamp: serverTimestamp(),
      first_name: ctx.from?.first_name || "",
      photo: photoUrl,
      text: "",
    };

    await addDoc(collection(db, "messages"), messageData);

    await bot.api.sendPhoto(toChatId, photoId, {
      caption: createMessage({
        code: chatIdConvertor.toString(ctx.chat.id),
        text: `🤖 ${messages.MESSAGE_SEND_PHOTO}`,
      }),
      reply_markup: blockUserInlineKeyboard,
    });
    await ctx.reply(messages.MESSAGE_SUCCESS_SEND);
  }
});

const start = async (ctx: Context) => {
  if (ctx.from?.id) {
    const member = await bot.api.getChatMember(CHANNEL_ID, ctx.from?.id);
    if (member.status === "left") {
      ctx.reply(messages.FOR_USE_BOT_JOIN_IN_CHANNEL, {
        reply_markup: new InlineKeyboard().url(
          nouns.CHANNEL_NAME,
          `https://t.me/${DEV ? "sugar_yab_staging" : "sugar_yabe"}`
        ),
      });
      return;
    }
  }

  if (ctx.match) {
    getFormWithCode(ctx, ctx.match.toString());
    return;
  }

  ctx.reply(nouns.WELCOME, {
    reply_markup: mainKeyboard,
  });
};

bot.hears(nouns.START, start);
bot.command("start", start);

bot.catch((err) => {
  bot.api.sendMessage(process.env.ADMIN_ID, err.toString());
  console.error("error::", err);
});

export { bot };
