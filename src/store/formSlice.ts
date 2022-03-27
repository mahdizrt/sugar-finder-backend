import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type FormState = {
  chat_id: number;
  username: string;
  type: string;
  code: string;
  name: string;
  gender: string;
  age: string;
  education: string;
  job: string;
  salary: string;
  height: string;
  weight: string;
  location: string;
  conditions: string;
};

export const formSlice = createSlice({
  name: "form",
  initialState: {
    chat_id: 0,
    username: "",
    code: "",
    type: "",
    name: "",
    gender: "",
    age: "",
    education: "",
    job: "",
    salary: "",
    height: "",
    weight: "",
    location: "",
    conditions: "",
  },
  reducers: {
    setType: (state, action: PayloadAction<string>) => {
      state.type = action.payload;
    },
    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
    },
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setGender: (state, action: PayloadAction<string>) => {
      state.gender = action.payload;
    },
    setAge: (state, action: PayloadAction<string>) => {
      state.age = action.payload;
    },
    setEducation: (state, action: PayloadAction<string>) => {
      state.education = action.payload;
    },
    setJob: (state, action: PayloadAction<string>) => {
      state.job = action.payload;
    },
    setSalary: (state, action: PayloadAction<string>) => {
      state.salary = action.payload;
    },
    setHeight: (state, action: PayloadAction<string>) => {
      state.height = action.payload;
    },
    setWeight: (state, action: PayloadAction<string>) => {
      state.weight = action.payload;
    },
    setLocation: (state, action: PayloadAction<string>) => {
      state.location = action.payload;
    },
    setConditions: (state, action: PayloadAction<string>) => {
      state.conditions = action.payload;
    },
    setForm: (state, action: PayloadAction<FormState>) => {
      state = action.payload;
    },
    setChatId: (state, action: PayloadAction<number>) => {
      state.chat_id = action.payload;
    },
    setUsername(state, action: PayloadAction<string>) {
      state.username = action.payload;
    },
  },
});

export const {
  setJob,
  setSalary,
  setAge,
  setCode,
  setConditions,
  setEducation,
  setForm,
  setGender,
  setHeight,
  setLocation,
  setName,
  setType,
  setWeight,
  setChatId,
  setUsername,
} = formSlice.actions;
export const formReducer = formSlice.reducer;
