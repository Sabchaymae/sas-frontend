import AuthLayout from '@/components/layout/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

const LoginPage = () => (
  <AuthLayout
    title="Connexion"
    subtitle="Connectez-vous ou créez votre compte Oriotel."
  >
    <LoginForm />
  </AuthLayout>
);

export default LoginPage;
