import { ReplyToMessageContext } from "@grammyjs/stateless-question/dist/source/identifier";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Context } from "grammy";

import { db } from "../firebase";
import { messages } from "../nouns";
import { createForm } from "./formTemplate";

export const getFormWithCode = async (
  ctx: ReplyToMessageContext<Context> | Context,
  code: string
) => {
  const formsRef = collection(db, "forms");
  const formsQuery = query(formsRef, where("code", "==", code));
  const formsSnap = await getDocs(formsQuery);

  if (!formsSnap.docs.length) {
    await ctx.reply(messages.SEARCH_FORM_NOT_FOUND);
    return;
  }

  const form = formsSnap.docs[0].data();

  await ctx.reply(createForm(form), {
    parse_mode: "Markdown",
  });
  await ctx.reply(
    `
  👤 ${code}
  ${messages.MESSAGE_REPLY_TO_SEND_MESSAGE}
  `,
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
};
