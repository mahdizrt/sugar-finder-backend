import * as dotenv from "dotenv";
import { Bot, Context, Keyboard } from "grammy";
import { hydrate, HydrateFlavor } from "@grammyjs/hydrate";
import { StatelessQuestion } from "@grammyjs/stateless-question";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { app } from "./app";
import { db } from "./firebase";
import {
  typeQuestion,
  questions,
  codeQuestion,
  createConnectionMenu,
} from "./questions";
import {
  submitFormMenu,
  chatIdConvertor,
  createMessage,
  getChatIdFromMessage,
} from "./utils";
import { nouns, messages } from "./nouns";
import { Menu } from "@grammyjs/menu";
import { setSendToChatId } from "./store/infoSlice";
import { dispatch, getState } from "./store";

dotenv.config();

type MyContext = HydrateFlavor<Context>;

const Dev = process.env.NODE_ENV === "development";
const CHANNEL_ID = Dev
  ? process.env.CHANNEL_ID_DEV
  : process.env.CHANNEL_ID_PROD;
const BOT_TOKEN = Dev ? process.env.BOT_TOKEN_DEV : process.env.BOT_TOKEN_PROD;
const bot = new Bot<MyContext>(BOT_TOKEN);

const PORT = process.env.PORT || 5000;

bot.use(hydrate());
bot.use(submitFormMenu);
bot.use(createConnectionMenu);
questions.forEach((question) => bot.use(question.middleware()));

const messageQuestion = new StatelessQuestion(
  "message-question",
  async (ctx) => {
    const toChatId = chatIdConvertor.parse(
      getChatIdFromMessage(ctx.message.reply_to_message.text || "")
    );

    const blackListToSnap = await getDoc(
      doc(db, "blacklist", toChatId.toString())
    );
    const blackListFromSnap = await getDoc(
      doc(db, "blacklist", ctx.message.chat.id.toString())
    );
    const blackListTo = blackListToSnap.data();
    const blackListFrom = blackListFromSnap.data();

    if (
      (blackListTo && blackListTo.users.includes(ctx.message.chat.id)) ||
      (blackListFrom && blackListFrom.users.includes(toChatId))
    ) {
      ctx.reply(messages.MESSAGE_IN_BLACKLISTED);
      return;
    }

    const messageData = {
      from: ctx.from?.id,
      to: toChatId,
      text: ctx.message.text,
      timestamp: serverTimestamp(),
      send: false,
    };

    await addDoc(collection(db, "messages"), messageData);

    await ctx.reply(messages.MESSAGE_SUCCESS_SEND);
  }
);

bot.use(messageQuestion);

const messageMenu = new Menu("message-menu").text(
  `${nouns.MESSAGE_BLOCK_USER}${"⛔️☠"}`,
  async (ctx) => {
    ctx.reply(nouns.BLACKLISTED);

    if (!ctx.chat?.id.toString()) return;

    const { sendToChatId } = getState().info;

    const blackListRef = doc(db, "blacklist", ctx.chat?.id.toString());
    const blackList = await (await getDoc(blackListRef)).data();

    if (!blackList) {
      await setDoc(doc(db, "blacklist/", ctx.chat?.id.toString()), {
        users: [sendToChatId],
      });
    } else {
      if (blackList.users.includes(sendToChatId)) return;

      await updateDoc(blackListRef, {
        users: [...blackList.users, sendToChatId],
      });
    }
    await ctx.reply(nouns.BLACKLISTED);
  }
);
bot.use(messageMenu);

const setup = (ctx: Context) => {
  const listenerMessagesQuery = query(
    collection(db, "messages"),
    where("to", "==", ctx.chat?.id),
    orderBy("timestamp", "desc")
  );

  onSnapshot(listenerMessagesQuery, async (messagesSnap) => {
    const message: any = messagesSnap.docs.map((messageDoc) => ({
      id: messageDoc.id,
      ...messageDoc.data(),
    }))[0];

    if (message === undefined || message?.send === true) return;

    await updateDoc(doc(db, "messages", message.id), {
      send: true,
    });

    await messageQuestion.replyWithMarkdown(
      ctx,
      createMessage({
        code: message.from,
        text: message.text,
      })
    );

    dispatch(setSendToChatId(message.from));

    await ctx.reply(`${nouns.OPTIONS}:`, {
      reply_markup: messageMenu,
    });
  });
};

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

const getForm = async (ctx: Context) => {
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
bot.hears(nouns.FORM, getForm);
bot.command("form", getForm);

const getSearch = (ctx: Context) => {
  codeQuestion.replyWithMarkdown(ctx, messages.FORM_CODE_QUESTION);
};
bot.hears(nouns.SEARCH, getSearch);
bot.command("search", getSearch);

const mainKeyboard = new Keyboard().text(nouns.FORM).row().text(nouns.SEARCH);

bot.hears("ping", (ctx) => {
  ctx.reply("pong");
});

const start = async (ctx: Context) => {
  setup(ctx);
  ctx.reply(nouns.WELCOME, {
    reply_markup: mainKeyboard,
  });
};

bot.hears(nouns.START, start);
bot.command("start", start);

bot.catch((err) => console.error(err));

bot.start({
  onStart() {
    console.log("bot started");
  },
});

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

export { bot };
