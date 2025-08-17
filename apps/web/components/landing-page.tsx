"use client";
import { Badge } from "@tollbooth/ui/badge";
import { Button } from "@tollbooth/ui/button";
import { Card, CardContent, CardHeader } from "@tollbooth/ui/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@tollbooth/ui/components/tabs";
import {
	ArrowRight,
	Bot,
	Building2,
	Check,
	CheckCircle,
	Code,
	Copy,
	Globe,
	Layers,
	Lock,
	Server,
	Shield,
	Star,
	Terminal,
	TrendingUp,
	Users,
	Wallet,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "../lib/authClient";
import { SiweSignInButton } from "./siwe-sign-in-button";

interface LandingPageProps {
	onGetStarted?: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
	const [copiedCode, setCopiedCode] = useState<string | null>(null);
	const [demoStep, setDemoStep] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [showRoleSelection, setShowRoleSelection] = useState(false);

	const { data: session } = authClient.useSession();
	const isAuthenticated = !!session?.user;

	const codeExamples = {
		publisher: `// Add Tollbooth to your server
import { tollbooth } from '@tollbooth/server';

app.get('/api/premium-data', tollbooth({
  price: '0.001', // $0.001 per request
  currency: 'USD',
  splits: [
    { address: 'your-wallet.eth', percent: 70 },
    { address: 'partner.eth', percent: 30 }
  ]
}), (req, res) => {
  res.json({ data: 'Premium content here' });
});`,

		agent: `// Use Tollbooth client to bypass restrictions
import { TollboothClient } from '@tollbooth/client';

const client = new TollboothClient({
  wallet: 'your-agent-wallet.eth',
  maxSpend: 10.00 // Daily limit
});

// Automatically handles HTTP 402 payments
const response = await client.get('https://api.site.com/data');
console.log(response.data); // No CAPTCHAs needed!`,

		integration: `<!-- Simple HTML integration -->
<script src="https://cdn.tollbooth.dev/widget.js"></script>
<script>
  Tollbooth.init({
    apiKey: 'tb_live_...',
    onPayment: (tx) => console.log('Payment:', tx)
  });
</script>`,
	};

	const demoSteps = [
		{
			step: 1,
			text: "Request: GET /api/data",
			status: "sending",
			color: "text-chart-4",
		},
		{
			step: 2,
			text: "Response: 402 Payment Required",
			status: "error",
			color: "text-chart-2",
		},
		{
			step: 3,
			text: "Tollbooth: Processing payment...",
			status: "processing",
			color: "text-chart-4",
		},
		{
			step: 4,
			text: "Payment: $0.001 confirmed",
			status: "success",
			color: "text-primary",
		},
		{
			step: 5,
			text: "Request: Retrying with payment token",
			status: "sending",
			color: "text-chart-4",
		},
		{
			step: 6,
			text: "Response: 200 OK + Data",
			status: "success",
			color: "text-primary",
		},
	];

	useEffect(() => {
		if (isPlaying) {
			const timer = setInterval(() => {
				setDemoStep((prev) => {
					if (prev >= demoSteps.length - 1) {
						setIsPlaying(false);
						return 0;
					}
					return prev + 1;
				});
			}, 1500);
			return () => clearInterval(timer);
		}
	}, [isPlaying]);

	const copyCode = (code: string, type: string) => {
		navigator.clipboard.writeText(code);
		setCopiedCode(type);
		setTimeout(() => setCopiedCode(null), 2000);
	};

	const startDemo = () => {
		setDemoStep(0);
		setIsPlaying(true);
	};

	const handleGetStarted = () => {
		if (onGetStarted) {
			onGetStarted();
		} else if (isAuthenticated) {
			setShowRoleSelection(true);
		} else {
			// Scroll to auth section or trigger auth
			setShowRoleSelection(true);
		}
	};

	if (showRoleSelection) {
		return (
			<div className="min-h-screen bg-background terminal-grid flex items-center justify-center p-4">
				<div className="w-full max-w-4xl space-y-8">
					<div className="text-center space-y-4">
						<div className="w-20 h-20 bg-primary terminal-border terminal-glow flex items-center justify-center mx-auto">
							<svg
								width="40"
								height="40"
								viewBox="0 0 400 400"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<title>Tollbooth Logo</title>
								<path
									d="M345.828 90.5391L185.198 129.826V359.971H113.198V147.437L66.1172 158.952L54 109.412L333.712 41L345.828 90.5391Z"
									fill="currentColor"
									className="text-primary-foreground"
								/>
							</svg>
						</div>
						<h1 className="text-3xl font-bold uppercase tracking-wide">
							Choose Your Role
						</h1>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto uppercase tracking-wide">
							Select how you want to use Tollbooth to get started
						</p>
						{!isAuthenticated && (
							<div className="mt-6">
								<SiweSignInButton className="mx-auto" />
								<p className="text-sm text-muted-foreground mt-2 uppercase tracking-wide">
									Connect your wallet to continue
								</p>
							</div>
						)}
						{isAuthenticated && (
							<div className="mt-6">
								<p className="text-primary font-medium uppercase tracking-wide">
									✓ Signed in successfully
								</p>
							</div>
						)}
					</div>

					{isAuthenticated && (
						<>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Publisher Card */}
								<Card className="cursor-pointer transition-all hover:terminal-glow group terminal-border">
									<CardHeader className="text-center pb-4">
										<div className="w-16 h-16 bg-chart-3 text-background terminal-border flex items-center justify-center mx-auto mb-4 group-hover:terminal-glow transition-all">
											<Building2 className="w-8 h-8" />
										</div>
										<h2 className="text-xl uppercase tracking-wide font-bold">
											I'm a Publisher
										</h2>
										<p className="text-muted-foreground text-sm uppercase tracking-wide">
											I own a website, API, or content platform and want to
											monetize automated access
										</p>
									</CardHeader>
									<CardContent className="space-y-6">
										<div className="space-y-3">
											<div className="flex items-start gap-3">
												<CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
												<div>
													<h4 className="text-sm font-bold uppercase tracking-wide">
														Replace Captchas with Payments
													</h4>
													<p className="text-xs text-muted-foreground uppercase tracking-wide">
														Turn bot traffic into revenue streams
													</p>
												</div>
											</div>
											<div className="flex items-start gap-3">
												<CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
												<div>
													<h4 className="text-sm font-bold uppercase tracking-wide">
														Automatic Revenue Splits
													</h4>
													<p className="text-xs text-muted-foreground uppercase tracking-wide">
														Share earnings with multiple recipients
													</p>
												</div>
											</div>
											<div className="flex items-start gap-3">
												<CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
												<div>
													<h4 className="text-sm font-bold uppercase tracking-wide">
														Smart Rate Limiting
													</h4>
													<p className="text-xs text-muted-foreground uppercase tracking-wide">
														Protect resources while allowing paid access
													</p>
												</div>
											</div>
										</div>

										<Button
											className="w-full terminal-border terminal-glow bg-chart-3 text-background hover:bg-chart-3/90 transition-all uppercase tracking-wide font-bold"
											asChild
										>
											<Link href="/publisher/onboarding">
												Get Started as Publisher
												<ArrowRight className="w-4 h-4 ml-2" />
											</Link>
										</Button>

										<div className="text-center text-xs text-muted-foreground uppercase tracking-wide">
											Perfect for: News sites, blogs, APIs, content platforms
										</div>
									</CardContent>
								</Card>

								{/* Agent Card */}
								<Card className="cursor-pointer transition-all hover:terminal-glow group terminal-border">
									<CardHeader className="text-center pb-4">
										<div className="w-16 h-16 bg-primary text-primary-foreground terminal-border flex items-center justify-center mx-auto mb-4 group-hover:terminal-glow transition-all">
											<Bot className="w-8 h-8" />
										</div>
										<h2 className="text-xl uppercase tracking-wide font-bold">
											I'm an Agent Developer
										</h2>
										<p className="text-muted-foreground text-sm uppercase tracking-wide">
											I build bots, scrapers, or AI agents that need to access
											content automatically
										</p>
									</CardHeader>
									<CardContent className="space-y-6">
										<div className="space-y-3">
											<div className="flex items-start gap-3">
												<CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
												<div>
													<h4 className="text-sm font-bold uppercase tracking-wide">
														No More Captchas or 403s
													</h4>
													<p className="text-xs text-muted-foreground uppercase tracking-wide">
														Seamless access to content and APIs
													</p>
												</div>
											</div>
											<div className="flex items-start gap-3">
												<CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
												<div>
													<h4 className="text-sm font-bold uppercase tracking-wide">
														Transparent Pay-Per-Use
													</h4>
													<p className="text-xs text-muted-foreground uppercase tracking-wide">
														Only pay for what you access
													</p>
												</div>
											</div>
											<div className="flex items-start gap-3">
												<CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
												<div>
													<h4 className="text-sm font-bold uppercase tracking-wide">
														Drop-In SDK Integration
													</h4>
													<p className="text-xs text-muted-foreground uppercase tracking-wide">
														Works with any HTTP client
													</p>
												</div>
											</div>
										</div>

										<Button
											className="w-full terminal-border terminal-glow bg-primary text-primary-foreground hover:bg-primary/90 transition-all uppercase tracking-wide font-bold"
											asChild
										>
											<Link href="/agent">
												Get Started as Agent
												<ArrowRight className="w-4 h-4 ml-2" />
											</Link>
										</Button>

										<div className="text-center text-xs text-muted-foreground uppercase tracking-wide">
											Perfect for: Web scrapers, AI agents, API clients,
											crawlers
										</div>
									</CardContent>
								</Card>
							</div>

							<div className="text-center">
								<Button
									variant="outline"
									onClick={() => setShowRoleSelection(false)}
									className="terminal-border text-xs uppercase tracking-wide"
								>
									← Back to Main Page
								</Button>
								<p className="text-xs text-muted-foreground uppercase tracking-wide mt-2">
									Not sure which role fits you? You can always switch roles
									later in the dashboard.
								</p>
							</div>
						</>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background terminal-grid">
			{/* Header */}
			<header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto terminal-border bg-sidebar m-4">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center font-bold terminal-border terminal-glow">
						<svg
							width="24"
							height="24"
							viewBox="0 0 400 400"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<title>Tollbooth Logo</title>
							<path
								d="M345.828 90.5391L185.198 129.826V359.971H113.198V147.437L66.1172 158.952L54 109.412L333.712 41L345.828 90.5391Z"
								fill="currentColor"
								className="text-primary-foreground"
							/>
						</svg>
					</div>
					<div>
						<span
							className="text-lg font-bold uppercase tracking-wider glitch"
							data-text="TOLLBOOTH"
						>
							TOLLBOOTH
						</span>
						<div className="text-xs text-muted-foreground uppercase tracking-wide">
							HTTP 402 GATEWAY
						</div>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<div className="hidden sm:flex items-center gap-4 text-xs uppercase tracking-wide">
						<div className="flex items-center gap-2">
							<Users className="w-3 h-3 text-primary" />
							<span className="text-muted-foreground">2.3K+ DEVS</span>
						</div>
						<div className="flex items-center gap-2">
							<TrendingUp className="w-3 h-3 text-primary" />
							<span className="text-muted-foreground">$47K+ PROCESSED</span>
						</div>
					</div>
					<Badge
						variant="outline"
						className="terminal-border terminal-glow bg-primary/10 text-primary px-3 py-1"
					>
						<div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></div>
						<span className="text-xs uppercase tracking-wide data-text">
							LIVE BETA
						</span>
					</Badge>
				</div>
			</header>

			{/* Hero Section */}
			<main className="max-w-6xl mx-auto px-6 py-16">
				<div className="text-center space-y-8">
					<div className="space-y-6">
						<Badge
							variant="secondary"
							className="mb-4 terminal-border bg-secondary text-secondary-foreground px-3 py-1"
						>
							<span className="text-xs uppercase tracking-wide">
								THE FUTURE OF WEB PAYMENTS
							</span>
						</Badge>
						<h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight leading-tigh">
							CAPTCHAS{" "}
							<span className="glitch text-primary" data-text="BLOCK">
								BLOCK
							</span>{" "}
							REVENUE.
							<br />
							WE UNLOCK IT.
						</h1>
						<p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed uppercase tracking-wide">
							WHY STOP BOTS WHEN YOU CAN CHARGE THEM? WE BUILT THE PAYMENT
							SYSTEM THAT TURNS PROBLEMS INTO PROFIT.
						</p>

						{/* Key Metrics */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-8">
							<div className="text-center">
								<div className="text-2xl font-bold data-text text-primary">
									150ms
								</div>
								<div className="text-xs text-muted-foreground uppercase tracking-wide">
									AVG RESPONSE
								</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold data-text text-primary">
									99.9%
								</div>
								<div className="text-xs text-muted-foreground uppercase tracking-wide">
									UPTIME
								</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold data-text text-primary">
									$0.001
								</div>
								<div className="text-xs text-muted-foreground uppercase tracking-wide">
									MIN COST
								</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold data-text text-primary">
									2.3K+
								</div>
								<div className="text-xs text-muted-foreground uppercase tracking-wide">
									DEVELOPERS
								</div>
							</div>
						</div>
					</div>

					{/* CTA */}
					<div className="space-y-4">
						<div className="space-y-3">
							<div
								className="text-xl font-bold uppercase tracking-wide text-primary glitch"
								data-text="STOP BLOCKING, START BILLING"
							>
								STOP BLOCKING, START BILLING
							</div>
							<div className="flex items-center justify-center gap-2 text-muted-foreground">
								<div className="w-8 h-px bg-primary"></div>
								<ArrowRight className="w-4 h-4 text-primary" />
								<div className="w-8 h-px bg-primary"></div>
							</div>
							<Button
								size="lg"
								className="text-sm px-8 py-4 terminal-border terminal-glow bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-wide font-bold"
								onClick={handleGetStarted}
							>
								<Zap className="w-4 h-4 mr-2" />
								GET STARTED
								<ArrowRight className="w-4 h-4 ml-2" />
							</Button>
						</div>
						<p className="text-xs text-muted-foreground uppercase tracking-wide">
							FREE TO GET STARTED • NO CREDIT CARD REQUIRED • 14-DAY TRIAL
						</p>
					</div>
				</div>

				{/* Live Demo Section */}
				<div className="mt-20">
					<div className="text-center mb-8">
						<h2 className="text-2xl font-bold uppercase tracking-wide mb-4">
							LIVE DEMO: HTTP 402 IN ACTION
						</h2>
						<p className="text-muted-foreground text-sm uppercase tracking-wide max-w-2xl mx-auto">
							WATCH HOW TOLLBOOTH TRANSFORMS A 403 FORBIDDEN INTO A SEAMLESS
							PAYMENT FLOW
						</p>
					</div>

					<Card className="terminal-border bg-card max-w-4xl mx-auto">
						<CardHeader className="terminal-border border-l-0 border-r-0 border-t-0 pb-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Terminal className="w-4 h-4 text-primary" />
									<span className="text-sm uppercase tracking-wide">
										TERMINAL SIMULATION
									</span>
								</div>
								<Button
									size="sm"
									variant="outline"
									onClick={startDemo}
									className="terminal-border text-xs uppercase"
									disabled={isPlaying}
								>
									{isPlaying ? "RUNNING..." : "RESTART DEMO"}
								</Button>
							</div>
						</CardHeader>
						<CardContent className="p-4 space-y-2 bg-background font-mono text-xs">
							{demoSteps.map((step, index) => (
								<div
									key={`demo-step-${step.step}`}
									className={`flex items-center gap-3 transition-all duration-500 ${
										index <= demoStep ? "opacity-100" : "opacity-30"
									}`}
								>
									<span className="text-muted-foreground w-8">
										{String(step.step).padStart(2, "0")}.
									</span>
									<span
										className={`${step.color} ${index === demoStep && isPlaying ? "animate-pulse" : ""}`}
									>
										{step.text}
									</span>
									{index === demoStep && isPlaying && (
										<div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
									)}
								</div>
							))}
							<div className="mt-4 pt-2 border-t border-border">
								<div className="text-primary">
									✓ RESULT: Seamless access in 150ms average
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Code Examples */}
				<div className="mt-20">
					<div className="text-center mb-8">
						<h2 className="text-2xl font-bold uppercase tracking-wide mb-4">
							INTEGRATION EXAMPLES
						</h2>
						<p className="text-muted-foreground text-sm uppercase tracking-wide">
							CHOOSE YOUR ROLE TO SEE RELEVANT CODE EXAMPLES
						</p>
					</div>

					<Tabs defaultValue="publisher" className="max-w-4xl mx-auto">
						<TabsList className="grid w-full grid-cols-3 terminal-border bg-muted">
							<TabsTrigger
								value="publisher"
								className="text-xs uppercase tracking-wide"
							>
								PUBLISHER
							</TabsTrigger>
							<TabsTrigger
								value="agent"
								className="text-xs uppercase tracking-wide"
							>
								AGENT/DEV
							</TabsTrigger>
							<TabsTrigger
								value="integration"
								className="text-xs uppercase tracking-wide"
							>
								SIMPLE HTML
							</TabsTrigger>
						</TabsList>

						{Object.entries(codeExamples).map(([key, code]) => (
							<TabsContent key={key} value={key} className="mt-4">
								<Card className="terminal-border bg-card">
									<CardHeader className="terminal-border border-l-0 border-r-0 border-t-0 pb-3">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<Code className="w-4 h-4 text-primary" />
												<span className="text-sm uppercase tracking-wide">
													{key === "publisher"
														? "SERVER INTEGRATION"
														: key === "agent"
															? "CLIENT INTEGRATION"
															: "HTML WIDGET"}
												</span>
											</div>
											<Button
												size="sm"
												variant="outline"
												className="terminal-border text-xs"
												onClick={() => copyCode(code, key)}
											>
												{copiedCode === key ? (
													<Check className="w-3 h-3" />
												) : (
													<Copy className="w-3 h-3" />
												)}
												{copiedCode === key ? "COPIED" : "COPY"}
											</Button>
										</div>
									</CardHeader>
									<CardContent className="p-4">
										<pre className="text-xs bg-background p-4 rounded terminal-border overflow-x-auto">
											<code className="data-text">{code}</code>
										</pre>
									</CardContent>
								</Card>
							</TabsContent>
						))}
					</Tabs>
				</div>

				{/* Features Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-20">
					{/* Publisher Card */}
					<Card className="p-6 terminal-border bg-card hover:terminal-glow transition-all duration-300">
						<CardContent className="p-0 space-y-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-chart-3 text-background flex items-center justify-center terminal-border">
									<Building2 className="w-5 h-5" />
								</div>
								<div className="text-left">
									<h3 className="text-lg font-bold uppercase tracking-wide">
										FOR PUBLISHERS
									</h3>
									<p className="text-muted-foreground text-xs uppercase tracking-wide">
										MONETIZE YOUR CONTENT
									</p>
								</div>
							</div>

							<div className="space-y-3 text-left">
								<div className="flex items-start gap-3">
									<CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
									<div>
										<h4 className="text-sm font-bold uppercase tracking-wide">
											REPLACE CAPTCHAS WITH PAYMENTS
										</h4>
										<p className="text-xs text-muted-foreground uppercase tracking-wide">
											TURN BOT TRAFFIC INTO REVENUE STREAMS
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
									<div>
										<h4 className="text-sm font-bold uppercase tracking-wide">
											AUTOMATIC REVENUE SPLITS
										</h4>
										<p className="text-xs text-muted-foreground uppercase tracking-wide">
											SHARE EARNINGS WITH MULTIPLE RECIPIENTS
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
									<div>
										<h4 className="text-sm font-bold uppercase tracking-wide">
											SMART RATE LIMITING
										</h4>
										<p className="text-xs text-muted-foreground uppercase tracking-wide">
											PROTECT RESOURCES WHILE ALLOWING PAID ACCESS
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Agent Card */}
					<Card className="p-6 terminal-border bg-card hover:terminal-glow transition-all duration-300">
						<CardContent className="p-0 space-y-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center terminal-border">
									<Bot className="w-5 h-5" />
								</div>
								<div className="text-left">
									<h3 className="text-lg font-bold uppercase tracking-wide">
										FOR DEVELOPERS
									</h3>
									<p className="text-muted-foreground text-xs uppercase tracking-wide">
										AUTOMATE WITHOUT BARRIERS
									</p>
								</div>
							</div>

							<div className="space-y-3 text-left">
								<div className="flex items-start gap-3">
									<CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
									<div>
										<h4 className="text-sm font-bold uppercase tracking-wide">
											NO MORE CAPTCHAS OR 403S
										</h4>
										<p className="text-xs text-muted-foreground uppercase tracking-wide">
											SEAMLESS ACCESS TO CONTENT AND APIS
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
									<div>
										<h4 className="text-sm font-bold uppercase tracking-wide">
											TRANSPARENT PAY-PER-USE
										</h4>
										<p className="text-xs text-muted-foreground uppercase tracking-wide">
											ONLY PAY FOR WHAT YOU ACCESS
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
									<div>
										<h4 className="text-sm font-bold uppercase tracking-wide">
											DROP-IN SDK INTEGRATION
										</h4>
										<p className="text-xs text-muted-foreground uppercase tracking-wide">
											WORKS WITH ANY HTTP CLIENT
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* How It Works */}
				<div className="mt-20 space-y-8">
					<div className="text-center space-y-4">
						<h2 className="text-2xl font-bold uppercase tracking-wide">
							HOW IT WORKS
						</h2>
						<p className="text-muted-foreground max-w-2xl mx-auto text-sm uppercase tracking-wide">
							TOLLBOOTH INTRODUCES HTTP 402 - A NEW STATUS CODE THAT REQUESTS
							PAYMENT INSTEAD OF BLOCKING ACCESS
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="text-center space-y-4">
							<div className="w-16 h-16 terminal-border bg-accent text-accent-foreground flex items-center justify-center mx-auto terminal-glow">
								<Globe className="w-8 h-8 text-primary" />
							</div>
							<h3 className="text-base font-bold uppercase tracking-wide">
								1. REQUEST CONTENT
							</h3>
							<p className="text-muted-foreground text-xs uppercase tracking-wide">
								YOUR AGENT MAKES A REQUEST TO A TOLLBOOTH-ENABLED SITE
							</p>
						</div>

						<div className="text-center space-y-4">
							<div className="w-16 h-16 terminal-border bg-accent text-accent-foreground flex items-center justify-center mx-auto terminal-glow">
								<Wallet className="w-8 h-8 text-primary" />
							</div>
							<h3 className="text-base font-bold uppercase tracking-wide">
								2. AUTO PAYMENT
							</h3>
							<p className="text-muted-foreground text-xs uppercase tracking-wide">
								TOLLBOOTH AUTOMATICALLY HANDLES THE PAYMENT FROM YOUR CONNECTED
								WALLET
							</p>
						</div>

						<div className="text-center space-y-4">
							<div className="w-16 h-16 terminal-border bg-accent text-accent-foreground flex items-center justify-center mx-auto terminal-glow">
								<Zap className="w-8 h-8 text-primary" />
							</div>
							<h3 className="text-base font-bold uppercase tracking-wide">
								3. INSTANT ACCESS
							</h3>
							<p className="text-muted-foreground text-xs uppercase tracking-wide">
								GET THE CONTENT IMMEDIATELY WITHOUT CAPTCHAS OR DELAYS
							</p>
						</div>
					</div>
				</div>

				{/* Social Proof */}
				<div className="mt-20">
					<div className="text-center mb-12">
						<h2 className="text-2xl font-bold uppercase tracking-wide mb-4">
							TRUSTED BY DEVELOPERS WORLDWIDE
						</h2>
						<p className="text-muted-foreground text-sm uppercase tracking-wide">
							JOIN 2,300+ DEVELOPERS ALREADY USING TOLLBOOTH
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Testimonial 1 */}
						<Card className="p-6 terminal-border bg-card">
							<CardContent className="p-0 space-y-4">
								<div className="flex items-center gap-1">
									{[1, 2, 3, 4, 5].map((i) => (
										<Star
											key={`testimonial-1-star-${i}`}
											className="w-4 h-4 fill-primary text-primary"
										/>
									))}
								</div>
								<p className="text-sm">
									"Tollbooth eliminated 90% of our CAPTCHA-related failures. Our
									scraping ops are now seamless and profitable for content
									providers."
								</p>
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center terminal-border text-xs font-bold">
										JS
									</div>
									<div>
										<div className="text-xs font-bold uppercase tracking-wide">
											JOHN SMITH
										</div>
										<div className="text-xs text-muted-foreground uppercase tracking-wide">
											CTO, DATAFLOW AI
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Testimonial 2 */}
						<Card className="p-6 terminal-border bg-card">
							<CardContent className="p-0 space-y-4">
								<div className="flex items-center gap-1">
									{[1, 2, 3, 4, 5].map((i) => (
										<Star
											key={`testimonial-2-star-${i}`}
											className="w-4 h-4 fill-primary text-primary"
										/>
									))}
								</div>
								<p className="text-sm">
									"We've generated $12K+ in additional revenue just by replacing
									our rate limiting with Tollbooth payments. Game changer."
								</p>
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 bg-chart-3 text-background flex items-center justify-center terminal-border text-xs font-bold">
										MR
									</div>
									<div>
										<div className="text-xs font-bold uppercase tracking-wide">
											MARIA RODRIGUEZ
										</div>
										<div className="text-xs text-muted-foreground uppercase tracking-wide">
											FOUNDER, APIMARKET
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Testimonial 3 */}
						<Card className="p-6 terminal-border bg-card">
							<CardContent className="p-0 space-y-4">
								<div className="flex items-center gap-1">
									{[1, 2, 3, 4, 5].map((i) => (
										<Star
											key={`testimonial-3-star-${i}`}
											className="w-4 h-4 fill-primary text-primary"
										/>
									))}
								</div>
								<p className="text-sm">
									"Setup took 5 minutes. Now our APIs earn revenue instead of
									burning server costs on bot traffic. Brilliant solution."
								</p>
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 bg-chart-4 text-background flex items-center justify-center terminal-border text-xs font-bold">
										DK
									</div>
									<div>
										<div className="text-xs font-bold uppercase tracking-wide">
											DAVID KIM
										</div>
										<div className="text-xs text-muted-foreground uppercase tracking-wide">
											LEAD DEV, WEBSCALE
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Technical Specifications */}
				<div className="mt-20">
					<div className="text-center mb-8">
						<h2 className="text-2xl font-bold uppercase tracking-wide mb-4">
							TECHNICAL SPECIFICATIONS
						</h2>
						<p className="text-muted-foreground text-sm uppercase tracking-wide">
							BUILT FOR ENTERPRISE-GRADE PERFORMANCE AND SECURITY • POWERED BY
							CDP X402
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<Card className="p-4 terminal-border bg-card text-center">
							<div className="flex flex-col items-center gap-3">
								<Server className="w-6 h-6 text-primary" />
								<div>
									<div className="text-lg font-bold data-text">99.9%</div>
									<div className="text-xs text-muted-foreground uppercase tracking-wide">
										UPTIME SLA
									</div>
								</div>
							</div>
						</Card>

						<Card className="p-4 terminal-border bg-card text-center">
							<div className="flex flex-col items-center gap-3">
								<Zap className="w-6 h-6 text-primary" />
								<div>
									<div className="text-lg font-bold data-text">150ms</div>
									<div className="text-xs text-muted-foreground uppercase tracking-wide">
										AVG LATENCY
									</div>
								</div>
							</div>
						</Card>

						<Card className="p-4 terminal-border bg-card text-center">
							<div className="flex flex-col items-center gap-3">
								<Lock className="w-6 h-6 text-primary" />
								<div>
									<div className="text-lg font-bold data-text">256-bit</div>
									<div className="text-xs text-muted-foreground uppercase tracking-wide">
										ENCRYPTION
									</div>
								</div>
							</div>
						</Card>

						<Card className="p-4 terminal-border bg-card text-center">
							<div className="flex flex-col items-center gap-3">
								<Layers className="w-6 h-6 text-primary" />
								<div>
									<div className="text-lg font-bold data-text">10K+</div>
									<div className="text-xs text-muted-foreground uppercase tracking-wide">
										RPS CAPACITY
									</div>
								</div>
							</div>
						</Card>
					</div>

					<Card className="mt-6 p-6 terminal-border bg-card">
						<CardContent className="p-0">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
								<div>
									<h3 className="text-lg font-bold uppercase tracking-wide mb-4">
										INFRASTRUCTURE
									</h3>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-muted-foreground uppercase">
												CDP X402 PROTOCOL
											</span>
											<span className="text-primary">✓</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground uppercase">
												GLOBAL CDN
											</span>
											<span className="text-primary">✓</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground uppercase">
												AUTO-SCALING
											</span>
											<span className="text-primary">✓</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground uppercase">
												EDGE COMPUTING
											</span>
											<span className="text-primary">✓</span>
										</div>
									</div>
								</div>
								<div>
									<h3 className="text-lg font-bold uppercase tracking-wide mb-4">
										SUPPORTED NETWORKS
									</h3>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-muted-foreground uppercase">
												ETHEREUM MAINNET
											</span>
											<span className="text-primary">✓</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground uppercase">
												POLYGON
											</span>
											<span className="text-primary">✓</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground uppercase">
												BASE
											</span>
											<span className="text-primary">✓</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground uppercase">
												ARBITRUM
											</span>
											<span className="text-primary">✓</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground uppercase">
												OPTIMISM
											</span>
											<span className="text-chart-4">COMING SOON</span>
										</div>
									</div>
								</div>
								<div>
									<h3 className="text-lg font-bold uppercase tracking-wide mb-4">
										INTEGRATIONS
									</h3>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-muted-foreground uppercase">
												NODE.JS SDK
											</span>
											<span className="text-primary">✓</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground uppercase">
												PYTHON SDK
											</span>
											<span className="text-primary">✓</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground uppercase">
												REST API
											</span>
											<span className="text-primary">✓</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground uppercase">
												WEBHOOKS
											</span>
											<span className="text-primary">✓</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground uppercase">
												GRAPHQL
											</span>
											<span className="text-chart-4">COMING SOON</span>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* FAQ Section */}
				<div className="mt-20">
					<div className="text-center mb-8">
						<h2 className="text-2xl font-bold uppercase tracking-wide mb-4">
							FREQUENTLY ASKED QUESTIONS
						</h2>
						<p className="text-muted-foreground text-sm uppercase tracking-wide">
							EVERYTHING YOU NEED TO KNOW ABOUT HTTP 402 AND TOLLBOOTH
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
						<Card className="p-6 terminal-border bg-card">
							<CardContent className="p-0 space-y-3">
								<h3 className="text-sm font-bold uppercase tracking-wide">
									WHAT IS HTTP 402?
								</h3>
								<p className="text-xs text-muted-foreground">
									HTTP 402 is a reserved status code for "Payment Required."
									Tollbooth implements this standard to create a seamless
									payment flow when content requires micropayments.
								</p>
							</CardContent>
						</Card>

						<Card className="p-6 terminal-border bg-card">
							<CardContent className="p-0 space-y-3">
								<h3 className="text-sm font-bold uppercase tracking-wide">
									HOW SECURE ARE PAYMENTS?
								</h3>
								<p className="text-xs text-muted-foreground">
									All payments use 256-bit encryption and are processed
									on-chain. We never store private keys or sensitive payment
									data. Your wallet stays in your control.
								</p>
							</CardContent>
						</Card>

						<Card className="p-6 terminal-border bg-card">
							<CardContent className="p-0 space-y-3">
								<h3 className="text-sm font-bold uppercase tracking-wide">
									WHAT IS CDP X402?
								</h3>
								<p className="text-xs text-muted-foreground">
									CDP x402 is the underlying protocol that powers Tollbooth's
									payment infrastructure. It enables seamless HTTP 402
									implementation with enterprise-grade security and performance.
								</p>
							</CardContent>
						</Card>

						<Card className="p-6 terminal-border bg-card">
							<CardContent className="p-0 space-y-3">
								<h3 className="text-sm font-bold uppercase tracking-wide">
									CAN I SET CUSTOM PRICES?
								</h3>
								<p className="text-xs text-muted-foreground">
									Yes! Publishers can set any price from $0.001 upwards. You can
									also create tiered pricing, bulk discounts, and subscription
									models.
								</p>
							</CardContent>
						</Card>

						<Card className="p-6 terminal-border bg-card">
							<CardContent className="p-0 space-y-3">
								<h3 className="text-sm font-bold uppercase tracking-wide">
									DOES IT WORK WITH EXISTING APIS?
								</h3>
								<p className="text-xs text-muted-foreground">
									Absolutely! Add our middleware to any existing API endpoint.
									No need to rewrite your application - just wrap protected
									routes with Tollbooth.
								</p>
							</CardContent>
						</Card>

						<Card className="p-6 terminal-border bg-card">
							<CardContent className="p-0 space-y-3">
								<h3 className="text-sm font-bold uppercase tracking-wide">
									WHAT ABOUT REFUNDS?
								</h3>
								<p className="text-xs text-muted-foreground">
									Failed requests are automatically refunded. You can also
									implement custom refund logic for specific use cases using our
									webhook system.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Final CTA */}
				<div className="mt-20 p-6 terminal-border bg-card">
					<div className="space-y-4">
						<h3 className="text-xl font-bold uppercase tracking-wide">
							READY TO ELIMINATE FRICTION?
						</h3>
						<p className="text-muted-foreground text-sm uppercase tracking-wide">
							JOIN THE FUTURE OF WEB PAYMENTS. SET UP YOUR ACCOUNT IN UNDER 2
							MINUTES.
						</p>
						<Button
							size="lg"
							className="text-sm px-8 py-4 terminal-border terminal-glow bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-wide font-bold"
							onClick={handleGetStarted}
						>
							<Shield className="w-4 h-4 mr-2" />
							GET STARTED NOW
							<ArrowRight className="w-4 h-4 ml-2" />
						</Button>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="terminal-border py-6 px-6 border-l-0 border-r-0 border-b-0">
				<div className="max-w-6xl mx-auto text-center text-xs text-muted-foreground uppercase tracking-wide">
					<p>TOLLBOOTH • THE FUTURE OF FRICTIONLESS WEB PAYMENTS</p>
				</div>
			</footer>
		</div>
	);
}
