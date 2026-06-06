import AuthLayout from '@/components/layout/AuthLayout';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

const ForgotPasswordPage = () => (
  <AuthLayout
    title="Mot de passe oublié ?"
    subtitle="Réinitialisez l'accès à votre compte Oriotel."
  >
    <ForgotPasswordForm />
  </AuthLayout>
);

export default ForgotPasswordPage;
