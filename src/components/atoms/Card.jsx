import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ className, children, hover = false, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border bg-white shadow-card",
        hover && "hover:shadow-elevated transition-shadow duration-200 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;