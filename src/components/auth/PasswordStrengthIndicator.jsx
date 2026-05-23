import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { calculatePasswordStrength, getPasswordStrengthInfo } from '../../validators/authValidators';
import { PASSWORD_POLICY } from '../../constants/authConstants';

/**
 * Visual password strength indicator with progress bar and requirement checklist
 */
const PasswordStrengthIndicator = ({ password = '' }) => {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);
  const strengthInfo = useMemo(() => getPasswordStrengthInfo(strength), [strength]);

  const requirements = useMemo(() => [
    {
      label: `Au moins ${PASSWORD_POLICY.MIN_LENGTH} caractères`,
      met: password.length >= PASSWORD_POLICY.MIN_LENGTH,
    },
    {
      label: 'Une lettre majuscule',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Une lettre minuscule',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Un chiffre',
      met: /[0-9]/.test(password),
    },
    {
      label: 'Un caractère spécial (!@#$...)',
      met: /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password),
    },
  ], [password]);

  if (!password) return null;

  return (
    <div className="password-strength">
      {/* Strength bar */}
      <div className="password-strength-bar">
        <div className="password-strength-bar-track">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className="password-strength-bar-segment"
              style={{
                backgroundColor: level <= strengthInfo.level ? strengthInfo.color : 'rgba(255,255,255,0.08)',
              }}
            />
          ))}
        </div>
        <span
          className="password-strength-label"
          style={{ color: strengthInfo.color }}
        >
          {strengthInfo.label}
        </span>
      </div>

      {/* Requirements checklist */}
      <ul className="password-strength-requirements">
        {requirements.map((req, index) => (
          <li
            key={index}
            className={`password-strength-requirement ${req.met ? 'password-strength-requirement--met' : ''}`}
          >
            {req.met ? (
              <Check size={14} className="password-strength-check" />
            ) : (
              <X size={14} className="password-strength-x" />
            )}
            <span>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrengthIndicator;
