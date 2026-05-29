import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ShieldCheck } from 'lucide-react';
import { changePasswordSchema } from '../../validators/authValidators';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';
import useAuth from '@/hooks/useAuth';

/**
 * Force Password Change form
 * Displayed when a new user logs in for the first time
 */
const ForcePasswordChange = () => {
  const { changePassword: handleChangePassword, isLoading, error, clearError, user } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    await handleChangePassword(data);
  };

  return (
    <div className="force-password-form">
      <div className="force-password-notice">
        <ShieldCheck size={24} className="force-password-notice-icon" />
        <div>
          <p className="force-password-notice-title">Changement de mot de passe requis</p>
          <p className="force-password-notice-text">
            Pour des raisons de sécurité, vous devez définir un nouveau mot de passe avant d&apos;accéder à la plateforme.
          </p>
        </div>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={clearError}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="force-password-fields" noValidate>
        <Input
          id="change-currentPassword"
          label="Mot de passe actuel"
          type="password"
          icon={Lock}
          placeholder="Votre mot de passe temporaire"
          required
          error={errors.currentPassword?.message}
          autoComplete="current-password"
          {...register('currentPassword')}
        />

        <Input
          id="change-newPassword"
          label="Nouveau mot de passe"
          type="password"
          icon={Lock}
          placeholder="Créez un mot de passe sécurisé"
          required
          error={errors.newPassword?.message}
          autoComplete="new-password"
          {...register('newPassword')}
        />

        <PasswordStrengthIndicator password={newPassword} />

        <Input
          id="change-confirmPassword"
          label="Confirmer le mot de passe"
          type="password"
          icon={Lock}
          placeholder="Confirmez votre nouveau mot de passe"
          required
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
        >
          Confirmer le changement
        </Button>
      </form>
    </div>
  );
};

export default ForcePasswordChange;
