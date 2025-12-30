'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react'; // Already in your package.json
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showPasswordToggle?: boolean; // New prop
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, showPasswordToggle, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    // Determine the actual type to display
    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
      <div className="relative w-full">
        <input
          type={inputType}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            showPasswordToggle && type === 'password' && 'pr-10', // Add padding for the icon
            className
          )}
          ref={ref}
          {...props}
        />
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };