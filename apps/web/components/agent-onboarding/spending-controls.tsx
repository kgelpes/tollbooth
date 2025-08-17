"use client";

import { Button } from "@tollbooth/ui/button";
import { Input } from "@tollbooth/ui/components/input";
import { Label } from "@tollbooth/ui/components/label";
import { Shield, X } from "lucide-react";
import { useId, useState } from "react";
import type { StepProps } from "./types";

export function SpendingControls({ onSubmit, initialData }: StepProps) {
	const dailyLimitId = useId();
	const monthlyLimitId = useId();
	const [dailyLimit, setDailyLimit] = useState(
		(initialData?.dailyLimit as string) || "10.00",
	);
	const [monthlyLimit, setMonthlyLimit] = useState(
		(initialData?.monthlyLimit as string) || "200.00",
	);
	const [whitelistedDomains, setWhitelistedDomains] = useState<string[]>(
		(initialData?.whitelistedDomains as string[]) || [],
	);
	const [newDomain, setNewDomain] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({
			dailyLimit: parseFloat(dailyLimit),
			monthlyLimit: parseFloat(monthlyLimit),
			whitelistedDomains,
		});
	};

	const addDomain = () => {
		if (newDomain.trim() && !whitelistedDomains.includes(newDomain.trim())) {
			setWhitelistedDomains([...whitelistedDomains, newDomain.trim()]);
			setNewDomain("");
		}
	};

	const removeDomain = (domain: string) => {
		setWhitelistedDomains(whitelistedDomains.filter((d) => d !== domain));
	};

	// Validation handled by parent component

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
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
						<Label htmlFor={dailyLimitId}>Daily Limit (USDC)</Label>
						<Input
							id={dailyLimitId}
							type="number"
							step="0.01"
							min="0.01"
							placeholder="10.00"
							value={dailyLimit}
							onChange={(e) => setDailyLimit(e.target.value)}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor={monthlyLimitId}>Monthly Limit (USDC)</Label>
						<Input
							id={monthlyLimitId}
							type="number"
							step="0.01"
							min="0.01"
							placeholder="200.00"
							value={monthlyLimit}
							onChange={(e) => setMonthlyLimit(e.target.value)}
							required
						/>
					</div>
				</div>

				<div className="space-y-3">
					<Label>Whitelisted Domains (Optional)</Label>
					<div className="flex gap-2">
						<Input
							placeholder="example.com"
							value={newDomain}
							onChange={(e) => setNewDomain(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addDomain();
								}
							}}
						/>
						<Button type="button" variant="outline" onClick={addDomain}>
							Add
						</Button>
					</div>
					{whitelistedDomains.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{whitelistedDomains.map((domain) => (
								<div
									key={domain}
									className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
								>
									{domain}
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="h-4 w-4 p-0"
										onClick={() => removeDomain(domain)}
									>
										<X className="h-3 w-3" />
									</Button>
								</div>
							))}
						</div>
					)}
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

			{/* Buttons handled by parent component */}
		</form>
	);
}
