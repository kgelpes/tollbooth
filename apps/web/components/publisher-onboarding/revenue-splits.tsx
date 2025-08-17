"use client";

import { Button } from "@tollbooth/ui/button";
import { Input } from "@tollbooth/ui/components/input";
import { Label } from "@tollbooth/ui/components/label";
import { Users } from "lucide-react";
// import { useState } from "react"; // Disabled for Coming Soon state
import type { StepProps } from "./types";

// interface RevenueSplit {
//	id: string;
//	address: string;
//	percentage: number;
// }

export function RevenueSplits({ onSubmit }: StepProps) {
	// Revenue splits data - disabled for "Coming Soon" state
	// const [revenueSplits, setRevenueSplits] = useState<RevenueSplit[]>(...);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Skip revenue splits for now - coming soon
		onSubmit({ revenueSplits: [{ id: "1", address: "", percentage: 100 }] });
	};

	// Functions disabled for "Coming Soon" state
	// const addRecipient = () => { ... }
	// const removeRecipient = (id: string) => { ... }
	// const updateSplit = (...) => { ... }
	// Simplified validation for disabled state - always allow to proceed
	// const isValid = true;

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="text-center space-y-2">
				<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
					<Users className="w-8 h-8 text-primary" />
				</div>
				<h2 className="text-2xl font-semibold">Revenue Splits</h2>
				<p className="text-muted-foreground">
					Configure how revenue is distributed
				</p>
				<div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
					Coming Soon
				</div>
			</div>

			<div className="space-y-4 opacity-50 pointer-events-none">
				<div className="p-4 border rounded-lg space-y-3">
					<div className="flex items-center justify-between">
						<h4 className="font-medium">Recipient 1</h4>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						<div className="md:col-span-2 space-y-2">
							<Label>Wallet Address</Label>
							<Input
								placeholder="0x..."
								value=""
								disabled
							/>
						</div>
						<div className="space-y-2">
							<Label>Percentage</Label>
							<Input
								type="number"
								value="100"
								disabled
							/>
						</div>
					</div>
				</div>

				<Button
					type="button"
					variant="outline"
					className="w-full"
					disabled
				>
					+ Add Recipient
				</Button>

				<div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
					<p className="text-sm text-gray-700 dark:text-gray-300">
						<strong>Preview:</strong> Revenue splitting functionality will be available soon. For now, all revenue will go to your primary wallet.
					</p>
				</div>

				<div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
					<p className="text-sm text-blue-700 dark:text-blue-300">
						<strong>Future:</strong> You'll be able to add multiple recipients for revenue
						sharing (e.g., 70% outlet, 30% journalist)
					</p>
				</div>
			</div>

			{/* Buttons handled by parent component */}
		</form>
	);
}
