import { useState, useRef, useEffect } from 'react';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';

const RegisterVerifyForm = () => {
  const { 
    verifyRegistrationCode, 
    resendRegistrationCode,
    isLoading, 
    error, 
    clearError, 
    registrationStatus, 
    registrationMessage,
    registrationEmail
  } = useAuth();
  
  const [resendSuccess, setResendSuccess] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // If there's no registration pending, they shouldn't be on this page.
  const email = registrationEmail || localStorage.getItem('registration_email');
  
  if (!email && registrationStatus !== 'success') {
    return <Navigate to="/register" replace />;
  }

  const handleDigitChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split('');
      setVerificationCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const onVerifyCode = async (e) => {
    e.preventDefault();
    const codeStr = verificationCode.join('');
    if (codeStr.length === 6) {
      await verifyRegistrationCode({ code: codeStr, email });
    }
  };

  const onResendCode = async () => {
    setResendLoading(true);
    setResendSuccess(null);
    try {
      await resendRegistrationCode();
      setResendSuccess('Un nouveau code a été envoyé.');
    } catch (err) {
      // Error handled by hook
    } finally {
      setResendLoading(false);
    }
  };

  // Success state (verification complete)
  if (registrationStatus === 'success') {
    return (
      <div className="register-success">
        <div className="register-success-icon">
          <CheckCircle size={64} />
        </div>
        <h2 className="register-success-title">Demande envoyée !</h2>
        <p className="register-success-message">{registrationMessage || "Votre email a bien été vérifié."}</p>
        <div className="register-success-info">
          <p>Vous recevrez une notification par email une fois votre demande traitée par l&apos;administrateur.</p>
        </div>
        <div className="register-success-actions">
          <Link to="/login" className="register-success-link">
            <ArrowLeft size={18} />
            <span>Retour à la connexion</span>
          </Link>
        </div>
      </div>
    );
  }

  // Verification input form
  return (
    <div className="register-success">
      <div className="register-success-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
        <Mail size={64} />
      </div>
      <h2 className="register-success-title">Vérification de l&apos;email</h2>
      <p className="register-success-message">Un code de vérification a été envoyé à votre adresse email. Veuillez le saisir ci-dessous pour finaliser votre inscription.</p>
      
      {error && <Alert type="error" message={error} onClose={clearError} className="mb-6" />}

      <form onSubmit={onVerifyCode} style={{ width: '100%', marginTop: '1.5rem' }}>
        <div className="two-factor-code-inputs">
          {verificationCode.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className={`two-factor-digit ${digit ? 'two-factor-digit--filled' : ''}`}
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              autoFocus={index === 0}
            />
          ))}
        </div>
        <div style={{ marginTop: '2rem' }}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            disabled={verificationCode.join('').length !== 6}
          >
            Vérifier le code
          </Button>
        </div>

        <div className="flex flex-col items-center gap-4 mt-8">
          <button
            type="button"
            onClick={onResendCode}
            disabled={resendLoading}
            className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
          >
            {resendLoading ? 'Envoi...' : 'Renvoyer le code'}
          </button>
          
          {resendSuccess && (
            <p className="text-xs text-green-400 font-medium">{resendSuccess}</p>
          )}

          <Link 
            to="/register" 
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mt-2"
          >
            <ArrowLeft size={16} />
            <span>Retour à l&apos;inscription</span>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterVerifyForm;
