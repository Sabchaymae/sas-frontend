import { memo } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

const Select = memo(({ 
  label, 
  options = [], 
  error, 
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
        <select
          className={cn(
            'w-full appearance-none pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:bg-white focus:border-[#1428C9] focus:ring-4 focus:ring-[#1428C9]/5 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) text-sm text-[#111827] font-semibold cursor-pointer hover:border-slate-300',
            error && 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/10',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="py-2">
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          <div className="w-[1px] h-4 bg-slate-200 mr-3 group-focus-within:bg-[#1428C9]/20 transition-colors" />
          <ChevronDown size={16} className="text-slate-400 group-focus-within:text-[#1428C9] transition-colors" />
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-1.5 ml-1 mt-1 animate-in slide-in-up duration-200">
          <div className="w-1 h-1 rounded-full bg-red-500" />
          <p className="text-[10px] text-red-500 font-bold">{error}</p>
        </div>
      )}
    </div>
  );
});

export default Select;
