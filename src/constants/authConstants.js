/**
 * Authentication module constants
 * Centralized configuration for the Identity Service
 */

// User roles matching the Identity Service use case actors
export const USER_ROLES = {
  ADMIN: 'admin',
  INTERNE: 'interne',
  EXTERNE: 'externe',
};

// Sub-types for internal users
export const INTERNAL_TYPES = {
  ANIMATEUR: 'animateur',
  ASSISTANT: 'assistant',
};

// Sub-types for external users
export const EXTERNAL_TYPES = {
  AGENCE: 'agence',
  OPERATEUR: 'operateur',
};

// Registration request status
export const REGISTRATION_STATUS = {
  IDLE: 'idle',
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Auth flow steps
export const AUTH_STEPS = {
  LOGIN: 'login',
  TWO_FACTOR: 'two_factor',
  FORCE_PASSWORD_CHANGE: 'force_password_change',
  AUTHENTICATED: 'authenticated',
};

// Password policy
export const PASSWORD_POLICY = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
  SPECIAL_CHARS: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

// Login tab configuration
export const LOGIN_TABS = [
  {
    id: USER_ROLES.ADMIN,
    labelKey: 'auth.login.tabs.admin',
    label: 'Administrateur',
    icon: 'Shield',
  },
  {
    id: USER_ROLES.INTERNE,
    labelKey: 'auth.login.tabs.interne',
    label: 'Interne',
    icon: 'Building2',
    subtypes: [
      { value: INTERNAL_TYPES.ANIMATEUR, label: 'Animateur' },
      { value: INTERNAL_TYPES.ASSISTANT, label: 'Assistant' },
    ],
  },
  {
    id: USER_ROLES.EXTERNE,
    labelKey: 'auth.login.tabs.externe',
    label: 'Externe',
    icon: 'Globe',
    subtypes: [
      { value: EXTERNAL_TYPES.AGENCE, label: 'Agence' },
      { value: EXTERNAL_TYPES.OPERATEUR, label: 'Opérateur' },
    ],
  },
];

// API endpoints (to be updated when backend is ready)
export const AUTH_ENDPOINTS = {
  LOGIN: 'v1/auth/login',
  REGISTER: 'v1/auth/register',
  VERIFY_REGISTRATION: 'v1/auth/register/verify',
  RESEND_REGISTRATION: 'v1/auth/register/resend',
  VERIFY_2FA: 'v1/auth/two-factor/verify',
  RESEND_2FA: 'v1/auth/two-factor/resend',
  FORCE_CHANGE_PASSWORD: 'v1/auth/force-change-password',
  CHANGE_PASSWORD: 'v1/auth/change-password',
  ME: 'v1/auth/me',
  LOGOUT: 'v1/auth/logout',
  REFRESH: 'v1/auth/refresh',
  FORGOT_PASSWORD: 'v1/auth/forgot-password',
  RESET_PASSWORD: 'v1/auth/reset-password',
};
