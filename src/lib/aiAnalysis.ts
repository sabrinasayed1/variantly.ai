import { ComparisonContext, AISummary, ImpactData, MetricProjection } from '@/types/comparison';

const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-variants`;

export interface AnalysisResult {
  featuresA: VisionFeatures;
  featuresB: VisionFeatures;
  scoresA: HeuristicScores;
  scoresB: HeuristicScores;
  analysis: ReasoningAnalysis;
  disclaimer: string;
}

export interface VisionFeatures {
  components: string[];
  hierarchy: string[];
  ctaCount: number;
  textBlocks: number;
  tapTargets: number;
  flowSteps: number;
  dominantColors: string[];
  clutterScore: number;
  readabilityScore: number;
  primaryCTAAboveFold: boolean;
  visualHierarchyStrong: boolean;
}

export interface HeuristicScores {
  predictedCTR: number;
  predictedConversion: number;
  predictedDropoff: number;
  predictedTimeToAct: number;
  predictedTaskCompletion: number;
  usabilityRisks: string[];
}

export interface ReasoningAnalysis {
  summaryA: string;
  summaryB: string;
  differences: string[];
  projectedMetrics: {
    ctrA: string;
    ctrB: string;
    conversionA: string;
    conversionB: string;
    dropoffA: string;
    dropoffB: string;
    completionA: string;
    completionB: string;
    timeToActA: string;
    timeToActB: string;
    confidence: 'High' | 'Medium' | 'Low';
  };
  rationale: string;
  risks: string[];
  recommendation: string;
}

export async function analyzeVariants(
  imageA: string,
  imageB: string,
  context?: ComparisonContext
): Promise<AnalysisResult> {
  const response = await fetch(ANALYZE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageA,
      imageB,
      context,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    if (response.status === 402) {
      throw new Error('AI credits exhausted. Please add credits to continue.');
    }
    const error = await response.json();
    throw new Error(error.error || 'Analysis failed');
  }

  return response.json();
}

// Convert AI analysis result to the format expected by the app
export function convertToAISummary(analysis: ReasoningAnalysis): AISummary {
  return {
    summaryA: analysis.summaryA,
    summaryB: analysis.summaryB,
    differences: analysis.differences,
  };
}

export function convertToImpactData(analysis: ReasoningAnalysis): ImpactData {
  const metrics = analysis.projectedMetrics;
  
  const parsePercent = (val: string) => parseFloat(val.replace('%', ''));
  
  const metricsTable: MetricProjection[] = [
    {
      metric: 'Click-Through Rate (CTR)',
      variantA: metrics.ctrA,
      variantB: metrics.ctrB,
      winner: parsePercent(metrics.ctrA) > parsePercent(metrics.ctrB) ? 'A' : 'B',
      confidence: metrics.confidence,
    },
    {
      metric: 'Conversion Rate',
      variantA: metrics.conversionA,
      variantB: metrics.conversionB,
      winner: parsePercent(metrics.conversionA) > parsePercent(metrics.conversionB) ? 'A' : 'B',
      confidence: metrics.confidence,
    },
    {
      metric: 'Drop-off %',
      variantA: metrics.dropoffA,
      variantB: metrics.dropoffB,
      winner: parsePercent(metrics.dropoffA) < parsePercent(metrics.dropoffB) ? 'A' : 'B',
      confidence: metrics.confidence,
    },
    {
      metric: 'Task Completion',
      variantA: metrics.completionA,
      variantB: metrics.completionB,
      winner: parsePercent(metrics.completionA) > parsePercent(metrics.completionB) ? 'A' : 'B',
      confidence: metrics.confidence,
    },
    {
      metric: 'Avg. Time-to-Action',
      variantA: metrics.timeToActA,
      variantB: metrics.timeToActB,
      winner: parseFloat(metrics.timeToActA) < parseFloat(metrics.timeToActB) ? 'A' : 'B',
      confidence: metrics.confidence,
    },
  ];

  // Build comprehensive rationale
  const riskSection = analysis.risks.length > 0 
    ? `\n\n**UX Risks to Consider:**\n${analysis.risks.map(r => `- ${r}`).join('\n')}`
    : '';

  const rationale = `${analysis.rationale}${riskSection}\n\n**Recommendation:** ${analysis.recommendation}\n\n**Confidence Level: ${metrics.confidence}**`;

  return {
    metricsTable,
    rationale,
    confidence: metrics.confidence,
  };
}
