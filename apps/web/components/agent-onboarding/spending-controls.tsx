"use client";

import { Button } from "@tollbooth/ui/button";
import { Input } from "@tollbooth/ui/components/input";
import { Label } from "@tollbooth/ui/components/label";
import { Shield } from "lucide-react";
import type { StepProps } from "./types";

export function SpendingControls({ onNext, onBack }: StepProps) {
	return (
		<div className="space-y-6">
			<div className="text-center space-y-2">
				<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
					<Shield className="w-8 h-8 text-primary" />
				</div>
				<h2 className="text-2xl font-semibold">Spending Controls</h2>
				<p className="text-muted-foreground">
					Set limits to control your agent's spending
				</p>
			</div>

			<div className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label>Daily Limit (USDC)</Label>
						<Input
							type="number"
							step="0.01"
							placeholder="10.00"
							defaultValue="10.00"
						/>
					</div>

					<div className="space-y-2">
						<Label>Monthly Limit (USDC)</Label>
						<Input
							type="number"
							step="0.01"
							placeholder="200.00"
							defaultValue="200.00"
						/>
					</div>
				</div>

				<div className="space-y-3">
					<Label>Whitelisted Domains (Optional)</Label>
					<div className="flex gap-2">
						<Input placeholder="example.com" defaultValue="" />
					</div>
					<Button variant="outline" className="w-full">
						Add Domain
					</Button>
					<p className="text-sm text-muted-foreground">
						Only spend on these domains. Leave empty to allow all domains.
					</p>
				</div>

				<div className="p-4 bg-muted/50 rounded-lg space-y-3">
					<h4 className="font-medium">Recommended Limits</h4>
					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span>Light usage:</span>
							<span>5.00 USDC/day, 100 USDC/month</span>
						</div>
						<div className="flex justify-between">
							<span>Moderate usage:</span>
							<span>10.00 USDC/day, 200 USDC/month</span>
						</div>
						<div className="flex justify-between">
							<span>Heavy usage:</span>
							<span>50.00 USDC/day, 1000 USDC/month</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
