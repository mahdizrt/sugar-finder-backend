import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import {
  collection,
  getDoc,
  query,
  where,
  limit,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import _ from "lodash";

import { bot } from "./bot";
import { db } from "./firebase";
import { chatIdConvertor, createForm } from "./utils";
import { webhookCallback } from "grammy";
import { messages } from "./nouns";

const DEV = process.env.NODE_ENV === "development";
const CHANNEL_ID = DEV
  ? process.env.CHANNEL_ID_DEV
  : process.env.CHANNEL_ID_PROD;

const app = express();

app.use(cors());

app.use(express.json());

const secretPath = String(process.env.BOT_TOKEN_PROD);

app.use(`/${secretPath}`, webhookCallback(bot, "express"));

app.get("/", (req, res) => {
  res.send("Hi");
});

app.get("/api/forms", async (req, res) => {
  const filters = [];
  if (Object.keys(req.query).length) {
    Object.entries(req.query).forEach(([key, value]) => {
      key === "confirmed"
        ? filters.push(where("confirmed", "==", value === "true"))
        : filters.push(where(key, "==", value));
    });
  }

  if (req.query.limit) {
    const limitCount = parseInt(req.query.limit.toString());
    filters.push(limit(limitCount));
  }

  const formsRef = collection(db, "forms");
  const formsQuery = query(formsRef, ...filters);
  const formsSnapshots = await getDocs(formsQuery);
  if (!formsSnapshots.docs.length) return res.json([]);

  const forms = formsSnapshots.docs.map((form) => ({
    id: form.id,
    ...form.data(),
  }));

  res.json(forms);
});

app.get("/api/forms/:id", async (req, res) => {
  const { id } = req.params;

  const formRef = doc(db, "forms", id);
  const formSnap = await getDoc(formRef);

  if (!formSnap.data()) return res.status(404).send("Form not found");

  res.json({
    id: formSnap.id,
    ...formSnap.data(),
  });
});

app.put("/api/forms/:id/confirmed", async (req, res) => {
  const { id } = req.params;

  const formRef = doc(db, "forms", id);
  const formSnapBeforeConfirm = await getDoc(formRef);

  if (!formSnapBeforeConfirm.data())
    return res.status(404).send("Form not found");

  await updateDoc(formRef, {
    confirmed: true,
  });
  const formSnapAfterConfirm = await getDoc(formRef);

  const response = await bot.api.sendMessage(
    CHANNEL_ID,
    createForm(formSnapAfterConfirm.data()),
    {
      parse_mode: "Markdown",
    }
  );

  await updateDoc(formRef, {
    message_id: response.message_id,
  });

  const formSnap = await getDoc(formRef);
  const form = formSnap.data();

  bot.api.sendMessage(
    chatIdConvertor.parse(form?.code),
    messages.FORM_SUCCESS_SEND_IN_CHANNEL
  );

  res.json(form);
});

app.delete("/api/forms/:id", async (req, res) => {
  const { id } = req.params;

  const formRef = doc(db, "forms", id);
  const formSnap = await getDoc(formRef);

  if (!formSnap.data()) return res.status(404).send("Form not found");

  await deleteDoc(formRef);

  const form = formSnap.data();

  bot.api.sendMessage(
    chatIdConvertor.parse(form?.code),
    messages.FORM_DELETE_BEFORE_CONFIRM
  );

  form?.message_id && bot.api.deleteMessage(CHANNEL_ID, form.message_id);

  res.json(form);
});

app.get("/api/messages", async (req, res) => {
  const messagesQuery = query(
    collection(db, "messages"),
    orderBy("timestamp", "desc"),
    limit(50)
  );
  const messagesSnap = await getDocs(messagesQuery);
  const chatMessages = messagesSnap.docs.map((message) => ({
    id: message.id,
    ...message.data(),
  }));
  res.json(chatMessages);
});

app.get("/api/messages/:id", async (req, res) => {
  const usersQuery = req.query.users as string;
  const users = usersQuery?.split(",");

  const messagesQuery1 = query(
    collection(db, "messages"),
    where("from", "==", parseInt(users[0])),
    where("to", "==", parseInt(users[1]))
  );

  const messagesQuery2 = query(
    collection(db, "messages"),
    where("from", "==", parseInt(users[1])),
    where("to", "==", parseInt(users[0]))
  );

  const messagesSnap1 = await getDocs(messagesQuery1);
  const messagesSnap2 = await getDocs(messagesQuery2);

  type Messages = { id: string; first_name: string }[];

  const messages1: Messages = messagesSnap1.docs.map((message) => ({
    id: message.id,
    first_name: message.data()?.first_name,
    ...message.data(),
  }));

  const messages2: Messages = messagesSnap2.docs.map((message) => ({
    id: message.id,
    first_name: message.data()?.first_name,
    ...message.data(),
  }));

  const chatMessages = _.orderBy(
    messages1.concat(messages2),
    ["timestamp"],
    ["desc"]
  );

  res.json({
    users: [
      messages1[0]?.first_name || "USER NOT ANSWERED",
      messages2[0]?.first_name || "USER NOT ANSWERED",
    ],
    messages: chatMessages,
  });
});

export { app };
