import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileText, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

interface ReportData {
  parameters: any;
  result: any;
  greeks: any;
  timestamp: Date;
}

export default function PDFReportGenerator({ data }: { data: ReportData }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    toast.loading("Generating PDF report...", { id: "pdf-gen" });

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 40, "F");
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("Options Pricing Report", pageWidth / 2, 20, { align: "center" });
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: "center" });

      yPosition = 50;

      // Reset text color
      pdf.setTextColor(0, 0, 0);

      // Parameters Section
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Input Parameters", 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      const params = [
        `Spot Price: $${data.parameters.spotPrice}`,
        `Strike Price: $${data.parameters.strikePrice}`,
        `Volatility: ${(data.parameters.volatility * 100).toFixed(1)}%`,
        `Time to Maturity: ${data.parameters.timeToMaturity} years`,
        `Risk-Free Rate: ${(data.parameters.riskFreeRate * 100).toFixed(2)}%`,
        `Option Type: ${data.parameters.optionType.toUpperCase()}`,
      ];

      params.forEach((param) => {
        pdf.text(param, 25, yPosition);
        yPosition += 7;
      });

      yPosition += 5;

      // Results Section
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Pricing Results", 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Model: ${data.result.model}`, 25, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Option Price: $${data.result.price.toFixed(4)}`, 25, yPosition);
      yPosition += 12;

      // Greeks Section
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("The Greeks", 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      const greeks = [
        `Delta (Δ): ${data.greeks.delta.toFixed(6)}`,
        `Gamma (Γ): ${data.greeks.gamma.toFixed(6)}`,
        `Theta (Θ): ${data.greeks.theta.toFixed(6)}`,
        `Vega (ν): ${data.greeks.vega.toFixed(6)}`,
        `Rho (ρ): ${data.greeks.rho.toFixed(6)}`,
      ];

      greeks.forEach((greek) => {
        pdf.text(greek, 25, yPosition);
        yPosition += 7;
      });

      yPosition += 10;

      // Risk Disclosure
      pdf.setFillColor(255, 243, 224);
      pdf.rect(15, yPosition, pageWidth - 30, 30, "F");
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("Risk Disclosure", 20, yPosition + 8);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      const disclaimer = "Options trading involves substantial risk. Past performance does not guarantee future results. This report is for informational purposes only and should not be considered as investment advice.";
      const lines = pdf.splitTextToSize(disclaimer, pageWidth - 40);
      pdf.text(lines, 20, yPosition + 15);

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text("Advanced Options Pricing Engine • Institutional-Grade Analytics", pageWidth / 2, pageHeight - 10, { align: "center" });

      // Save PDF
      pdf.save(`options-report-${Date.now()}.pdf`);
      
      toast.success("PDF report generated successfully!", { id: "pdf-gen" });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF", { id: "pdf-gen" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating || !data.result}
      variant="outline"
      className="gap-2"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      Generate PDF Report
    </Button>
  );
}
