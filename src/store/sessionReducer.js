// sessionReducer.js
const initialState = {
  user: null,
  socket: null,
  chapterId: null,
};

const sessionReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
      };
    // ... other cases
    default:
      return state;
  }
};

export default sessionReducer;