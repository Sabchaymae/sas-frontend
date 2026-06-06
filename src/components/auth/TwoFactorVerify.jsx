import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { twoFactorSchema } from '../../validators/authValidators';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';
import useAuth from '@/hooks/useAuth';
import { useRef, useState, useEffect } from 'react';

/**
 * Two-Factor Authentication verification component
 * 6-digit code input with individual digit boxes
 */
const TwoFactorVerify = () => {
  const { verify2FA: handleVerify, isLoading, error, clearError, user } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: { code: '' },
  });

  // Update form value when code changes
  useEffect(() => {
    const codeStr = code.join('');
    setValue('code', codeStr);
  }, [code, setValue]);

  const handleDigitChange = (index, value) => {
    // Only allow single digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const onSubmit = async (data) => {
    await handleVerify(data);
  };

  return (
    <div className="two-factor-form">
      <div className="two-factor-icon-wrapper">
        <div className="two-factor-icon">
          <ShieldCheck size={40} />
        </div>
      </div>

      <p className="two-factor-description">
        Un code de vérification a été envoyé à votre adresse email
        {user?.email && (
          <strong> {user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}</strong>
        )}
      </p>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={clearError}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="two-factor-fields" noValidate>
        <div className="two-factor-code-inputs">
          {code.map((digit, index) => (
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
              aria-label={`Chiffre ${index + 1}`}
            />
          ))}
        </div>

        {errors.code && (
          <p className="auth-input-error two-factor-error" role="alert">
            {errors.code.message}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
        >
          Vérifier
        </Button>

        <div className="two-factor-actions">
          <button type="button" className="two-factor-resend">
            Renvoyer le code
          </button>
          <a href="/login" className="two-factor-back">
            <ArrowLeft size={16} />
            <span>Retour</span>
          </a>
        </div>
      </form>
    </div>
  );
};

export default TwoFactorVerify;
