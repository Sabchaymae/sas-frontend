import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { forgotPasswordSchema } from '@/validators/authValidators';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';

/**
 * Forgot Password form
 */
const ForgotPasswordForm = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="register-success">
        <div className="register-success-icon">
          <CheckCircle size={64} />
        </div>
        <h2 className="register-success-title">Email envoyé !</h2>
        <p className="register-success-message">
          Si l&apos;adresse email correspond à un compte actif, vous recevrez un lien pour réinitialiser votre mot de passe.
        </p>
        <div className="register-success-info">
          <p>N&apos;oubliez pas de vérifier votre dossier spam (courrier indésirable).</p>
        </div>
        <div className="register-success-actions">
          <a href="/login" className="register-success-link">
            <ArrowLeft size={18} />
            <span>Retour à la connexion</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-form">
      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
          className="login-alert"
        />
      )}

      {/* Info Alert */}
      <Alert
        type="info"
        title="Réinitialisation du mot de passe"
        message="Entrez l'adresse email associée à votre compte. Nous vous enverrons un lien sécurisé pour créer un nouveau mot de passe."
        dismissible={false}
        className="register-info"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="login-form-fields" noValidate>
        <Input
          id="forgot-email"
          label="Adresse email"
          type="email"
          icon={Mail}
          placeholder="votre@email.com"
          required
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />

        <div style={{ marginTop: '1rem' }}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            Envoyer le lien
          </Button>
        </div>
      </form>

      <div className="login-register-link">
        <span>Vous vous souvenez de votre mot de passe ?</span>
        <a href="/login">Se connecter</a>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
