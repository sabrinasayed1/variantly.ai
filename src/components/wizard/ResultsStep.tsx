import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Copy, TrendingUp, TrendingDown, Minus, Sparkles, AlertTriangle, Brain } from 'lucide-react';
import { Comparison, VariantData } from '@/types/comparison';
import { getComparison } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ResultsStepProps {
  comparisonId: string;
  variantA: VariantData;
  variantB: VariantData;
}

export default function ResultsStep({ comparisonId, variantA, variantB }: ResultsStepProps) {
  const { toast } = useToast();
  const [comparison, setComparison] = useState<Comparison | null>(null);

  useEffect(() => {
    const data = getComparison(comparisonId);
    if (data) {
      setComparison(data);
    }
  }, [comparisonId]);

  const handleExport = () => {
    if (!comparison) return;

    const exportText = `
ImpactCompare Analysis Report
Generated: ${new Date(comparison.createdAt).toLocaleString()}

=== VARIANT SUMMARIES ===

Variant A:
${comparison.aiSummary?.summaryA}

Variant B:
${comparison.aiSummary?.summaryB}

=== KEY DIFFERENCES ===
${comparison.aiSummary?.differences.map((d, i) => `${i + 1}. ${d}`).join('\n')}

=== IMPACT PROJECTIONS ===
${comparison.impact?.metricsTable.map(m => 
  `${m.metric}: A=${m.variantA} vs B=${m.variantB} (Winner: ${m.winner}, Confidence: ${m.confidence})`
).join('\n')}

=== RATIONALE ===
${comparison.impact?.rationale}

---
This projection combines visual analysis + heuristics + LLM reasoning.
Metrics are directional, not absolute.
`;

    navigator.clipboard.writeText(exportText);
    toast({
      title: 'Copied to clipboard',
      description: 'Analysis report has been copied to your clipboard',
    });
  };

  if (!comparison?.aiSummary || !comparison?.impact) {
    return <div className="text-center py-12">Loading analysis...</div>;
  }

  const getWinnerIcon = (winner: string) => {
    if (winner === 'A' || winner === 'B') return <TrendingUp className="w-4 h-4 text-success" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getConfidenceBadge = (confidence: string) => {
    const variants = {
      High: 'default',
      Medium: 'secondary',
      Low: 'outline',
    };
    return (
      <Badge variant={variants[confidence as keyof typeof variants] as any}>
        {confidence}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">AI Analysis Complete</h2>
        <p className="text-muted-foreground">Here's what we discovered about your variants</p>
      </div>

      {/* Analysis Method Badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-sm">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-primary font-medium">Vision Analysis + Heuristics + LLM Reasoning</span>
        </div>
      </div>

      {/* Variant Summaries */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-4">
            {variantA.imageUrl && (
              <img src={variantA.imageUrl} alt="Variant A" className="w-24 h-24 object-cover rounded-lg" />
            )}
            <div>
              <h3 className="font-bold text-lg mb-1">Variant A</h3>
              <p className="text-sm text-muted-foreground">AI Understanding</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed">{comparison.aiSummary.summaryA}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4 mb-4">
            {variantB.imageUrl && (
              <img src={variantB.imageUrl} alt="Variant B" className="w-24 h-24 object-cover rounded-lg" />
            )}
            <div>
              <h3 className="font-bold text-lg mb-1">Variant B</h3>
              <p className="text-sm text-muted-foreground">AI Understanding</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed">{comparison.aiSummary.summaryB}</p>
        </Card>
      </div>

      {/* Key Differences */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Key Differences Detected</h3>
        <ul className="space-y-3">
          {comparison.aiSummary.differences.map((diff, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-accent-foreground">{index + 1}</span>
              </div>
              <span className="text-sm">{diff}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Impact Projections */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Impact Projections</h3>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead className="text-center">Variant A</TableHead>
                <TableHead className="text-center">Variant B</TableHead>
                <TableHead className="text-center">Winner</TableHead>
                <TableHead className="text-center">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparison.impact.metricsTable.map((metric, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{metric.metric}</TableCell>
                  <TableCell className="text-center font-mono">{metric.variantA}</TableCell>
                  <TableCell className="text-center font-mono">{metric.variantB}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getWinnerIcon(metric.winner)}
                      <span className="font-semibold">{metric.winner}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {getConfidenceBadge(metric.confidence)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Rationale */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Analysis Rationale</h3>
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-line text-sm leading-relaxed">{comparison.impact.rationale}</div>
        </div>
      </Card>

      {/* Disclaimer */}
      <Card className="p-6 border-warning/20 bg-warning/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm mb-1">Important Note</h4>
            <p className="text-sm text-muted-foreground">
              This projection combines <strong>visual analysis + heuristics + LLM reasoning</strong>. 
              Metrics are <strong>directional, not absolute</strong>. Consider validating with qualitative user testing 
              or A/B tests for high-stakes decisions.
            </p>
          </div>
        </div>
      </Card>

      {/* Export Actions */}
      <div className="flex justify-center gap-4">
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Copy className="w-4 h-4" />
          Copy Report
        </Button>
        <Button onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          Export Summary
        </Button>
      </div>
    </div>
  );
}
