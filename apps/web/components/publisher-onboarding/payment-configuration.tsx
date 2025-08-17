"use client";

import { Input } from "@tollbooth/ui/components/input";
import { Label } from "@tollbooth/ui/components/label";
import { DollarSign } from "lucide-react";
import { useId, useState } from "react";
import type { StepProps } from "./types";

export function PaymentConfiguration({
	onSubmit,
	initialData,
}: StepProps) {
	const baseFeeId = useId();
	const [baseFee, setBaseFee] = useState(
		((initialData?.baseFee as number) || 0.01).toString(),
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({ baseFee: parseFloat(baseFee) });
	};

	// Validation handled by parent component

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
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
					<Label htmlFor={baseFeeId}>Base Fee (USDC)</Label>
					<Input
						id={baseFeeId}
						type="number"
						step="0.001"
						min="0.001"
						placeholder="0.01"
						value={baseFee}
						onChange={(e) => setBaseFee(e.target.value)}
						required
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

			{/* Buttons handled by parent component */}
		</form>
	);
}
