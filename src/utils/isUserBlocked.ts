import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const isUserBlocked = async (chatId: number, toChatId: number) => {
  const blackListToSnap = await getDoc(
    doc(db, "blacklist", toChatId.toString())
  );
  const blackListFromSnap = await getDoc(
    doc(db, "blacklist", chatId.toString())
  );
  const blackListTo = blackListToSnap.data();
  const blackListFrom = blackListFromSnap.data();

  const isBlocked =
    (blackListTo && blackListTo.users.includes(chatId)) ||
    (blackListFrom && blackListFrom.users.includes(toChatId));

  return Boolean(isBlocked);
};

export { isUserBlocked };
