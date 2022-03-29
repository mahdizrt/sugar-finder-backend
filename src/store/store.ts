import { configureStore } from "@reduxjs/toolkit";

import { formReducer } from "./formSlice";

const store = configureStore({
  reducer: {
    form: formReducer,
  },
});

const { dispatch, getState, subscribe } = store;

export { dispatch, getState, subscribe, store };
