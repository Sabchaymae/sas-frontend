import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { AUTH_STEPS, REGISTRATION_STATUS } from '../../constants/authConstants';

/**
 * Auth Redux Slice
 * Manages authentication state across the application
 */

// ─── Async Thunks ────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Clear any stale session before logging in
      localStorage.removeItem('auth_token');
      const response = await authService.login(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      if (response.success === false) {
        return rejectWithValue(response.message || 'Une erreur est survenue lors de l\'inscription');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyRegistrationCode = createAsyncThunk(
  'auth/verifyRegistration',
  async (data, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const email = state.auth.registrationEmail || localStorage.getItem('registration_email');
      const response = await authService.verifyRegistration({ ...data, email });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resendRegistrationCode = createAsyncThunk(
  'auth/resendRegistration',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.resendRegistrationCode(email);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verify2FA = createAsyncThunk(
  'auth/verify2FA',
  async (data, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const user_id = state.auth.user?.id || localStorage.getItem('2fa_user_id');
      const response = await authService.verify2FA({ ...data, user_id });
      
      // Usually, we need the user profile after 2FA is verified, so let's fetch it if missing
      let user = response.user;
      if (!user) {
        // We set the token in localStorage so authService can use it
        localStorage.setItem('auth_token', response.token);
        user = await authService.getCurrentUser();
      }
      return { ...response, user };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('2fa_user_id');
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ─── Initial State ───────────────────────────────────────

const initialState = {
  user: null,
  token: localStorage.getItem('auth_token') || null,
  refreshToken: null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,
  registrationStatus: REGISTRATION_STATUS.IDLE,
  registrationMessage: null,
  registrationEmail: localStorage.getItem('registration_email') || null,
  passwordChangeRequired: false,
  twoFactorPending: false,
  authStep: !!localStorage.getItem('auth_token') ? AUTH_STEPS.AUTHENTICATED : AUTH_STEPS.LOGIN,
};

// ─── Slice ───────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    resetRegistration(state) {
      state.registrationStatus = REGISTRATION_STATUS.IDLE;
      state.registrationMessage = null;
      state.error = null;
    },
    setAuthStep(state, action) {
      state.authStep = action.payload;
    },
    resetAuth() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // ── Login ──
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.user = action.payload.user;

        if (action.payload.requiresTwoFactor) {
          state.twoFactorPending = true;
          state.authStep = AUTH_STEPS.TWO_FACTOR;
          state.isAuthenticated = false;
          if (action.payload.user?.id) {
            localStorage.setItem('2fa_user_id', action.payload.user.id);
          }
        } else if (action.payload.requiresPasswordChange) {
          state.passwordChangeRequired = true;
          state.authStep = AUTH_STEPS.FORCE_PASSWORD_CHANGE;
          state.isAuthenticated = false;
          // Save temp token for password change flow
          state.token = action.payload.token;
          if (action.payload.token) localStorage.setItem('auth_token', action.payload.token);
        } else {
          state.isAuthenticated = true;
          state.authStep = AUTH_STEPS.AUTHENTICATED;
          state.token = action.payload.token;
          if (action.payload.token) localStorage.setItem('auth_token', action.payload.token);
          localStorage.removeItem('2fa_user_id');
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ── Register ──
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.registrationStatus = REGISTRATION_STATUS.PENDING;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Proceed to verification step
        state.registrationStatus = REGISTRATION_STATUS.VERIFICATION_REQUIRED;
        state.registrationMessage = action.payload.message;
        const email = action.payload.email;
        state.registrationEmail = email;
        if (email) {
          localStorage.setItem('registration_email', email);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.registrationStatus = REGISTRATION_STATUS.ERROR;
      });

    // ── Verify Registration ──
    builder
      .addCase(verifyRegistrationCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyRegistrationCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registrationStatus = REGISTRATION_STATUS.SUCCESS;
        state.registrationMessage = action.payload.message || 'Votre demande a été soumise avec succès.';
        state.registrationEmail = null;
        localStorage.removeItem('registration_email');
      })
      .addCase(verifyRegistrationCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ── 2FA ──
    builder
      .addCase(verify2FA.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verify2FA.fulfilled, (state, action) => {
        state.isLoading = false;
        state.twoFactorPending = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        
        // Persist final token after 2FA
        if (action.payload.token) localStorage.setItem('auth_token', action.payload.token);
        localStorage.removeItem('2fa_user_id');

        if (state.user?.mustChangePassword) {
          state.passwordChangeRequired = true;
          state.authStep = AUTH_STEPS.FORCE_PASSWORD_CHANGE;
        } else {
          state.isAuthenticated = true;
          state.authStep = AUTH_STEPS.AUTHENTICATED;
        }
      })
      .addCase(verify2FA.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ── Change Password ──
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.passwordChangeRequired = false;
        state.isAuthenticated = true;
        state.authStep = AUTH_STEPS.AUTHENTICATED;
        if (state.user) {
          state.user.mustChangePassword = false;
        }
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ── Logout ──
    builder
      .addCase(logoutUser.fulfilled, () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('2fa_user_id');
        localStorage.removeItem('registration_email');
        return {
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          registrationStatus: REGISTRATION_STATUS.IDLE,
          registrationMessage: null,
          registrationEmail: null,
          passwordChangeRequired: false,
          twoFactorPending: false,
          authStep: AUTH_STEPS.LOGIN,
        };
      });

    // ── Fetch Current User ──
    builder
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user || action.payload.data || action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        // If fetch user fails, we might want to clear auth state
        state.isAuthenticated = false;
        state.token = null;
        localStorage.removeItem('auth_token');
      });

  },
});

// ─── Exports ─────────────────────────────────────────────

export const { clearError, resetRegistration, setAuthStep, resetAuth } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthStep = (state) => state.auth.authStep;
export const selectRegistrationStatus = (state) => state.auth.registrationStatus;
export const selectRegistrationEmail = (state) => state.auth.registrationEmail;

export default authSlice.reducer;
