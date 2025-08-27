import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Input = forwardRef(({
  className,
  type = "text",
  error,
  ...props
}, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base ring-offset-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200",
        error && "border-red-500 focus:ring-red-500",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;