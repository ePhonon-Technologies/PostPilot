import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import api from '../../api/client';
import { getErrorMessage } from './authSlice';
import type { SocialAccount, SocialPlatform } from '../../types/socialAccounts';
import type { RootState } from '..';

interface SocialAccountState {
  accounts: SocialAccount[];
  loading: boolean;
  error: string | null;
  disconnectingId: string | null; // tracks which account is mid-disconnect, so only that card shows a spinner
}

const initialState: SocialAccountState = {
  accounts: [],
  loading: false,
  error: null,
  disconnectingId: null,
};

// ---------------------------------------------------------------------------
// Thunks
// ---------------------------------------------------------------------------

export const fetchSocialAccounts = createAsyncThunk<
  SocialAccount[],
  SocialPlatform | void,
  { rejectValue: string }
>('socialAccounts/fetch', async (platform, { rejectWithValue }) => {
  try {
    const response = await api.get<SocialAccount[]>('/social-accounts', {
      params: platform ? { platform } : undefined,
    });
    return response.data;
  } catch (err) {
    return rejectWithValue(
      getErrorMessage(err, 'Failed to load connected accounts'),
    );
  }
});

export const disconnectSocialAccount = createAsyncThunk<
  string, // returns the disconnected account's id, so the reducer knows which to remove
  string,
  { rejectValue: string }
>('socialAccounts/disconnect', async (accountId, { rejectWithValue }) => {
  try {
    await api.delete(`/social-accounts/${accountId}`);
    return accountId;
  } catch (err) {
    return rejectWithValue(
      getErrorMessage(err, 'Failed to disconnect account'),
    );
  }
});

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

export const socialAccountSlice = createSlice({
  name: 'socialAccounts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Used by the OAuth-callback page: after redirecting back with
    // ?platform=connected, we don't necessarily want to wait for a full
    // refetch before showing something — this lets a component optimistically
    // push a freshly-connected account into state if it already has the data
    // (e.g. from a dedicated "connection successful" API response).
    upsertAccount: (state, action: PayloadAction<SocialAccount>) => {
      const index = state.accounts.findIndex((a) => a.id === action.payload.id);
      if (index >= 0) {
        state.accounts[index] = action.payload;
      } else {
        state.accounts.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchSocialAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSocialAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchSocialAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load connected accounts';
      })

      // Disconnect
      .addCase(disconnectSocialAccount.pending, (state, action) => {
        state.disconnectingId = action.meta.arg;
        state.error = null;
      })
      .addCase(disconnectSocialAccount.fulfilled, (state, action) => {
        state.disconnectingId = null;
        state.accounts = state.accounts.filter((a) => a.id !== action.payload);
      })
      .addCase(disconnectSocialAccount.rejected, (state, action) => {
        state.disconnectingId = null;
        state.error = action.payload || 'Failed to disconnect account';
      });
  },
});

export const { clearError, upsertAccount } = socialAccountSlice.actions;
export default socialAccountSlice.reducer;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

// Stable selector — returns the SAME array reference every time state hasn't
// actually changed. Filtering by platform happens in the component (via
// useMemo) instead of here, since filtering inside the selector would create
// a new array on every call and cause an infinite re-render loop.
export const selectAllSocialAccounts = (state: RootState) =>
  state.socialAccounts.accounts;

export const selectSocialAccountsLoading = (state: RootState) =>
  state.socialAccounts.loading;

export const selectSocialAccountsError = (state: RootState) =>
  state.socialAccounts.error;

export const selectDisconnectingId = (state: RootState) =>
  state.socialAccounts.disconnectingId;
