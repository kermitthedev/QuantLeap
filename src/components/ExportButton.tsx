import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { ExcelExporter } from '@/lib/excelExporter';
import toast from 'react-hot-toast';

interface Props {
  data: any;
  greeks?: any;
  higherOrderGreeks?: any;
}

export default function ExportButton({ data, greeks, higherOrderGreeks }: Props) {
  const handleExportGreeks = () => {
    try {
      if (!greeks) {
        toast.error('No Greeks data to export');
        return;
      }
      ExcelExporter.exportGreeksTable(greeks, higherOrderGreeks);
      toast.success('Greeks exported to Excel!');
    } catch (error) {
      toast.error('Failed to export to Excel');
      console.error(error);
    }
  };

  const handleExportFull = () => {
    try {
      ExcelExporter.exportComprehensiveReport(data);
      toast.success('Full report exported to Excel!');
    } catch (error) {
      toast.error('Failed to export to Excel');
      console.error(error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="default" className="gap-2">
          <Download className="h-4 w-4" />
          Export Excel
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleExportGreeks}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export Greeks
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportFull}>
          <FileText className="h-4 w-4 mr-2" />
          Export Full Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
