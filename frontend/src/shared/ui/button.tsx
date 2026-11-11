import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors select-none min-h-11 px-4 py-2.5 disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] border border-transparent hover:bg-[var(--btn-primary-hover)] active:translate-y-px',
        outline:
          'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-control)] hover:bg-[var(--bg-subtle)] active:translate-y-px',
        destructive:
          'bg-[var(--alert-solid-bg)] text-[var(--alert-solid-fg)] border border-transparent hover:bg-[var(--alert-solid-hover)] active:translate-y-px',
        ghost:
          'bg-transparent text-[var(--text-primary)] border border-transparent hover:bg-[var(--bg-subtle)] active:translate-y-px',
      },
      size: {
        default: 'min-h-11 px-4 py-2.5',
        sm: 'min-h-11 px-3 py-2 text-xs',
        lg: 'min-h-12 px-5 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type = 'button', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
