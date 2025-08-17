"use client";

import { Input } from "@tollbooth/ui/components/input";
import { Label } from "@tollbooth/ui/components/label";
import { Globe } from "lucide-react";
import { useId, useState } from "react";
import type { StepProps } from "./types";

export function SiteInformation({ onSubmit, initialData }: StepProps) {
	const siteNameId = useId();
	const siteUrlId = useId();
	const [siteName, setSiteName] = useState(
		(initialData?.siteName as string) || "",
	);
	const [siteUrl, setSiteUrl] = useState(
		(initialData?.siteUrl as string) || "",
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({ siteName, siteUrl });
	};

	// URL validation function - disabled for now
	// const isValidUrl = (url: string) => {
	//	const trimmed = url.trim();
	//	// Super relaxed validation - just needs some text
	//	return trimmed.length > 0;
	// };

	// Validation handled by parent component
	// Keep isValidUrl for potential future use
	// const isValid = siteName.trim().length > 0 && siteUrl.trim().length > 0 && isValidUrl(siteUrl);

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
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
					<Label htmlFor={siteNameId}>Site Name</Label>
					<Input
						id={siteNameId}
						placeholder="e.g., My News Site"
						value={siteName}
						onChange={(e) => setSiteName(e.target.value)}
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor={siteUrlId}>Site URL</Label>
					<Input
						id={siteUrlId}
						type="url"
						placeholder="https://example.com"
						value={siteUrl}
						onChange={(e) => setSiteUrl(e.target.value)}
						required
					/>
				</div>
			</div>

			{/* Button is handled by parent component for step 1 */}
		</form>
	);
}
