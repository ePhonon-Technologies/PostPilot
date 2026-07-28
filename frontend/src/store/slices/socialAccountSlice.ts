import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { getErrorMessage } from './authSlice';
import type { SocialAccount, SocialPlatform, SocialProviderConnection } from '../../types/socialAccounts';
import type { RootState } from '..';
import apiRequest from '../../api/client';

export interface SocialAccountState {
  accounts: SocialAccount[];
  providerConnections: SocialProviderConnection[];
  loading: boolean;
  error: string | null;
  disconnectingId: string | null;
}

const initialState: SocialAccountState = {
  accounts: [],
  providerConnections: [],
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
    const response = await apiRequest.get<SocialAccount[]>('/social-accounts', {
      params: platform ? { platform } : undefined,
    });
    return response.data;
  } catch (err) {
    return rejectWithValue(
      getErrorMessage(err, 'Failed to load connected accounts'),
    );
  }
});


// facebook socialProviderConnections

export const fetchProviderConnections = createAsyncThunk(
  'socialAccounts/fetchProviderConnections',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest.get<SocialProviderConnection[]>('/social-providers', {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch provider connections'
      );
    }
  }
);

export const disconnectProviderConnection = createAsyncThunk<
  SocialPlatform, // Returns the platform enum/string to identify what to remove in state
  SocialPlatform, // Accepts the target platform as the argument
  { rejectValue: string }
>('socialAccounts/disconnectProvider', async (platform, { rejectWithValue }) => {
  try {
    // Pass the platform in the request body (or via params as `/social-providers/${platform.toLowerCase()}`)
    await apiRequest.delete('/social-providers/disconnect', {
      data: { platform },
    });
    return platform;
  } catch (err) {
    return rejectWithValue(
      getErrorMessage(err, `Failed to disconnect ${platform}`),
    );
  }
});

export const disconnectSocialAccount = createAsyncThunk<
  string, // returns the disconnected account's id, so the reducer knows which to remove
  string,
  { rejectValue: string }
>('socialAccounts/disconnect', async (accountId, { rejectWithValue }) => {
  try {
    await apiRequest.delete(`/social-accounts/${accountId}`);
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
      })

      // Fetch Provider Connections
      .addCase(fetchProviderConnections.fulfilled, (state, action) => {
        state.providerConnections = action.payload;
      })

      .addCase(disconnectProviderConnection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // Fulfilled State (Success)
      .addCase(disconnectProviderConnection.fulfilled, (state, action) => {
        state.loading = false;

        // Remove the provider connection matching the disconnected platform
        state.providerConnections = state.providerConnections.filter(
          (conn) => conn.platform !== action.payload,
        );

        // Clear any connected accounts/pages attached to this platform
        state.accounts = state.accounts.filter(
          (acc) => acc.platform !== action.payload,
        );
      })

      // Rejected State (Failure)
      .addCase(disconnectProviderConnection.rejected, (state, action) => {
        state.loading = false;
        // Fallback to action.payload or a default error message
        state.error = action.payload || 'Failed to disconnect social provider';
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

export const selectProviderConnections = (state: RootState) =>
  state.socialAccounts.providerConnections;
