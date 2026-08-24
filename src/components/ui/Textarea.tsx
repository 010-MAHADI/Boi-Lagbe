import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Shows a live "used / max" counter — needs `maxLength` and a controlled `value`. */
  showCount?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, showCount, className, id, maxLength, value, rows = 4, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const used = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-text-main mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          maxLength={maxLength}
          value={value}
          className={cn(
            'w-full px-4 py-2.5 rounded-[var(--radius-input)] border border-border-warm bg-white text-text-main placeholder:text-text-muted transition-all duration-200 resize-y',
            error && 'border-error focus:ring-error/20 focus:border-error',
            className
          )}
          {...props}
        />
        <div className="mt-1 flex items-start justify-between gap-3">
          <div className="flex-1">
            {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
            {error && <p className="text-xs text-error">{error}</p>}
          </div>
          {showCount && maxLength && (
            <span className="text-xs text-text-muted tabular-nums shrink-0">
              {used}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
