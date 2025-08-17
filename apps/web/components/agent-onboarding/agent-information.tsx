"use client";

import { Input } from "@tollbooth/ui/components/input";
import { Label } from "@tollbooth/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@tollbooth/ui/components/select";
import { Bot } from "lucide-react";
import { useId, useState } from "react";
import type { StepProps } from "./types";

export function AgentInformation({ onSubmit, initialData }: StepProps) {
	const agentNameId = useId();
	const agentTypeId = useId();

	const [agentName, setAgentName] = useState(
		(initialData?.agentName as string) || "",
	);
	const [agentType, setAgentType] = useState(
		(initialData?.agentType as string) || "",
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({ agentName, agentType });
	};

	// Validation handled by parent component

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="text-center space-y-2">
				<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
					<Bot className="w-8 h-8 text-primary" />
				</div>
				<h2 className="text-2xl font-semibold">Agent Information</h2>
				<p className="text-muted-foreground">Tell us about your agent or bot</p>
			</div>

			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor={agentNameId}>Agent Name</Label>
					<Input
						id={agentNameId}
						placeholder="e.g., News Scraper Bot"
						value={agentName}
						onChange={(e) => setAgentName(e.target.value)}
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor={agentTypeId}>Agent Type</Label>
					<Select value={agentType || ""} onValueChange={setAgentType}>
						<SelectTrigger id={agentTypeId}>
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

			{/* Button is handled by parent component for step 1 */}
		</form>
	);
}
