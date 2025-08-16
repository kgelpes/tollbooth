"use client";

import { Badge } from "@tollbooth/ui/badge";
import { Button } from "@tollbooth/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tollbooth/ui/card";
import { Input } from "@tollbooth/ui/components/input";
import { Label } from "@tollbooth/ui/components/label";
import { Progress } from "@tollbooth/ui/components/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@tollbooth/ui/components/select";
import { Textarea } from "@tollbooth/ui/components/textarea";
import { 
  ArrowRight, 
  CheckCircle, 
  Copy, 
  DollarSign, 
  ExternalLink, 
  Globe, 
  Users 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PublisherOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
  currentStep?: number;
}

export function PublisherOnboarding({ 
  onComplete, 
  onSkip, 
  currentStep = 1 
}: PublisherOnboardingProps) {
  const router = useRouter();
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep === totalSteps) {
      onComplete();
    } else {
      router.push(`/publisher/onboarding?step=${currentStep + 1}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      router.push(`/publisher/onboarding?step=${currentStep - 1}`);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">Site Information</h2>
              <p className="text-muted-foreground">
                Let's start by setting up your site details
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Site Name</Label>
                <Input
                  placeholder="e.g., My News Site"
                  defaultValue=""
                />
              </div>
              
              <div className="space-y-2">
                <Label>Site URL</Label>
                <Input
                  placeholder="https://example.com"
                  defaultValue=""
                />
              </div>
              
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  placeholder="Brief description of your site or content"
                  defaultValue=""
                />
              </div>
              
              <div className="space-y-2">
                <Label>Category</Label>
                <Select defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="news">News & Media</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="api">API Service</SelectItem>
                    <SelectItem value="content">Content Platform</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">Payment Configuration</h2>
              <p className="text-muted-foreground">
                Set your base fee and payment rules
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Base Fee (ETH)</Label>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="0.001"
                  defaultValue="0.001"
                />
                <p className="text-sm text-muted-foreground">
                  This is the default fee charged for automated requests
                </p>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <h4 className="font-medium">Fee Examples</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>News articles:</span>
                    <span>0.001 - 0.005 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API endpoints:</span>
                    <span>0.0001 - 0.001 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Premium content:</span>
                    <span>0.005 - 0.01 ETH</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">Revenue Splits</h2>
              <p className="text-muted-foreground">
                Configure how revenue is distributed
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Recipient 1</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-2">
                    <Label>Wallet Address</Label>
                    <Input
                      placeholder="0x..."
                      defaultValue=""
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Percentage</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      defaultValue="100"
                    />
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                Add Recipient
              </Button>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Tip:</strong> You can add multiple recipients for revenue sharing (e.g., 70% outlet, 30% journalist)
                </p>
              </div>
            </div>
          </div>
        );

      case 4: {
        const apiKey = 'tollbooth_demo123456789';
        const integrationCode = `<!-- Add this to your site's <head> -->
<script src="https://tollbooth.dev/js/integration.js"></script>
<script>
  Tollbooth.init({
    apiKey: "${apiKey}",
    domain: "https://example.com",
    baseFee: "0.001"
  });
</script>`;

        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold">Integration Setup</h2>
              <p className="text-muted-foreground">
                Your API key and integration code
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input value={apiKey} readOnly />
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Integration Code</Label>
                <div className="relative">
                  <Textarea
                    value={integrationCode}
                    readOnly
                    className="font-mono text-sm min-h-[120px]"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/docs">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Documentation
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/test">
                    Test Integration
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline">Publisher Setup</Badge>
            <Badge variant="secondary">{currentStep} of {totalSteps}</Badge>
          </div>
          <Progress value={progress} className="mb-4" />
          <CardTitle>Welcome to Tollbooth</CardTitle>
          <CardDescription>
            Let's get your site set up to start earning revenue from automated requests
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {renderStep()}
          
          <div className="flex justify-between mt-8">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              <Button variant="ghost" onClick={onSkip}>
                Skip Setup
              </Button>
            </div>
            
            <Button onClick={handleNext}>
              {currentStep === totalSteps ? 'Complete Setup' : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
