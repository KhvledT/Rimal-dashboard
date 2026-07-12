import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils.js";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  children: ReactNode;
}

export const Button = ({
  variant = "primary",
  isLoading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  const baseStyles =
    "relative inline-flex items-center justify-center rounded text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none tracking-wide active:scale-[0.98] overflow-hidden";

  const variants = {
    primary:
      "bg-burgundy hover:bg-burgundy-deep text-white shadow-sm border border-burgundy focus-visible:ring-burgundy focus-visible:ring-offset-sand",
    secondary:
      "bg-gold hover:bg-gold-light text-white shadow-sm border border-gold focus-visible:ring-gold focus-visible:ring-offset-sand",
    outline:
      "bg-transparent hover:bg-gold hover:text-white border border-gold text-gold focus-visible:ring-gold focus-visible:ring-offset-sand",
    ghost:
      "bg-transparent hover:bg-sand text-navy focus-visible:ring-navy focus-visible:ring-offset-sand",
    danger:
      "bg-red-600 hover:bg-red-700 text-white shadow-sm border border-red-600 focus-visible:ring-red-600 focus-visible:ring-offset-sand",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      <span className={cn("inline-flex p-2 items-center gap-2 transition-opacity duration-200", isLoading && "opacity-0 select-none pointer-events-none")}>
        {children}
      </span>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center gap-2 text-current">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="sr-only">Processing...</span>
        </span>
      )}
    </button>
  );
};

export default Button;
