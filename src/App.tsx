import { TooltipProvider } from "@/components/ui/tooltip";
import EnhancedDashboard from "@/pages/EnhancedDashboard";

export default function App() {
  return (
    <TooltipProvider>
      <EnhancedDashboard />
    </TooltipProvider>
  );
}
