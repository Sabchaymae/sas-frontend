import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * Alert/Toast notification component
 */
const Alert = ({
  type = 'info', // 'success' | 'error' | 'warning' | 'info'
  message,
  title,
  dismissible = true,
  autoClose = 0, // ms, 0 = don't auto-close
  onClose,
  className = '',
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!visible || !message) return null;

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  };

  const IconComponent = icons[type] || Info;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div className={`auth-alert auth-alert--${type} ${className}`} role="alert">
      <div className="auth-alert-icon">
        <IconComponent size={20} />
      </div>
      <div className="auth-alert-content">
        {title && <p className="auth-alert-title">{title}</p>}
        <p className="auth-alert-message">{message}</p>
      </div>
      {dismissible && (
        <button
          type="button"
          className="auth-alert-close"
          onClick={handleClose}
          aria-label="Fermer"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
