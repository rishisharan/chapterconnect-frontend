import { configureStore } from "@reduxjs/toolkit";
import meetingReducer from "./meetingSlice";

export const store = configureStore({
  reducer: {
    meeting: meetingReducer,
  },
});