"use client";

import { Input } from "@tollbooth/ui/components/input";
import { Label } from "@tollbooth/ui/components/label";
import { Globe } from "lucide-react";
import type { StepProps } from "./types";

export function SiteInformation({ onNext, onBack }: StepProps) {
	return (
		<div className="space-y-6">
			<div className="text-center space-y-2">
				<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
					<Globe className="w-8 h-8 text-primary" />
				</div>
				<h2 className="text-2xl font-semibold">Site Information</h2>
				<p className="text-muted-foreground">
					Let's start by setting up your site details
				</p>
			</div>

			<div className="space-y-4">
				<div className="space-y-2">
					<Label>Site Name</Label>
					<Input placeholder="e.g., My News Site" defaultValue="" />
				</div>

				<div className="space-y-2">
					<Label>Site URL</Label>
					<Input placeholder="https://example.com" defaultValue="" />
				</div>
			</div>
		</div>
	);
}
