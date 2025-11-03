import * as React from "react";
import { cn } from "@/lib/utils";

const Select = ({ value, onValueChange, children, className }: any) => (
  <select
    value={value}
    onChange={(e) => onValueChange?.(e.target.value)}
    className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className)}
  >
    {children}
  </select>
);

const SelectTrigger = Select;
const SelectValue = ({ children }: any) => <>{children}</>;
const SelectContent = ({ children }: any) => <>{children}</>;
const SelectItem = ({ value, children }: any) => <option value={value}>{children}</option>;

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
