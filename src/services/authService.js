import { AUTH_ENDPOINTS } from '../constants/authConstants';
import api from './api';

/**
 * Authentication Service Layer
 * 
 * This service provides a clean interface for auth API calls.
 */

class AuthService {
  /**
   * Login user with email and password
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>}
   */
  async login({ email, password }) {
    const response = await api.post(AUTH_ENDPOINTS.LOGIN, {
      login: email,
      password: password,
    });

    if (response.action === 'two_factor_required') {
      return {
        user: { id: response.user_id },
        requiresTwoFactor: true,
      };
    }

    if (response.action === 'force_password_change') {
      return {
        token: response.token,
        requiresPasswordChange: true,
      };
    }

    return {
      user: response.user,
      token: response.token,
    };
  }

  /**
   * Register a new user
   * @param {Object} data - Registration form data
   * @returns {Promise<Object>}
   */
  async register(data) {
    const payload = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      cin: data.cin,
      phone: data.phone,
      access_reason: data.reason,
      terms: data.acceptTerms,
      password: data.password,
      password_confirmation: data.passwordConfirmation,
      role: data.role || 'agence', // Default role if not selected
    };
    const response = await api.post(AUTH_ENDPOINTS.REGISTER, payload);
    return response;
  }

  /**
   * Verify email during registration
   * @param {Object} data - { email, code }
   */
  async verifyRegistration({ email, code }) {
    const response = await api.post(AUTH_ENDPOINTS.VERIFY_REGISTRATION, { email, code });
    return response;
  }

  /**
   * Resend verification code during registration
   * @param {string} email
   */
  async resendRegistrationCode(email) {
    const response = await api.post(AUTH_ENDPOINTS.RESEND_REGISTRATION, { email });
    return response;
  }

  /**
   * Verify 2FA code
   * @param {Object} data - { user_id, code }
   * @returns {Promise<Object>}
   */
  async verify2FA({ user_id, code }) {
    const response = await api.post(AUTH_ENDPOINTS.VERIFY_2FA, { user_id, code });
    return {
      verified: true,
      token: response.token,
    };
  }

  /**
   * Resend 2FA code
   * @param {Object} data - { user_id }
   * @returns {Promise<Object>}
   */
  async resend2FA({ user_id }) {
    const response = await api.post(AUTH_ENDPOINTS.RESEND_2FA, { user_id });
    return response;
  }

  /**
   * Change password (forced or voluntary)
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async changePassword(data) {
    // If we have a temp token, it's a forced change password, which has its own endpoint
    if (data.isForced) {
      // Need to pass the temp token in headers, which api.js handles via localStorage auth_token
      // The slice should have saved the temp token as auth_token temporarily
      return await api.post(AUTH_ENDPOINTS.FORCE_CHANGE_PASSWORD, {
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
    }
    
    // Standard change password
    return await api.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
      current_password: data.currentPassword,
      password: data.password,
      password_confirmation: data.passwordConfirmation || data.password_confirmation,
    });
  }

  /**
   * Logout current user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await api.post(AUTH_ENDPOINTS.LOGOUT, {});
    } catch (e) {
      // Ignore logout errors, just clear the local session
    }
    return { success: true };
  }

  /**
   * Get current authenticated user profile
   * @returns {Promise<Object>}
   */
  async getCurrentUser() {
    return await api.get(AUTH_ENDPOINTS.ME);
  }
  
  /**
   * Forgot password request
   */
  async forgotPassword({ email }) {
    return await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
  }

  /**
   * Reset password via token
   */
  async resetPassword({ token, email, password, password_confirmation }) {
    return await api.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
      token, email, password, password_confirmation
    });
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
