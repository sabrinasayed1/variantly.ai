import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComparisonContext } from '@/types/comparison';

interface ContextStepProps {
  context: ComparisonContext;
  onUpdate: (context: ComparisonContext) => void;
}

export default function ContextStep({ context, onUpdate }: ContextStepProps) {
  const updateField = (field: keyof ComparisonContext, value: string) => {
    onUpdate({ ...context, [field]: value });
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Add Context</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          The more context you provide, the smarter the predictions. Help us understand your users and goals.
        </p>
      </div>

      <Card className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="userSegment">Target User Segment *</Label>
            <Input
              id="userSegment"
              placeholder="e.g., First-time visitors, Power users"
              value={context.userSegment}
              onChange={(e) => updateField('userSegment', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Who will be using this interface?</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productStage">Product Stage *</Label>
            <Select value={context.productStage} onValueChange={(value) => updateField('productStage', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MVP">MVP / Early Stage</SelectItem>
                <SelectItem value="Growth">Growth Stage</SelectItem>
                <SelectItem value="Established">Established Product</SelectItem>
                <SelectItem value="Mature">Mature / Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Current phase of your product</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="userMindset">User Mindset</Label>
            <Select value={context.userMindset} onValueChange={(value) => updateField('userMindset', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select mindset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Browsing">Browsing / Exploring</SelectItem>
                <SelectItem value="Purchasing">Ready to Purchase</SelectItem>
                <SelectItem value="Onboarding">Onboarding / Learning</SelectItem>
                <SelectItem value="Task-focused">Task-focused</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">What state of mind are users in?</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryMetric">Primary Success Metric *</Label>
            <Select value={context.primaryMetric} onValueChange={(value) => updateField('primaryMetric', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CTR">Click-Through Rate</SelectItem>
                <SelectItem value="Conversion Rate">Conversion Rate</SelectItem>
                <SelectItem value="Task Completion">Task Completion</SelectItem>
                <SelectItem value="Engagement">User Engagement</SelectItem>
                <SelectItem value="Time on Task">Time on Task</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">What are you optimizing for?</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assumptions">Core UX Assumptions</Label>
          <Textarea
            id="assumptions"
            placeholder="e.g., Users prefer visual hierarchy over dense information, Trust signals are critical for conversion"
            value={context.assumptions}
            onChange={(e) => updateField('assumptions', e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">What UX principles are you betting on?</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="painPoints">Known User Pain Points</Label>
          <Textarea
            id="painPoints"
            placeholder="e.g., Users struggle with finding pricing information, Too many steps in checkout flow"
            value={context.painPoints}
            onChange={(e) => updateField('painPoints', e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">What problems are you trying to solve?</p>
        </div>

        <div className="rounded-lg bg-accent/10 border border-accent/20 p-4">
          <p className="text-sm text-accent-foreground">
            💡 <span className="font-semibold">Tip:</span> More detailed context leads to more accurate predictions. 
            Don't worry about being perfect—directional insights are still valuable!
          </p>
        </div>
      </Card>
    </div>
  );
}
