import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import {
  loginUser,
  registerUser,
  verifyRegistrationCode,
  resendRegistrationCode,
  verify2FA,
  changePassword,
  logoutUser,
  fetchCurrentUser,
  clearError,
  resetRegistration,
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  selectAuthStep,
  selectRegistrationStatus,
} from '@/store/slices/authSlice';

/**
 * Custom hook for authentication actions and state
 * Provides a clean API for components to interact with auth
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);
  const authStep = useSelector(selectAuthStep);
  const registrationStatus = useSelector(selectRegistrationStatus);
  const registrationEmail = useSelector((state) => state.auth.registrationEmail);

  const handleLogin = useCallback(async (credentials) => {
    const result = await dispatch(loginUser(credentials));
    if (loginUser.fulfilled.match(result)) {
      const { requiresTwoFactor, requiresPasswordChange } = result.payload;
      if (requiresTwoFactor) {
        navigate('/auth/2fa');
      } else if (requiresPasswordChange) {
        navigate('/auth/change-password');
      } else if (result.payload.redirect) {
        navigate(result.payload.redirect);
      } else {
        navigate('/dashboard');
      }
    }
    return result;
  }, [dispatch, navigate]);

  const handleRegister = useCallback(async (data) => {
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result) && result.payload?.success !== false) {
      navigate('/register/verify');
    }
    return result;
  }, [dispatch, navigate]);

  const handleVerifyRegistrationCode = useCallback(async (data) => {
    const result = await dispatch(verifyRegistrationCode(data));
    return result;
  }, [dispatch]);

  const handleResendRegistrationCode = useCallback(async () => {
    const email = registrationEmail || localStorage.getItem('registration_email');
    if (email) {
      return await dispatch(resendRegistrationCode(email));
    }
  }, [dispatch, registrationEmail]);

  const handleVerify2FA = useCallback(async (data) => {
    const result = await dispatch(verify2FA(data));
    if (verify2FA.fulfilled.match(result)) {
      if (auth.user?.mustChangePassword) {
        navigate('/auth/change-password');
      } else {
        navigate('/dashboard');
      }
    }
    return result;
  }, [dispatch, navigate, auth.user]);

  const handleChangePassword = useCallback(async (data) => {
    const result = await dispatch(changePassword(data));
    if (changePassword.fulfilled.match(result)) {
      navigate('/dashboard');
    }
    return result;
  }, [dispatch, navigate]);

  const handleLogout = useCallback(async () => {
    await dispatch(logoutUser());
    navigate('/login');
  }, [dispatch, navigate]);

  const handleFetchCurrentUser = useCallback(async () => {
    const result = await dispatch(fetchCurrentUser());
    return result;
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleResetRegistration = useCallback(() => {
    dispatch(resetRegistration());
  }, [dispatch]);

  return {
    // State
    auth,
    user,
    isAuthenticated,
    isLoading,
    error,
    authStep,
    registrationStatus,
    registrationMessage: auth.registrationMessage,
    passwordChangeRequired: auth.passwordChangeRequired,
    twoFactorPending: auth.twoFactorPending,

    // Actions
    login: handleLogin,
    register: handleRegister,
    verifyRegistrationCode: handleVerifyRegistrationCode,
    resendRegistrationCode: handleResendRegistrationCode,
    verify2FA: handleVerify2FA,
    changePassword: handleChangePassword,
    logout: handleLogout,
    fetchCurrentUser: handleFetchCurrentUser,
    clearError: handleClearError,
    resetRegistration: handleResetRegistration,
    registrationEmail,
  };
};

export default useAuth;
