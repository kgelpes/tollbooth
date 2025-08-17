"use client";

import { Button } from "@tollbooth/ui/button";
import { Input } from "@tollbooth/ui/components/input";
import { Label } from "@tollbooth/ui/components/label";
import { Textarea } from "@tollbooth/ui/components/textarea";
import { CheckCircle, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { StepProps } from "./types";

export function IntegrationSetup({ onNext, onBack }: StepProps) {
	const apiKey = "tollbooth_demo123456789";
	const integrationCode = `<!-- Add this to your site's <head> -->
<script src="https://tollbooth.dev/js/integration.js"></script>
<script>
  Tollbooth.init({
    apiKey: "${apiKey}",
    domain: "https://example.com",
    baseFee: "1.00"
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
						<Link href="/test">Test Integration</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
