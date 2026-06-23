<<<<<<< HEAD
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * Alert/Toast notification component
=======
import { AlertCircle, CheckCircle, Info, X, TriangleAlert } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * Modern Alert/Toast notification component
>>>>>>> import/master
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
<<<<<<< HEAD
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  };

=======
    error: TriangleAlert, // Match image (red triangle)
    warning: TriangleAlert,
    info: Info, // Match image (yellow circle with i)
  };

  const styles = {
    success: {
      bg: 'bg-[#e7f8f2]', // Very light green/mint from image
      icon: 'text-[#00c56d]', // Bright success green
      text: 'text-[#111827]',
      close: 'text-[#6b7280]',
    },
    error: {
      bg: 'bg-[#feecec]', // Very light red from image
      icon: 'text-[#ff4b4b]', // Error red
      text: 'text-[#111827]',
      close: 'text-[#6b7280]',
    },
    warning: {
      bg: 'bg-[#fff4e5]', // Light orange/yellow
      icon: 'text-[#ff9433]', // Warning orange
      text: 'text-[#111827]',
      close: 'text-[#6b7280]',
    },
    info: {
      bg: 'bg-[#fff8e1]', // Light yellow from image
      icon: 'text-[#ffbc11]', // Info yellow/gold
      text: 'text-[#111827]',
      close: 'text-[#6b7280]',
    },
  };

  const currentStyle = styles[type] || styles.info;
>>>>>>> import/master
  const IconComponent = icons[type] || Info;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
<<<<<<< HEAD
    <div className={`auth-alert auth-alert--${type} ${className}`} role="alert">
      <div className="auth-alert-icon">
        <IconComponent size={20} />
      </div>
      <div className="auth-alert-content">
        {title && <p className="auth-alert-title">{title}</p>}
        <p className="auth-alert-message">{message}</p>
=======
    <div
      className={`
        ${currentStyle.bg}
        flex items-center gap-4 px-5 py-3.5 rounded-[18px]
        transition-all duration-300 ease-out
        animate-in fade-in slide-in-from-top-2
        ${className}
      `}
      role="alert"
    >
      <div className={`flex-shrink-0 ${currentStyle.icon}`}>
        <IconComponent size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] font-medium leading-tight ${currentStyle.text}`}>
          {message}
        </p>
>>>>>>> import/master
      </div>
      {dismissible && (
        <button
          type="button"
<<<<<<< HEAD
          className="auth-alert-close"
          onClick={handleClose}
          aria-label="Fermer"
        >
          <X size={16} />
=======
          className={`
            flex-shrink-0 p-1 rounded-full
            hover:bg-black/5 transition-colors duration-200
            ${currentStyle.close}
          `}
          onClick={handleClose}
          aria-label="Fermer"
        >
          <X size={20} />
>>>>>>> import/master
        </button>
      )}
    </div>
  );
};

export default Alert;
