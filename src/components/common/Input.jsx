

import { cn } from '../../utils/cn';

const Input = ({
  label,
  error,

  icon: Icon,
  className,
  containerClassName,
  ...props
}) => {
  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 transition-colors duration-200">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1428C9] transition-all duration-300" size={18} />
        )}
        <input
          autoComplete="off"
          className={cn(
            'w-full bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:bg-white focus:border-[#1428C9] focus:ring-4 focus:ring-[#1428C9]/5 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) text-sm text-[#111827] font-semibold placeholder:text-slate-300 hover:border-slate-300',
            Icon ? 'pl-11 pr-4' : 'px-4',
            'py-3',
            error && 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/10',
            className
          )}
          {...props}
        />
        {/* Subtle inner container border on hover/focus */}
        <div className="absolute inset-0 rounded-sm pointer-events-none transition-shadow duration-300 opacity-10" />
      </div>
      {error && (
        <div className="flex items-center gap-1.5 ml-1 mt-1 animate-in slide-in-up duration-200">
          <div className="w-1 h-1 rounded-full bg-red-500" />
          <p className="text-[10px] text-red-500 font-bold">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Input;
