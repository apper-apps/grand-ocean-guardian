import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = forwardRef(({
  className,
  variant = "primary",
  size = "default",
  children,
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  ...props
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-target";

  const variants = {
    primary: "bg-coral-500 text-white hover:bg-coral-600 focus:ring-coral-500 hover:scale-105 active:scale-95 shadow-card hover:shadow-elevated",
    secondary: "bg-seafoam-500 text-white hover:bg-seafoam-600 focus:ring-seafoam-500 hover:scale-105 active:scale-95 shadow-card hover:shadow-elevated",
    outline: "border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white focus:ring-primary-500 hover:scale-105 active:scale-95",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500 hover:scale-105 active:scale-95",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 hover:scale-105 active:scale-95 shadow-card hover:shadow-elevated",
    share: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 focus:ring-purple-500 hover:scale-105 active:scale-95 shadow-card hover:shadow-elevated"
  };

  const sizes = {
    sm: "h-9 px-3 text-sm gap-1.5",
    default: "h-12 px-6 text-base gap-2",
    lg: "h-14 px-8 text-lg gap-2.5"
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        isDisabled && "transform-none hover:scale-100",
        className
      )}
      disabled={isDisabled}
      ref={ref}
      {...props}
    >
      {loading && (
        <ApperIcon name="Loader2" className="animate-spin" size={size === "sm" ? 14 : size === "lg" ? 20 : 16} />
      )}
      
      {!loading && icon && iconPosition === "left" && (
        <ApperIcon name={icon} size={size === "sm" ? 14 : size === "lg" ? 20 : 16} />
      )}
      
      {children}
      
      {!loading && icon && iconPosition === "right" && (
        <ApperIcon name={icon} size={size === "sm" ? 14 : size === "lg" ? 20 : 16} />
      )}
    </button>
  );
});

Button.displayName = "Button";

export default Button;