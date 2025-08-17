"use client";

import { Button } from "@tollbooth/ui/button";
import { Input } from "@tollbooth/ui/components/input";
import { Label } from "@tollbooth/ui/components/label";
import { Textarea } from "@tollbooth/ui/components/textarea";
import { CheckCircle, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { StepProps } from "./types";

export function IntegrationSetup({ onSubmit }: StepProps) {
	const [copied, setCopied] = useState(false);
	const [codeCopied, setCodeCopied] = useState(false);
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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({ completed: true, apiKey });
	};

	const copyApiKey = async () => {
		try {
			await navigator.clipboard.writeText(apiKey);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			// noop
		}
	};

	const copyCode = async () => {
		try {
			await navigator.clipboard.writeText(integrationCode);
			setCodeCopied(true);
			setTimeout(() => setCodeCopied(false), 1500);
		} catch {
			// noop
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
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
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={copyApiKey}
						>
							<Copy className="w-4 h-4" />
							{copied ? "Copied!" : "Copy"}
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
							type="button"
							variant="outline"
							size="sm"
							className="absolute top-2 right-2"
							onClick={copyCode}
						>
							<Copy className="w-4 h-4" />
							{codeCopied ? "Copied!" : "Copy"}
						</Button>
					</div>
				</div>

				<div className="flex gap-2">
					<Button type="button" variant="outline" className="flex-1" asChild>
						<Link href="/docs">
							<ExternalLink className="w-4 h-4 mr-2" />
							View Documentation
						</Link>
					</Button>
					<Button type="button" variant="outline" className="flex-1" asChild>
						<Link href="/test">Test Integration</Link>
					</Button>
				</div>
			</div>

			{/* Buttons handled by parent component */}
		</form>
	);
}
