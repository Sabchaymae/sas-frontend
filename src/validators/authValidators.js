import { z } from 'zod';
import { PASSWORD_POLICY, USER_ROLES } from '../constants/authConstants';

/**
 * Zod validation schemas for authentication forms
 */

// Password validation with policy enforcement
const passwordSchema = z
  .string()
  .min(PASSWORD_POLICY.MIN_LENGTH, `Le mot de passe doit contenir au moins ${PASSWORD_POLICY.MIN_LENGTH} caractères`)
  .refine(
    (val) => !PASSWORD_POLICY.REQUIRE_UPPERCASE || /[A-Z]/.test(val),
    'Le mot de passe doit contenir au moins une majuscule'
  )
  .refine(
    (val) => !PASSWORD_POLICY.REQUIRE_LOWERCASE || /[a-z]/.test(val),
    'Le mot de passe doit contenir au moins une minuscule'
  )
  .refine(
    (val) => !PASSWORD_POLICY.REQUIRE_NUMBER || /[0-9]/.test(val),
    'Le mot de passe doit contenir au moins un chiffre'
  )
  .refine(
    (val) => !PASSWORD_POLICY.REQUIRE_SPECIAL || /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(val),
    'Le mot de passe doit contenir au moins un caractère spécial'
  );

// Login form schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse email est requise")
    .email("Format d'email invalide"),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis'),
  rememberMe: z.boolean().optional(),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse email est requise")
    .email("Format d'email invalide"),
});

// Registration form schema
export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  email: z
    .string()
    .min(1, "L'adresse email est requise")
    .email("Format d'email invalide"),
  cin: z
    .string()
    .min(4, 'Le numéro de CIN est requis')
    .max(20, 'Le numéro de CIN est trop long'),
  phone: z
    .string()
    .min(1, 'Le numéro de téléphone est requis')
    .regex(/^(\+?\d{1,3}[-.\s]?)?\d{9,14}$/, 'Format de téléphone invalide'),
  role: z
    .string()
    .min(1, 'Le rôle est requis'),
  reason: z
    .string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional()
    .or(z.literal('')),
  password: passwordSchema,
  passwordConfirmation: z
    .string()
    .min(1, 'La confirmation du mot de passe est requise'),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, "Vous devez accepter les conditions d'utilisation"),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['passwordConfirmation'],
});

// Force password change schema
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Le mot de passe actuel est requis'),
    newPassword: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, 'La confirmation du mot de passe est requise'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Le nouveau mot de passe doit être différent de l\'ancien',
    path: ['newPassword'],
  });

// 2FA verification schema
export const twoFactorSchema = z.object({
  code: z
    .string()
    .length(6, 'Le code doit contenir exactement 6 chiffres')
    .regex(/^\d{6}$/, 'Le code ne doit contenir que des chiffres'),
});

/**
 * Calculate password strength score (0-100)
 */
export const calculatePasswordStrength = (password) => {
  if (!password) return 0;

  let score = 0;
  const checks = {
    length: password.length >= PASSWORD_POLICY.MIN_LENGTH,
    lengthBonus: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password),
    noRepeating: !/(.)\1{2,}/.test(password),
  };

  if (checks.length) score += 20;
  if (checks.lengthBonus) score += 10;
  if (checks.uppercase) score += 15;
  if (checks.lowercase) score += 15;
  if (checks.number) score += 15;
  if (checks.special) score += 15;
  if (checks.noRepeating) score += 10;

  return Math.min(score, 100);
};

/**
 * Get password strength label and color
 */
export const getPasswordStrengthInfo = (score) => {
  if (score < 25) return { label: 'Très faible', color: '#ef4444', level: 1 };
  if (score < 50) return { label: 'Faible', color: '#f97316', level: 2 };
  if (score < 75) return { label: 'Moyen', color: '#eab308', level: 3 };
  if (score < 90) return { label: 'Fort', color: '#22c55e', level: 4 };
  return { label: 'Très fort', color: '#10b981', level: 5 };
};
