import { Button } from "@tollbooth/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@tollbooth/ui/card";
import Link from "next/link";

export default function AgentDashboard() {
	return (
		<div className="min-h-screen bg-muted/30 p-4">
			<div className="max-w-6xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Agent Dashboard</h1>
						<p className="text-muted-foreground">
							Monitor your agent's activity and spending
						</p>
					</div>
					<Button asChild>
						<Link href="/">Back to Home</Link>
					</Button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Total Spent</CardTitle>
							<CardDescription>This month</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">$0.00</div>
							<p className="text-xs text-muted-foreground">
								No requests yet
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Requests Made</CardTitle>
							<CardDescription>This month</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">0</div>
							<p className="text-xs text-muted-foreground">
								Start making requests
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Wallet Balance</CardTitle>
							<CardDescription>Available funds</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-orange-600">$0.00</div>
							<p className="text-xs text-muted-foreground">
								Connect wallet to add funds
							</p>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
						<CardDescription>
							Get started with your agent integration
						</CardDescription>
					</CardHeader>
					<CardContent className="flex gap-4">
						<Button asChild>
							<Link href="/agent/onboarding?step=1">Complete Setup</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link href="/docs">View Documentation</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link href="/sdk">Download SDK</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
