import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export type PricingModel = "black-scholes" | "monte-carlo" | "binomial";

interface ModelSelectorProps {
  selectedModel: PricingModel;
  onModelChange: (model: PricingModel) => void;
  children?: React.ReactNode;
}

const modelDescriptions = {
  "black-scholes": {
    name: "Black-Scholes-Merton",
    description: "Analytical solution for European options using closed-form equations. Fastest calculation with exact mathematical precision.",
  },
  "monte-carlo": {
    name: "Monte Carlo Simulation",
    description: "Stochastic simulation using random price paths. Highly flexible for complex payoffs and path-dependent options.",
  },
  "binomial": {
    name: "Binomial Tree",
    description: "Discrete-time model building a lattice of possible prices. Can handle American options with early exercise.",
  },
};

export default function ModelSelector({ selectedModel, onModelChange, children }: ModelSelectorProps) {
  return (
    <Tabs value={selectedModel} onValueChange={(value) => onModelChange(value as PricingModel)}>
      <Card className="p-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="black-scholes">Black-Scholes</TabsTrigger>
          <TabsTrigger value="monte-carlo">Monte Carlo</TabsTrigger>
          <TabsTrigger value="binomial">Binomial Tree</TabsTrigger>
        </TabsList>
      </Card>

      <div className="mt-4">
        {Object.entries(modelDescriptions).map(([model, info]) => (
          <TabsContent key={model} value={model} className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold text-lg mb-1">{info.name}</h3>
              <p className="text-sm text-muted-foreground">{info.description}</p>
            </Card>
            {children}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
