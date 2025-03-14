import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300',
          {
            'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 dark:active:bg-primary-700':
              variant === 'default',
            'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 dark:active:bg-red-700':
              variant === 'destructive',
            'border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:active:bg-gray-700':
              variant === 'outline',
            'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-700 dark:active:bg-gray-600':
              variant === 'secondary',
            'hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:active:bg-gray-700':
              variant === 'ghost',
            'text-primary-500 underline-offset-4 hover:underline dark:text-primary-400':
              variant === 'link',
          },
          {
            'h-10 px-4 py-2': size === 'default',
            'h-9 rounded-md px-3': size === 'sm',
            'h-11 rounded-md px-8': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
