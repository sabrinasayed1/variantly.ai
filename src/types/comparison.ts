export interface VariantData {
  id: string;
  imageUrl?: string;
  imageFile?: File;
  notes?: string;
}

export interface ComparisonContext {
  userSegment: string;
  productStage: string;
  assumptions: string;
  painPoints: string;
  primaryMetric: string;
  userMindset?: string;
}

export interface AISummary {
  summaryA: string;
  summaryB: string;
  differences: string[];
}

export interface MetricProjection {
  metric: string;
  variantA: string;
  variantB: string;
  winner: 'A' | 'B' | 'Tie';
  confidence: 'High' | 'Medium' | 'Low';
}

export interface ImpactData {
  metricsTable: MetricProjection[];
  rationale: string;
  confidence: 'High' | 'Medium' | 'Low';
}

export interface Comparison {
  id: string;
  variantA: VariantData;
  variantB: VariantData;
  context: ComparisonContext;
  aiSummary?: AISummary;
  impact?: ImpactData;
  createdAt: string;
}
