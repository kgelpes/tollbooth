"use client";

import { Button } from "@tollbooth/ui/button";
import { Input } from "@tollbooth/ui/components/input";
import { Label } from "@tollbooth/ui/components/label";
import { CheckCircle, Code, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { StepProps } from "./types";

export function IntegrationReady({ onNext, onBack }: StepProps) {
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
