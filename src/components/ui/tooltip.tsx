import * as React from "react";
import { cn } from "@/lib/utils";

const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const Tooltip = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  return (
    <div 
      className="relative inline-block" 
      onMouseEnter={() => setIsVisible(true)} 
      onMouseLeave={() => setIsVisible(false)}
    >
      {React.Children.map(children, child =>
        React.isValidElement(child) ? React.cloneElement(child, { isVisible } as any) : child
      )}
    </div>
  );
};

const TooltipTrigger = React.forwardRef<HTMLDivElement, any>(
  ({ children, asChild, isVisible, ...props }, ref) => (
    <div ref={ref} {...props}>{children}</div>
  )
);
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef<HTMLDivElement, any>(
  ({ children, className, isVisible, side = "top", ...props }, ref) =>
    isVisible ? (
      <div 
        ref={ref}
        className={cn(
          "absolute z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95",
          side === "left" && "right-full mr-2",
          side === "right" && "left-full ml-2", 
          side === "top" && "bottom-full mb-2",
          side === "bottom" && "top-full mt-2",
          className
        )} 
        {...props}
      >
        {children}
      </div>
    ) : null
);
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
