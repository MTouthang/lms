import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: localStorage.getItem("isLoggedIn") || false,
  data: JSON.parse(localStorage.getItem("data")) || {},
  role: localStorage.getItem("role") || "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: () => {},
});

// eslint-disable-next-line no-empty-pattern
export const {} = authSlice.actions;

export default authSlice.reducer;
