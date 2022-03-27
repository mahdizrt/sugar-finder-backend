import { addDoc, collection } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";

import { getState } from "../store";
import { db } from "../firebase";

const saveForm = async () => {
  const form = getState().form;

  try {
    await addDoc(collection(db, "forms"), {
      timestamp: serverTimestamp(),
      confirmed: false,
      ...form,
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export { saveForm };
