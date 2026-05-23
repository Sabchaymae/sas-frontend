import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, User, Phone, FileText, CreditCard, Lock, Briefcase } from 'lucide-react';
import { registerSchema } from '@/validators/authValidators';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';
import useAuth from '@/hooks/useAuth';

/**
 * Registration form — access request (no role selection, no company name, no terms checkbox)
 */
const RegisterForm = () => {
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      cin: '',
      phone: '',
      role: '',
      password: '',
      passwordConfirmation: '',
      reason: '',
      acceptTerms: false,
    },
  });

  const acceptTerms = watch('acceptTerms');

  const onSubmit = async (data) => {
    await registerUser(data);
  };

  return (
    <div className="register-form">
      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={clearError}
          className="register-alert"
        />
      )}

      {/* Info Alert */}
      <Alert
        type="info"
        title="Demande d'accès"
        message="Remplissez ce formulaire pour demander un accès à la plateforme. Votre demande sera examinée par un administrateur."
        dismissible={false}
        className="register-info"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="register-form-fields" noValidate>
        {/* User Info Grid (2 columns on desktop) */}
        <div className="register-grid">
          <Input
            id="register-firstName"
            label="Prénom"
            icon={User}
            placeholder="Votre prénom"
            required
            error={errors.firstName?.message}
            autoComplete="given-name"
            {...register('firstName')}
          />
          <Input
            id="register-lastName"
            label="Nom"
            icon={User}
            placeholder="Votre nom"
            required
            error={errors.lastName?.message}
            autoComplete="family-name"
            {...register('lastName')}
          />
          <Input
            id="register-email"
            label="Adresse email"
            type="email"
            icon={Mail}
            placeholder="votre@email.com"
            required
            error={errors.email?.message}
            autoComplete="email"
            {...register('email')}
          />
          <Input
            id="register-phone"
            label="Numéro de téléphone"
            type="tel"
            icon={Phone}
            placeholder="+212 6XX XXX XXX"
            required
            error={errors.phone?.message}
            autoComplete="tel"
            {...register('phone')}
          />
          <Input
            id="register-cin"
            label="Numéro de CIN"
            icon={CreditCard}
            placeholder="ex: AA123456"
            required
            error={errors.cin?.message}
            {...register('cin')}
          />

          <div className="auth-input-group">
            <label htmlFor="register-role" className="auth-input-label">
              Rôle
              <span className="auth-input-required">*</span>
            </label>
            <div className={`auth-input-wrapper ${errors.role ? 'auth-input-wrapper--error' : ''}`}>
              <span className="auth-input-icon">
                <Briefcase size={18} />
              </span>
              <select
                id="register-role"
                className="auth-input text-white"
                style={{ appearance: 'none' }}
                {...register('role')}
              >
                <option value="" disabled className="bg-[#1a1c23] text-gray-400">Sélectionnez un rôle</option>
                <option value="animateur" className="bg-[#1a1c23] text-white">Animateur</option>
                <option value="assistant" className="bg-[#1a1c23] text-white">Assistant</option>
                <option value="agence" className="bg-[#1a1c23] text-white">Agence</option>
                <option value="operateur" className="bg-[#1a1c23] text-white">Opérateur</option>
              </select>
            </div>
            {errors.role && (
              <p className="auth-input-error" role="alert">{errors.role.message}</p>
            )}
          </div>
          <Input
            id="register-password"
            label="Mot de passe"
            type="password"
            icon={Lock}
            placeholder="Créer un mot de passe"
            required
            error={errors.password?.message}
            autoComplete="new-password"
            {...register('password')}
          />
          <Input
            id="register-password-confirm"
            label="Confirmer le mot de passe"
            type="password"
            icon={Lock}
            placeholder="Répéter le mot de passe"
            required
            error={errors.passwordConfirmation?.message}
            autoComplete="new-password"
            {...register('passwordConfirmation')}
          />
        </div>

        {/* Reason / Justification */}
        <div className="auth-input-group">
          <label htmlFor="register-reason" className="auth-input-label">
            Motif de la demande
            <span className="ml-1 text-xs text-gray-400 font-normal">(Optionnel)</span>
          </label>
          <div className={`auth-input-wrapper auth-textarea-wrapper ${errors.reason ? 'auth-input-wrapper--error' : ''}`}>
            <span className="auth-textarea-icon">
              <FileText size={18} />
            </span>
            <textarea
              id="register-reason"
              className="auth-textarea"
              placeholder="Décrivez brièvement la raison de votre demande d'accès..."
              rows={4}
              {...register('reason')}
            />
          </div>
          {errors.reason && (
            <p className="auth-input-error" role="alert">{errors.reason.message}</p>
          )}
        </div>

        {/* Terms & Conditions */}
        <label className="register-terms" htmlFor="register-acceptTerms">
          <input
            type="checkbox"
            id="register-acceptTerms"
            className="login-checkbox"
            {...register('acceptTerms')}
          />
          <span className="login-remember-checkmark"></span>
          <span>
            J&apos;accepte les{' '}
            <a href="/terms" className="register-terms-link">conditions d&apos;utilisation</a>
            {' '}et la{' '}
            <a href="/privacy" className="register-terms-link">politique de confidentialité</a>
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="auth-input-error" role="alert">{errors.acceptTerms.message}</p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          disabled={!acceptTerms}
        >
          Soumettre la demande
        </Button>
      </form>

      <div className="login-register-link">
        <span>Vous avez déjà un compte ?</span>
        <a href="/login">Se connecter</a>
      </div>
    </div>
  );
};

export default RegisterForm;
