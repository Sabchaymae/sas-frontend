import AuthLayout from '@/components/layout/AuthLayout';
import TwoFactorVerify from '@/components/auth/TwoFactorVerify';

const TwoFactorPage = () => (
  <AuthLayout
    title="Vérification en deux étapes"
    subtitle="Un code de vérification a été envoyé à votre adresse email."
  >
    <TwoFactorVerify />
  </AuthLayout>
);

export default TwoFactorPage;
