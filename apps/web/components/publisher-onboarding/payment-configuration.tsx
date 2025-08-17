"use client";

import { Input } from "@tollbooth/ui/components/input";
import { Label } from "@tollbooth/ui/components/label";
import { DollarSign } from "lucide-react";
import type { StepProps } from "./types";

export function PaymentConfiguration({ onNext, onBack }: StepProps) {
	return (
		<div className="space-y-6">
			<div className="text-center space-y-2">
				<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
					<DollarSign className="w-8 h-8 text-primary" />
				</div>
				<h2 className="text-2xl font-semibold">Payment Configuration</h2>
				<p className="text-muted-foreground">
					Set your base fee and payment rules
				</p>
			</div>

			<div className="space-y-4">
				<div className="space-y-2">
					<Label>Base Fee (USDC)</Label>
					<Input
						type="number"
						step="0.001"
						placeholder="0.01"
						defaultValue="0.01"
					/>
					<p className="text-sm text-muted-foreground">
						This is the default fee charged for automated requests
					</p>
				</div>

				<div className="p-4 bg-muted/50 rounded-lg space-y-3">
					<h4 className="font-medium">Fee Examples</h4>
					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span>News articles:</span>
							<span>1.00 - 5.00 USDC</span>
						</div>
						<div className="flex justify-between">
							<span>API endpoints:</span>
							<span>0.10 - 1.00 USDC</span>
						</div>
						<div className="flex justify-between">
							<span>Premium content:</span>
							<span>5.00 - 10.00 USDC</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
