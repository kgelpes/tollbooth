"use client";

import { Button } from "@tollbooth/ui/button";
import { Input } from "@tollbooth/ui/components/input";
import { Label } from "@tollbooth/ui/components/label";
import { Users } from "lucide-react";
import type { StepProps } from "./types";

export function RevenueSplits({ onNext, onBack }: StepProps) {
	return (
		<div className="space-y-6">
			<div className="text-center space-y-2">
				<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
					<Users className="w-8 h-8 text-primary" />
				</div>
				<h2 className="text-2xl font-semibold">Revenue Splits</h2>
				<p className="text-muted-foreground">
					Configure how revenue is distributed
				</p>
			</div>

			<div className="space-y-4">
				<div className="p-4 border rounded-lg space-y-3">
					<div className="flex items-center justify-between">
						<h4 className="font-medium">Recipient 1</h4>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						<div className="md:col-span-2 space-y-2">
							<Label>Wallet Address</Label>
							<Input placeholder="0x..." defaultValue="" />
						</div>
						<div className="space-y-2">
							<Label>Percentage</Label>
							<Input type="number" min="0" max="100" defaultValue="100" />
						</div>
					</div>
				</div>

				<Button variant="outline" className="w-full">
					Add Recipient
				</Button>

				<div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
					<p className="text-sm text-blue-700 dark:text-blue-300">
						<strong>Tip:</strong> You can add multiple recipients for revenue
						sharing (e.g., 70% outlet, 30% journalist)
					</p>
				</div>
			</div>
		</div>
	);
}
