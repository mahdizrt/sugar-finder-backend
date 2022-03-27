import { StatelessQuestion } from "@grammyjs/stateless-question";
import { Menu } from "@grammyjs/menu";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import {
  setType,
  setName,
  setGender,
  setSalary,
  setAge,
  setEducation,
  setJob,
  setHeight,
  setWeight,
  setLocation,
  setConditions,
  setCode,
  setChatId,
  setUsername,
} from "./store/formSlice";
import { dispatch, getState } from "./store";
import { createForm, sendForm, chatIdConvertor } from "./utils";
import { messages, nouns } from "./nouns";
import { bot } from ".";
import { setMessageId } from "./store/infoSlice";
import { db } from "./firebase";

let sendToChatId: number;

export const typeQuestion = new StatelessQuestion("type", async (ctx) => {
  if (!ctx.message.text) {
    await typeQuestion.replyWithMarkdown(ctx, messages.FORM_TYPE_QUESTION);
    return;
  }
  if (
    ctx.message.text &&
    ![nouns.SUGAR_BABY, nouns.SUGAR_DADDY, nouns.SUGAR_MUMMY].includes(
      ctx.message.text
    )
  ) {
    await typeQuestion.replyWithMarkdown(ctx, messages.FORM_TYPE_QUESTION);
    return;
  }
  ctx.chat?.id && dispatch(setChatId(ctx.chat.id));
  ctx.from?.username && dispatch(setUsername(ctx.from.username));
  ctx.message.text && dispatch(setType(ctx.message.text));
  ctx.chat?.id && dispatch(setCode(chatIdConvertor.toString(ctx.chat.id)));
  nameQuestion.replyWithMarkdown(ctx, messages.FORM_NAME_QUESTION);
});

export const nameQuestion = new StatelessQuestion("name", (ctx) => {
  if (!ctx.message.text) {
    nameQuestion.replyWithMarkdown(ctx, messages.FORM_NAME_QUESTION);
    return;
  }

  ctx.message.text && dispatch(setName(ctx.message.text));
  genderQuestion.replyWithMarkdown(ctx, messages.FORM_GENDER_QUESTION);
});

export const genderQuestion = new StatelessQuestion("gender", async (ctx) => {
  if (!ctx.message.text) {
    await genderQuestion.replyWithMarkdown(ctx, messages.FORM_GENDER_QUESTION);
    return;
  }

  if (
    ctx.message.text &&
    [nouns.MAN, nouns.WOMAN, nouns.CUSTOM].includes(ctx.message.text)
  ) {
    dispatch(setGender(ctx.message.text));
    await ageQuestion.replyWithMarkdown(ctx, messages.FORM_AGE_QUESTION);
    return;
  }

  await ctx.reply(messages.FORM_VALIDATE_GENDER_ERROR);
  await genderQuestion.replyWithMarkdown(ctx, messages.FORM_GENDER_QUESTION);
});

export const ageQuestion = new StatelessQuestion("age", async (ctx) => {
  if (!ctx.message.text) {
    await ageQuestion.replyWithMarkdown(ctx, messages.FORM_AGE_QUESTION);
    return;
  }

  const age = parseInt(ctx.message.text);

  if (isNaN(age)) {
    await ctx.reply(messages.FORM_VALIDATE_AGE_ERROR);
    await ageQuestion.replyWithMarkdown(ctx, messages.FORM_AGE_QUESTION);
    return;
  } else if (age < 18 || age > 100) {
    await ctx.reply(messages.FORM_VALIDATE_AGE_MIN_MAX_ERROR);
    await ageQuestion.replyWithMarkdown(ctx, messages.FORM_AGE_QUESTION);
    return;
  }

  ctx.message.text && dispatch(setAge(ctx.message.text));
  await educationQuestion.replyWithMarkdown(
    ctx,
    messages.FORM_EDUCATION_QUESTION
  );
});

export const educationQuestion = new StatelessQuestion(
  "education",
  async (ctx) => {
    if (!ctx.message.text) {
      await educationQuestion.replyWithMarkdown(
        ctx,
        messages.FORM_EDUCATION_QUESTION
      );
      return;
    }

    const educationList = [
      nouns.CYCLE,
      nouns.DIPLOMA,
      nouns.ASSOCIATE_DEGREE,
      nouns.BACHELOR,
      nouns.MASTER,
      nouns.DOCTOR,
      nouns.OTHER,
    ];

    const education = ctx.message.text;

    if (!education) return;

    if (educationList.includes(education)) {
      ctx.message.text && dispatch(setEducation(ctx.message.text));
      jobQuestion.replyWithMarkdown(ctx, messages.FORM_JOB_QUESTION);
      return;
    }

    await ctx.reply(messages.FORM_VALIDATE_EDUCATION_ERROR);
    await educationQuestion.replyWithMarkdown(
      ctx,
      messages.FORM_EDUCATION_QUESTION
    );
  }
);

export const jobQuestion = new StatelessQuestion("job", async (ctx) => {
  if (!ctx.message.text) {
    await jobQuestion.replyWithMarkdown(ctx, messages.FORM_JOB_QUESTION);
    return;
  }

  ctx.message.text && dispatch(setJob(ctx.message.text));
  salaryQuestion.replyWithMarkdown(ctx, messages.FORM_SALARY_QUESTION);
});

