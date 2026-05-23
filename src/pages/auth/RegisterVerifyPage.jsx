import AuthLayout from '@/components/layout/AuthLayout';
import RegisterVerifyForm from '@/components/auth/RegisterVerifyForm';

const RegisterVerifyPage = () => {
  return (
    <AuthLayout
      title="Vérification Email"
      subtitle="Validez votre adresse email"
    >
      <RegisterVerifyForm />
    </AuthLayout>
  );
};

export default RegisterVerifyPage;
