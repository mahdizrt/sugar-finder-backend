import { configureStore } from "@reduxjs/toolkit";

import { formReducer } from "./formSlice";
import { infoReducer } from "./infoSlice";

const store = configureStore({
  reducer: {
    form: formReducer,
    info: infoReducer,
  },
});

const { dispatch, getState, subscribe } = store;

export { dispatch, getState, subscribe, store };
