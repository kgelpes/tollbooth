"use client";

import { Badge } from "@tollbooth/ui/badge";
import { Button } from "@tollbooth/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@tollbooth/ui/card";
import { Input } from "@tollbooth/ui/components/input";
import { Label } from "@tollbooth/ui/components/label";
import { Progress } from "@tollbooth/ui/components/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@tollbooth/ui/components/select";
import {
	ArrowRight,
	Bot,
	CheckCircle,
	Code,
	Copy,
	ExternalLink,
	Shield,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";


interface AgentOnboardingProps {
	onComplete: () => void;
	onSkip: () => void;
	currentStep?: number;
}

export function AgentOnboarding({
	onComplete,
	onSkip,
	currentStep = 1,
}: AgentOnboardingProps) {
	const router = useRouter();
	const totalSteps = 4;
	const progress = (currentStep / totalSteps) * 100;

	const handleNext = () => {
		if (currentStep === totalSteps) {
			onComplete();
		} else {
			router.push(`/agent/onboarding?step=${currentStep + 1}`);
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			router.push(`/agent/onboarding?step=${currentStep - 1}`);
		}
	};

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<div className="space-y-6">
						<div className="text-center space-y-2">
							<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
								<Bot className="w-8 h-8 text-primary" />
							</div>
							<h2 className="text-2xl font-semibold">Agent Information</h2>
							<p className="text-muted-foreground">
								Tell us about your agent or bot
							</p>
						</div>

						<div className="space-y-4">
							<div className="space-y-2">
								<Label>Agent Name</Label>
								<Input placeholder="e.g., News Scraper Bot" defaultValue="" />
							</div>

							<div className="space-y-2">
								<Label>Agent Type</Label>
								<Select defaultValue="">
									<SelectTrigger>
										<SelectValue placeholder="Select agent type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="web-scraper">Web Scraper</SelectItem>
										<SelectItem value="ai-agent">AI Agent</SelectItem>
										<SelectItem value="api-client">API Client</SelectItem>
										<SelectItem value="crawler">Web Crawler</SelectItem>
										<SelectItem value="monitor">Site Monitor</SelectItem>
										<SelectItem value="research">Research Bot</SelectItem>
										<SelectItem value="other">Other</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="p-4 bg-muted/50 rounded-lg space-y-3">
								<h4 className="font-medium">What Tollbooth enables:</h4>
								<ul className="space-y-1 text-sm text-muted-foreground">
									<li>• Skip CAPTCHAs and rate limits</li>
									<li>• Access premium content automatically</li>
									<li>• No need for manual accounts or logins</li>
									<li>• Transparent, pay-per-use pricing</li>
								</ul>
							</div>
						</div>
					</div>
				);

			case 2:
				return (
					<div className="space-y-6">
						<div className="text-center space-y-2">
							<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto" />
							<h2 className="text-2xl font-semibold">Payment Setup</h2>
							<p className="text-muted-foreground">Configure payment options</p>
						</div>

						<div className="space-y-4">
							<div className="text-center space-y-4">
								<div className="p-6 border-2 border-dashed rounded-lg text-sm text-muted-foreground">
									Payment connector will appear here.
								</div>

								<div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-left">
									<h4 className="text-blue-700 dark:text-blue-300 mb-2 font-medium">
										About x402 Protocol
									</h4>
									<p className="text-sm text-blue-600 dark:text-blue-400">
										x402 is a new HTTP status code that allows websites to
										request payment for access. Tollbooth automatically handles
										these requests so your agents can continue working
										seamlessly.
									</p>
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
								<Shield className="w-8 h-8 text-primary" />
							</div>
							<h2 className="text-2xl font-semibold">Spending Controls</h2>
							<p className="text-muted-foreground">
								Set limits to control your agent's spending
							</p>
						</div>

						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Daily Limit (USDC)</Label>
									<Input
										type="number"
										step="0.01"
										placeholder="10.00"
										defaultValue="10.00"
									/>
								</div>

								<div className="space-y-2">
									<Label>Monthly Limit (USDC)</Label>
									<Input
										type="number"
										step="0.01"
										placeholder="200.00"
										defaultValue="200.00"
									/>
								</div>
							</div>

							<div className="space-y-3">
								<Label>Whitelisted Domains (Optional)</Label>
								<div className="flex gap-2">
									<Input placeholder="example.com" defaultValue="" />
								</div>
								<Button variant="outline" className="w-full">
									Add Domain
								</Button>
								<p className="text-sm text-muted-foreground">
									Only spend on these domains. Leave empty to allow all domains.
								</p>
							</div>

							<div className="p-4 bg-muted/50 rounded-lg space-y-3">
								<h4 className="font-medium">Recommended Limits</h4>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span>Light usage:</span>
										<span>5.00 USDC/day, 100 USDC/month</span>
									</div>
									<div className="flex justify-between">
										<span>Moderate usage:</span>
										<span>10.00 USDC/day, 200 USDC/month</span>
									</div>
									<div className="flex justify-between">
										<span>Heavy usage:</span>
										<span>50.00 USDC/day, 1000 USDC/month</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				);

			case 4: {
				const apiKey = "agent_demo123456789";
				const integrationCode = `import { TollboothClient } from '@tollbooth/client'

const client = new TollboothClient({
  apiKey: '${apiKey}',
  autoPayment: true,
  maxFeePerRequest: 1.00 // USDC
})

// Use with any HTTP client
const response = await client.fetch('https://example.com/api/data')

// Or wrap your existing requests
const wrappedAxios = client.wrap(axios)
const data = await wrappedAxios.get('https://example.com/api/data')`;

				return (
					<div className="space-y-6">
						<div className="text-center space-y-2">
							<div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
								<CheckCircle className="w-8 h-8 text-green-600" />
							</div>
							<h2 className="text-2xl font-semibold">Integration Ready</h2>
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
								<Label>Integration Example</Label>
								<div className="relative">
									<pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
										<code>{integrationCode}</code>
									</pre>
									<Button
										variant="outline"
										size="sm"
										className="absolute top-2 right-2"
									>
										<Copy className="w-4 h-4" />
									</Button>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
								<Button variant="outline" asChild>
									<Link href="/docs">
										<ExternalLink className="w-4 h-4 mr-2" />
										Documentation
									</Link>
								</Button>
								<Button variant="outline" asChild>
									<Link href="/sdk">
										<Code className="w-4 h-4 mr-2" />
										SDK Download
									</Link>
								</Button>
							</div>

							<div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
								<h4 className="text-green-700 dark:text-green-300 mb-2 font-medium">
									Next Steps
								</h4>
								<ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
									<li>• Install the Tollbooth SDK</li>
									<li>• Replace your HTTP client calls</li>
									<li>• Test with a small request</li>
									<li>• Monitor usage in the dashboard</li>
								</ul>
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
						<Badge variant="outline">Agent Setup</Badge>
						<Badge variant="secondary">
							{currentStep} of {totalSteps}
						</Badge>
					</div>
					<Progress value={progress} className="mb-4" />
					<CardTitle>Welcome to Tollbooth</CardTitle>
					<CardDescription>
						Let's get your agent set up to seamlessly pay for content and API
						access
					</CardDescription>
				</CardHeader>

				<CardContent>
					{renderStep()}

					<div className="flex justify-between mt-8">
						<div className="flex gap-2">
							{currentStep === 1 ? (
								<Button variant="outline" onClick={onSkip}>
									Back to Role Selection
								</Button>
							) : (
								<Button variant="outline" onClick={handleBack}>
									Back
								</Button>
							)}
						</div>

						<Button onClick={handleNext}>
							{currentStep === totalSteps ? (
								"Complete Setup"
							) : (
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
