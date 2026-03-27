import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
        secondary: 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
});
Button.displayName = 'Button';

const Card = ({ className, children, ...props }) => {
    return (
        <div 
            className={cn('bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden', className)} 
            {...props}
        >
            {children}
        </div>
    );
};

const Input = React.forwardRef(({ className, label, error, ...props }, ref) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
            <input
                ref={ref}
                className={cn(
                    'flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50',
                    error && 'border-red-500 focus:ring-red-500',
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
});
Input.displayName = 'Input';

export { Button, Card, Input };
