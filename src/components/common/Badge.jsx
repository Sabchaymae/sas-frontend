import { memo } from 'react';
import { cn } from '../../utils/cn';

const Badge = memo(({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-gray-50 text-gray-700 border-gray-100',
    success: 'bg-green-50 text-green-700 border-green-100',
    warning: 'bg-orange-50 text-orange-700 border-orange-100',
    error: 'bg-red-50 text-red-700 border-red-100',
    primary: 'bg-blue-50 text-blue-700 border-blue-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  };

  return (
    <span className={cn(
      'px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border',
      variants[variant] || variants.default,
      className
    )}>
      {children}
    </span>
  );
});

export default Badge;
