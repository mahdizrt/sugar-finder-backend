import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type MessageState = {
  from: string;
  to: string;
  text: string;
};

const initialState: MessageState = {
  from: "",
  to: "",
  text: "",
};

export const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setMessage: (state, action: PayloadAction<MessageState>) => {
      state.from = action.payload.from;
      state.to = action.payload.to;
      state.text = action.payload.text;
    },
    clearMessage: (state) => {
      state = initialState;
    },
  },
});

export const { setMessage, clearMessage } = messageSlice.actions;
export const messageReducer = messageSlice.reducer;
