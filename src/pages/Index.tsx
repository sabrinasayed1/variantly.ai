import { Link } from 'react-router-dom';
import { Plus, TrendingUp, Zap, Shield, ArrowRight, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getComparisons } from '@/lib/storage';
import { useState, useEffect } from 'react';
import { Comparison } from '@/types/comparison';

const Index = () => {
  const [comparisons, setComparisons] = useState<Comparison[]>([]);

  useEffect(() => {
    setComparisons(getComparisons());
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-subtle border-b">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              AI-Powered Design Analysis
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight">
              Ship with Confidence.
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Skip the Guesswork.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              For Product Managers & Designers who don't have time for lengthy A/B tests. 
              Get AI-powered impact projections in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg gap-2 shadow-lg">
                <Link to="/compare">
                  <Plus className="w-5 h-5" />
                  Start Comparison
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg gap-2">
                <a href="#features">
                  Learn More
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">Why ImpactCompare?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Make data-informed design decisions without waiting weeks for test results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Get AI-powered insights in minutes, not weeks. Upload your designs and receive 
                comprehensive analysis instantly.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Impact Projections</h3>
              <p className="text-muted-foreground">
                See predicted impact on CTR, conversion rates, drop-off, and more. 
                Make informed decisions with confidence scores.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-success/20 flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-success" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Risk-Free Validation</h3>
              <p className="text-muted-foreground">
                Identify potential UX issues before shipping. Get directional insights 
                to validate your design hypotheses.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Comparisons */}
      {comparisons.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Your Comparisons</h2>
                <p className="text-muted-foreground">Recent design variant analyses</p>
              </div>
              <Button asChild variant="outline">
                <Link to="/compare">
                  <Plus className="w-4 h-4 mr-2" />
                  New Comparison
                </Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comparisons.slice(0, 6).map((comparison) => (
                <Card key={comparison.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 truncate">
                        Comparison #{comparison.id.slice(-6)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(comparison.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Stage:</span>
                      <span className="font-medium">{comparison.context.productStage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Metric:</span>
                      <span className="font-medium">{comparison.context.primaryMetric}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to make better design decisions?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Start comparing your design variants and get AI-powered insights today
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg gap-2 shadow-xl">
            <Link to="/compare">
              <Plus className="w-5 h-5" />
              Start Your First Comparison
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
