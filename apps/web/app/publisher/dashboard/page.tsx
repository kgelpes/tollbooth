import { Button } from "@tollbooth/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@tollbooth/ui/card";
import Link from "next/link";

export default function PublisherDashboard() {
	return (
		<div className="min-h-screen bg-muted/30 p-4">
			<div className="max-w-6xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Publisher Dashboard</h1>
						<p className="text-muted-foreground">
							Manage your site integration and revenue
						</p>
					</div>
					<Button asChild>
						<Link href="/">Back to Home</Link>
					</Button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Total Revenue</CardTitle>
							<CardDescription>This month</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">$0.00</div>
							<p className="text-xs text-muted-foreground">
								+0% from last month
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>API Requests</CardTitle>
							<CardDescription>This month</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">0</div>
							<p className="text-xs text-muted-foreground">No requests yet</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Integration Status</CardTitle>
							<CardDescription>Site setup</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-orange-600">Pending</div>
							<p className="text-xs text-muted-foreground">
								Complete setup to start earning
							</p>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
						<CardDescription>
							Get started with your publisher integration
						</CardDescription>
					</CardHeader>
					<CardContent className="flex gap-4">
						<Button asChild>
							<Link href="/publisher/onboarding?step=1">Complete Setup</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link href="/docs">View Documentation</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
