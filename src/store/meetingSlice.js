import { createSlice } from '@reduxjs/toolkit';

const meetingSlice = createSlice({
  name: 'meeting',
  initialState: {
    currentMeeting: null,
    isHost: false,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    setCurrentMeeting: (state, action) => {
      state.currentMeeting = action.payload.meeting;
      state.isHost = action.payload.isHost || false;
      state.status = 'succeeded';
    },
    clearCurrentMeeting: (state) => {
      state.currentMeeting = null;
      state.isHost = false;
      state.status = 'idle';
      state.error = null;
    },
    setMeetingStatus: (state, action) => {
      state.status = action.payload;
    },
    setMeetingError: (state, action) => {
      state.error = action.payload;
      state.status = 'failed';
    },
    updateMeetingStatus: (state, action) => {
      if (state.currentMeeting) {
        state.currentMeeting.status = action.payload;
      }
    },
  },
});

export const {
  setCurrentMeeting,
  clearCurrentMeeting,
  setMeetingStatus,
  setMeetingError,
  updateMeetingStatus,
} = meetingSlice.actions;

export default meetingSlice.reducer;