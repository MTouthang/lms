import { configureStore } from "@reduxjs/toolkit";
import authSliceReducer from "./authSlice";
import courseSliceReducer from "./courseSlice";

const store = configureStore({
  reducer: {
    auth: authSliceReducer,
    course: courseSliceReducer,
  },
});

export default store;
