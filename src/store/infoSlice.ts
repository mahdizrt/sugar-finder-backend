import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InfoState = {
  message_id: number;
  chat_id: number;
  sendToChatId: number;
};

const initialState: InfoState = {
  message_id: 0,
  chat_id: 0,
  sendToChatId: 0,
};

const infoSlice = createSlice({
  name: "info",
  initialState,
  reducers: {
    setMessageId: (state, action: PayloadAction<number>) => {
      state.message_id = action.payload;
    },
    setInfo: (state, action: PayloadAction<InfoState>) => {
      state.message_id = action.payload.message_id;
      state.chat_id = action.payload.chat_id;
    },
    setChatId: (state, action: PayloadAction<number>) => {
      state.chat_id = action.payload;
    },
    setSendToChatId: (state, action: PayloadAction<number>) => {
      state.sendToChatId = action.payload;
    },
  },
});

export const { setMessageId, setInfo, setSendToChatId } = infoSlice.actions;

export const infoReducer = infoSlice.reducer;
