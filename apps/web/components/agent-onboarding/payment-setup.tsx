import { Button } from "@tollbooth/ui/button";
import { useState } from "react";
import { useServerWallet } from "../../hooks/useServerWallet";
import type { StepProps } from "./types";

export function PaymentSetup(_: StepProps) {
	const { address, isLoading, isError, error, create, isCreating } =
		useServerWallet();
	const [copied, setCopied] = useState(false);

	const copyAddress = async () => {
		if (!address) return;
		try {
			await navigator.clipboard.writeText(address);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			// noop
		}
	};

	return (
		<div className="space-y-6">
			<div className="text-center space-y-2">
				<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto" />
				<h2 className="text-2xl font-semibold">Payment Setup</h2>
				<p className="text-muted-foreground">Configure payment options</p>
			</div>

			<div className="space-y-4">
				<div className="space-y-4">
					<div className="p-6 border rounded-lg">
						{isLoading ? (
							<div className="text-sm text-muted-foreground">
								Loading server wallet…
							</div>
						) : address ? (
							<div className="space-y-3">
								<div className="text-sm text-muted-foreground">
									Your server wallet
								</div>
								<div className="flex items-center gap-2">
									<code className="px-2 py-1 rounded bg-muted text-xs break-all">
										{address}
									</code>
									<Button variant="outline" size="sm" onClick={copyAddress}>
										{copied ? "Copied" : "Copy"}
									</Button>
								</div>
							</div>
						) : (
							<div className="space-y-3">
								<div className="text-sm text-muted-foreground">
									No server wallet found for your account.
								</div>
								<Button onClick={() => create()} disabled={isCreating}>
									{isCreating ? "Creating…" : "Create server wallet"}
								</Button>
							</div>
						)}
						{isError && (
							<div className="mt-2 text-sm text-red-600">{error}</div>
						)}
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
