import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock } from 'lucide-react';
import { loginSchema } from '../../validators/authValidators';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';
import useAuth from '@/hooks/useAuth';

/**
 * Login Form — simple email + password, no role tabs
 */
const LoginForm = () => {
  const { login, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    await login(data);
  };

  return (
    <div className="login-form">
      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={clearError}
          className="login-alert"
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="login-form-fields" noValidate>
        <Input
          id="login-email"
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
          id="login-password"
          label="Mot de passe"
          type="password"
          icon={Lock}
          placeholder="Votre mot de passe"
          required
          error={errors.password?.message}
          autoComplete="current-password"
          {...register('password')}
        />

        {/* Remember me & Forgot password */}
        <div className="login-options">
          <label className="login-remember" htmlFor="login-remember">
            <input
              type="checkbox"
              id="login-remember"
              className="login-checkbox"
              {...register('rememberMe')}
            />
            <span className="login-remember-checkmark"></span>
            <span>Se souvenir de moi</span>
          </label>
          <a href="/forgot-password" className="login-forgot">
            Mot de passe oublié ?
          </a>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
        >
          Se connecter
        </Button>
      </form>

      <div className="login-register-link">
        <span>Pas encore de compte ?</span>
        <a href="/register">Demander l&apos;accès</a>
      </div>
    </div>
  );
};

export default LoginForm;
