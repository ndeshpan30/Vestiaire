import React, { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      isLoading = false,
      variant = "primary",
      disabled,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    // Variant Styles
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      rounded-md px-4 py-2.5
      text-sm font-semibold
      shadow-sm transition-all duration-150 ease-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B1422] focus-visible:ring-offset-2
      disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:translate-y-0
    `;

    const variantStyles = {
      primary: `
        bg-[#5B1422] text-white
        hover:bg-[#450F1A] hover:shadow-md hover:-translate-y-px
        active:translate-y-0 active:bg-[#320B13]
      `,
      secondary: `
        bg-neutral-900 text-white
        hover:bg-neutral-800 hover:shadow-md hover:-translate-y-px
        active:translate-y-0 active:bg-neutral-950
      `,
      outline: `
        bg-white text-neutral-900 border border-neutral-200
        hover:bg-neutral-50 hover:border-[#5B1422] hover:text-[#5B1422] hover:-translate-y-px
        active:translate-y-0 active:bg-neutral-100
      `,
      ghost: `
        bg-transparent text-neutral-700
        hover:bg-neutral-100 hover:text-neutral-900
        active:bg-neutral-200
      `
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin text-current"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        <span>{isLoading ? "Saving…" : children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";
