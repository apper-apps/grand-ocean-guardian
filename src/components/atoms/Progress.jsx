import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Progress = forwardRef(({
  className,
  value = 0,
  max = 100,
  size = "default",
  variant = "primary",
  ...props
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: "h-1",
    default: "h-2",
    lg: "h-3"
  };

  const variants = {
    primary: "bg-primary-500",
    secondary: "bg-gray-500",
    success: "bg-green-500",
    coral: "bg-coral-500",
    seafoam: "bg-seafoam-500"
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-gray-200",
        sizes[size],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full transition-all duration-300 ease-out rounded-full",
          variants[variant]
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
});

Progress.displayName = "Progress";

export default Progress;