import AuthLayout from '@/components/layout/AuthLayout';
import ForcePasswordChange from '@/components/auth/ForcePasswordChange';

const ForcePasswordChangePage = () => (
  <AuthLayout
    title="Nouveau mot de passe"
    subtitle="Définissez un mot de passe sécurisé avant d'accéder à la plateforme."
  >
    <ForcePasswordChange />
  </AuthLayout>
);

export default ForcePasswordChangePage;
