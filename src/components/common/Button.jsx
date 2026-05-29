import { memo } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

const Button = memo(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  icon: Icon,
  loading = false,
  isLoading = false,
  fullWidth = false,
  disabled,
  ...props 
}) => {
  const variants = {
    primary: 'bg-[#1428C9] text-white hover:bg-[#1428C9]/90 active:bg-[#1428C9]',
    secondary: 'bg-[#F0F3FF] text-[#1428C9] hover:bg-[#E0E7FF] active:bg-[#F0F3FF]',
    outline: 'border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#111827] active:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    ghost: 'text-gray-400 hover:text-[#1428C9] hover:bg-[#F0F3FF] active:bg-[#F0F3FF]/80',
  };

  const sizes = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  const isActuallyLoading = loading || isLoading;

  return (
    <button 
      disabled={disabled || isActuallyLoading}
      className={cn(
        'flex items-center justify-center gap-2 rounded-sm font-bold transition-all duration-200 cubic-bezier(0.4, 0, 0.2, 1) active:scale-95 disabled:opacity-50 disabled:pointer-events-none min-w-fit',
        fullWidth && 'w-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isActuallyLoading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 16 : 18} />
      ) : (
        Icon && <Icon size={size === 'sm' ? 16 : 18} />
      )}
      {children}
    </button>
  );
});

export default Button;
