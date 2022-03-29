import { FieldValue } from "firebase/firestore";

export type MessageType = {
  from: number;
  to: number;
  text: string;
  timestamp: FieldValue;
  first_name: string;
  photo?: string;
};
