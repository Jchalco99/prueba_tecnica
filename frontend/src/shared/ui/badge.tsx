import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-xs font-semibold tracking-tight',
  {
    variants: {
      variant: {
        alert:
          'bg-[var(--alert-bg)] text-[var(--alert-fg)] border-[var(--alert-border)]',
        ok:
          'bg-[var(--ok-bg)] text-[var(--ok-fg)] border-[var(--ok-border)]',
        neutral:
          'bg-[var(--bg-subtle)] text-[var(--text-primary)] border-[var(--border-control)]',
        accent:
          'bg-[var(--accent-bg)] text-[var(--accent-fg)] border-[var(--accent-border)]',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
