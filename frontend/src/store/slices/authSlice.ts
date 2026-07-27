import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../../api/client';

export interface Profile {
  id?: string;
  phoneNumber?: string | null;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  userId?: string;
}

interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  providerName: 'LOCAL' | 'GOOGLE' | 'GITHUB';
  profile?: Profile;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// Token no longer comes back in the response body — backend sets it as an
// httpOnly cookie directly. Frontend only ever sees the user object.
interface AuthResponse {
  user: User;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  initialized: false,
};

export function getErrorMessage(
  err: unknown,
  fallback = 'Something went wrong',
): string {
  if (axios.isAxiosError(err)) {
    // adjust this path to match your backend's actual error response shape
    return (
      err.response?.data?.message ??
      err.response?.data?.error ??
      err.message ??
      fallback
    );
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

export const loginUser = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>('/auth/login', async (payload, { rejectWithValue }) => {
  try {
    // withCredentials must be true on this client so the browser accepts
    // and stores the Set-Cookie header from the response
    const response = await api.post<AuthResponse>('/auth/login', payload);
    return response.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Login failed'));
  }
});

export const registerUser = createAsyncThunk<
  AuthResponse,
  {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    providerName: string;
  },
  { rejectValue: string }
>('/auth/register', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', payload);
    return response.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchCurrentUser = createAsyncThunk<
  { user: User },
  void,
  { rejectValue: string }
>('/auth/me', async (_, { rejectWithValue }) => {
  try {
    // cookie is sent automatically by the browser, no header needed
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Session expired'));
  }
});

// New: logout must hit the backend now, since only the server can clear an
// httpOnly cookie. Clearing Redux state alone would leave the cookie intact,
// and the user would still be authenticated on the next request.
export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  '/auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Logout failed'));
    }
  },
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Still useful for the OAuth callback flow: after /oauth-success redirect,
    // the cookie is already set by the backend, so this just needs to store
    // the user object Redux-side (e.g. after calling /auth/me once on that page).
    setCredentials: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      })

      // Fetch current user (session restore on app load / page refresh)
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.initialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.initialized = true;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        // Even if the backend call fails, clear local state so the UI
        // doesn't stay stuck showing a logged-in user
        state.user = null;
        state.error = action.payload || 'Logout failed';
      });
  },
});

export const { setCredentials, clearError } = authSlice.actions;
export default authSlice.reducer;