export const salaryQuestion = new StatelessQuestion("salary", async (ctx) => {
  if (!ctx.message.text) {
    await salaryQuestion.replyWithMarkdown(ctx, messages.FORM_SALARY_QUESTION);
    return;
  }
  ctx.message.text && dispatch(setSalary(ctx.message.text));
  heightQuestion.replyWithMarkdown(ctx, messages.FORM_HEIGHT_QUESTION);
});

export const heightQuestion = new StatelessQuestion("height", async (ctx) => {
  if (!ctx.message.text) {
    await heightQuestion.replyWithMarkdown(ctx, messages.FORM_HEIGHT_QUESTION);
    return;
  }
  ctx.message.text && dispatch(setHeight(ctx.message.text));
  weightQuestion.replyWithMarkdown(ctx, messages.FORM_WEIGHT_QUESTION);
});

export const weightQuestion = new StatelessQuestion("weight", async (ctx) => {
  if (!ctx.message.text) {
    await weightQuestion.replyWithMarkdown(ctx, messages.FORM_WEIGHT_QUESTION);
    return;
  }

  ctx.message.text && dispatch(setWeight(ctx.message.text));
  locationQuestion.replyWithMarkdown(ctx, messages.FORM_CITY_QUESTION);
});

export const locationQuestion = new StatelessQuestion(
  "location",
  async (ctx) => {
    if (!ctx.message.text) {
      await locationQuestion.replyWithMarkdown(
        ctx,
        messages.FORM_CITY_QUESTION
      );
      return;
    }

    ctx.message.text && dispatch(setLocation(ctx.message.text));
    conditionsQuestion.replyWithMarkdown(
      ctx,
      messages.FORM_CONDITIONS_QUESTION
    );
  }
);

export const conditionsQuestion = new StatelessQuestion(
  "conditions",
  async (ctx) => {
    if (!ctx.message.text) {
      await conditionsQuestion.replyWithMarkdown(
        ctx,
        messages.FORM_CONDITIONS_QUESTION
      );
      return;
    }
    ctx.message.text && dispatch(setConditions(ctx.message.text));

    sendForm(ctx, createForm());
  }
);

const deleteCreateConnectionMenu = async (chat_id: number) => {
  const message_id = getState().info.message_id;
  await bot.api.deleteMessage(chat_id, message_id);
};

const sendMessageQuestion = new StatelessQuestion(
  "send-message",
  async (ctx) => {
    const text = ctx.message.text;
    if (!text) {
      await ctx.reply(messages.MESSAGE_ONLY_TEXT_MESSAGE);
      await sendMessageQuestion.replyWithMarkdown(
        ctx,
        messages.MESSAGE_REPLY_TO_SEND_MESSAGE
      );
      return;
    }

    const blackListToSnap = await getDoc(
      doc(db, "blacklist", sendToChatId.toString())
    );
    const blackListFromSnap = await getDoc(
      doc(db, "blacklist", ctx.message.chat.id.toString())
    );
    const blackListTo = blackListToSnap.data();
    const blackListFrom = blackListFromSnap.data();

    if (
      (blackListTo && blackListTo.users.includes(ctx.message.chat.id)) ||
      (blackListFrom && blackListFrom.users.includes(sendToChatId))
    ) {
      await ctx.reply(messages.MESSAGE_IN_BLACKLISTED);
      return;
    }

    const messageData = {
      from: ctx.from?.id,
      to: sendToChatId,
      text,
      timestamp: serverTimestamp(),
      send: false,
      fromFirstName: ctx.from?.first_name,
    };

    await addDoc(collection(db, "messages"), messageData);

    await ctx.reply(messages.MESSAGE_SUCCESS_SEND);
  }
);

export const createConnectionMenu = new Menu("create-connection-menu")
  .text(nouns.YES, async (ctx) => {
    ctx.chat?.id && deleteCreateConnectionMenu(ctx.chat.id);

    await ctx.reply(messages.MESSAGE_CREATE_CONNECTION);

    sendMessageQuestion.replyWithMarkdown(
      ctx,
      messages.MESSAGE_REPLY_TO_SEND_MESSAGE
    );
  })
  .text(nouns.NO, (ctx) => {
    ctx.chat?.id && deleteCreateConnectionMenu(ctx.chat.id);
    ctx.reply(nouns.CANCELED);
  });

export const codeQuestion = new StatelessQuestion("code", async (ctx) => {
  const code = ctx.message.text;

  const formsRef = collection(db, "forms");
  const formsQuery = query(formsRef, where("code", "==", code));
  const formsSnap = await getDocs(formsQuery);

  if (!formsSnap.docs.length) {
    await ctx.reply(messages.SEARCH_FORM_NOT_FOUND);
    codeQuestion.replyWithMarkdown(ctx, messages.FORM_CODE_QUESTION);
    return;
  }

  const form = formsSnap.docs[0].data();

  sendToChatId = form.chat_id;

  await ctx.reply(createForm(form), {
    parse_mode: "Markdown",
  });

  const response = await ctx.reply(
    messages.MESSAGE_DO_YOU_LIKE_TO_SEND_MESSAGE,
    {
      reply_markup: createConnectionMenu,
    }
  );

  dispatch(setMessageId(response.message_id));
});

export const questions = [
  typeQuestion,
  nameQuestion,
  genderQuestion,
  ageQuestion,
  educationQuestion,
  jobQuestion,
  salaryQuestion,
  heightQuestion,
  weightQuestion,
  locationQuestion,
  conditionsQuestion,
  codeQuestion,
  sendMessageQuestion,
];
