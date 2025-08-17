"use client";

import type { StepProps } from "./types";

export function PaymentSetup({ onNext, onBack }: StepProps) {
	return (
		<div className="space-y-6">
			<div className="text-center space-y-2">
				<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto" />
				<h2 className="text-2xl font-semibold">Payment Setup</h2>
				<p className="text-muted-foreground">Configure payment options</p>
			</div>

			<div className="space-y-4">
				<div className="text-center space-y-4">
					<div className="p-6 border-2 border-dashed rounded-lg text-sm text-muted-foreground">
						Payment connector will appear here.
					</div>

					<div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-left">
						<h4 className="text-blue-700 dark:text-blue-300 mb-2 font-medium">
							About x402 Protocol
						</h4>
						<p className="text-sm text-blue-600 dark:text-blue-400">
							x402 is a new HTTP status code that allows websites to request
							payment for access. Tollbooth automatically handles these requests
							so your agents can continue working seamlessly.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
