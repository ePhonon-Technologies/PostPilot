import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import socialAccountReducer from './slices/socialAccountSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    socialAccounts: socialAccountReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
