import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = forwardRef(({
  className,
  variant = "default",
  size = "md",
  disabled,
  children,
  ...props
}, ref) => {
  const variants = {
    default: "bg-coral-500 text-white hover:bg-coral-600 focus:ring-coral-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500",
    secondary: "bg-seafoam-500 text-white hover:bg-seafoam-600 focus:ring-seafoam-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-primary-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-card hover:shadow-elevated",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;