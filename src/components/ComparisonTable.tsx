import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface ModelComparison {
  model: string;
  price: number;
  computationTime: number;
}

interface ComparisonTableProps {
  comparisons: ModelComparison[];
}

export default function ComparisonTable({ comparisons }: ComparisonTableProps) {
  if (comparisons.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Model Comparison</h2>
        <Badge variant="secondary">{comparisons.length} models</Badge>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Model</TableHead>
            <TableHead className="text-right">Price ($)</TableHead>
            <TableHead className="text-right">Time (ms)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comparisons.map((comp) => (
            <TableRow key={comp.model}>
              <TableCell className="font-medium">{comp.model}</TableCell>
              <TableCell className="text-right font-mono">${comp.price.toFixed(4)}</TableCell>
              <TableCell className="text-right font-mono">{comp.computationTime.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
