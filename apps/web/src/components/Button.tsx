'use client';

import React, { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

/**
 * Button - Accessible button component with semantic HTML
 * 
 * Features:
 * - Proper ARIA attributes
 * - Keyboard accessible (Tab, Enter, Space)
 * - Focus indicators
 * - Loading state
 * - Multiple variants and sizes
 * - Disabled state support
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled = false,
      className = '',
      ariaLabel,
      ariaDescribedBy,
      children,
      ...rest
    },
    ref
  ) => {
    const variantStyles = {
      primary: 'bg-primary text-white hover:bg-primary/90 active:bg-primary/80',
      secondary:
        'bg-secondary text-white hover:bg-secondary/90 active:bg-secondary/80',
      outline:
        'border border-border bg-background text-foreground hover:bg-muted active:bg-foreground/10',
      danger: 'bg-accent text-white hover:bg-accent/90 active:bg-accent/80',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const baseStyles =
      'rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

    const allStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
      fullWidth ? 'w-full' : ''
    } ${className}`;

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || isLoading}
        className={allStyles}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-busy={isLoading}
        {...rest}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
