import { Button } from "@tollbooth/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@tollbooth/ui/card";
import {
	ArrowRight,
	Bot,
	Building2,
	Globe,
	Shield,
	Wallet,
	Zap,
} from "lucide-react";
import Link from "next/link";

export function RoleSelection() {
	return (
		<div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
			<div className="w-full max-w-4xl space-y-8">
				<div className="text-center space-y-4">
					<div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto">
						<span className="text-primary-foreground font-bold text-2xl">
							T
						</span>
					</div>
					<h1 className="text-3xl font-bold">Welcome to Tollbooth</h1>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						The payment gateway that solves CAPTCHAs and 403s for automated
						requests. Choose your role to get started.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Publisher Card */}
					<Card className="cursor-pointer transition-all hover:shadow-lg group">
						<CardHeader className="text-center pb-4">
							<div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors">
								<Building2 className="w-8 h-8 text-blue-600" />
							</div>
							<CardTitle className="text-xl">I'm a Publisher</CardTitle>
							<CardDescription className="text-base">
								I own a website, API, or content platform and want to monetize
								automated access
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<Globe className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
									<div>
										<h4 className="font-medium">Monetize Your Content</h4>
										<p className="text-sm text-muted-foreground">
											Charge tiny fees for automated requests instead of
											blocking them
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
									<div>
										<h4 className="font-medium">Smart Rate Limiting</h4>
										<p className="text-sm text-muted-foreground">
											Automatically distinguish between bots and real users
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Zap className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
									<div>
										<h4 className="font-medium">Revenue Sharing</h4>
										<p className="text-sm text-muted-foreground">
											Split payments automatically between multiple recipients
										</p>
									</div>
								</div>
							</div>

							<Button
								className="w-full group-hover:bg-blue-600 hover:bg-blue-600 transition-colors"
								asChild
							>
								<Link href="/publisher/onboarding">
									Get Started as Publisher
									<ArrowRight className="w-4 h-4 ml-2" />
								</Link>
							</Button>

							<div className="text-center text-sm text-muted-foreground">
								Perfect for: News sites, blogs, APIs, content platforms
							</div>
						</CardContent>
					</Card>

					{/* Agent Card */}
					<Card className="cursor-pointer transition-all hover:shadow-lg group">
						<CardHeader className="text-center pb-4">
							<div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-900/40 transition-colors">
								<Bot className="w-8 h-8 text-green-600" />
							</div>
							<CardTitle className="text-xl">I'm an Agent Developer</CardTitle>
							<CardDescription className="text-base">
								I build bots, scrapers, or AI agents that need to access content
								automatically
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
									<div>
										<h4 className="font-medium">Skip CAPTCHAs</h4>
										<p className="text-sm text-muted-foreground">
											Automatically handle payment requests instead of puzzles
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Wallet className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
									<div>
										<h4 className="font-medium">Transparent Pricing</h4>
										<p className="text-sm text-muted-foreground">
											Pay-per-use model with spending controls and limits
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Zap className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
									<div>
										<h4 className="font-medium">Seamless Integration</h4>
										<p className="text-sm text-muted-foreground">
											Drop-in SDK that works with any HTTP client
										</p>
									</div>
								</div>
							</div>

							<Button
								className="w-full group-hover:bg-green-600 hover:bg-green-600 transition-colors"
								asChild
							>
								<Link href="/agent">
									Get Started as Agent
									<ArrowRight className="w-4 h-4 ml-2" />
								</Link>
							</Button>

							<div className="text-center text-sm text-muted-foreground">
								Perfect for: Web scrapers, AI agents, API clients, crawlers
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="text-center">
					<p className="text-sm text-muted-foreground">
						Not sure which role fits you? You can always switch roles later in
						the dashboard.
					</p>
				</div>
			</div>
		</div>
	);
}
