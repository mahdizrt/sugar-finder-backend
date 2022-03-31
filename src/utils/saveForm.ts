import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { getState } from "../store";
import { db } from "../firebase";

const saveForm = async () => {
  const form = getState().form;

  await addDoc(collection(db, "forms"), {
    timestamp: serverTimestamp(),
    confirmed: false,
    ...form,
  });
};

export { saveForm };
