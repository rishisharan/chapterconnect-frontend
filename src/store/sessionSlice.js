import { createSlice } from "@reduxjs/toolkit";

const sessionSlice = createSlice({
  name: "session",
  initialState: {
    user: null,
    socket: null,
    chapterId: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setChapterId: (state, action) => {
      state.chapterId = action.payload;
    },
  },
});

export const { setUser, setSocket, setChapterId } = sessionSlice.actions;
export default sessionSlice.reducer;
