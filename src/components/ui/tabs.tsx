import * as React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext<{ value: string; onValueChange: (value: string) => void } | undefined>(undefined);

const Tabs = ({ value, onValueChange, children, ...props }: any) => (
  <TabsContext.Provider value={{ value, onValueChange }}>
    <div {...props}>{children}</div>
  </TabsContext.Provider>
);

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1", className)} {...props} />
  )
);
TabsList.displayName = "TabsList";

const TabsTrigger = ({ value, children, className, ...props }: any) => {
  const context = React.useContext(TabsContext);
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        context?.value === value && "bg-background text-foreground shadow-sm",
        className
      )}
      onClick={() => context?.onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, className }: any) => {
  const context = React.useContext(TabsContext);
  if (context?.value !== value) return null;
  return <div className={className}>{children}</div>;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
