import { Button } from "@tollbooth/ui/button";
import Link from "next/link";

export default function AgentPage() {
	return (
		<div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
			<div className="text-center space-y-4">
				<h1 className="text-3xl font-bold">Agent Dashboard</h1>
				<p className="text-muted-foreground">Agent onboarding coming soon!</p>
				<Button asChild>
					<Link href="/">Back to Role Selection</Link>
				</Button>
			</div>
		</div>
	);
}
