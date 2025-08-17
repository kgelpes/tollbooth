import { Button } from "@tollbooth/ui/button";
import { Wallet } from "lucide-react";
import { useState } from "react";
import { useBalance } from "wagmi";
import { useOnramp } from "../../hooks/useOnramp";
import { useServerWallet } from "../../hooks/useServerWallet";
import { FundWithWalletButton } from "./fund-with-wallet-button";
import type { StepProps } from "./types";

const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;

export function PaymentSetup({ onSubmit }: StepProps) {
	const { address, isLoading, isError, error, create, isCreating } =
		useServerWallet();
	const [copied, setCopied] = useState(false);
	const {
		open,
		isOpening,
		isError: isOnrampError,
		error: onrampError,
	} = useOnramp();

	const nativeBalance = useBalance({
		address: (address as `0x${string}`) || undefined,
		query: { enabled: Boolean(address) },
	});
	const usdcBalance = useBalance({
		address: (address as `0x${string}`) || undefined,
		token: USDC_ADDRESS,
		query: { enabled: Boolean(address) },
	});

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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({
			walletAddress: address,
			hasWallet: Boolean(address),
		});
	};



	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="text-center space-y-2">
				<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
					<Wallet className="w-8 h-8 text-primary" />
				</div>
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
									<Button
										size="sm"
										onClick={() =>
											open({
												assets: ["USDC"],
												defaultNetwork: "base",
												presetFiatAmount: 25,
											})
										}
										disabled={!address || isOpening}
									>
										{isOpening ? "Opening…" : "Fund via Coinbase Onramp"}
									</Button>
								</div>
								<div className="text-sm text-muted-foreground">
									Balance:{" "}
									{nativeBalance.isLoading
										? "…"
										: (nativeBalance.data?.formatted ?? "0")}{" "}
									{nativeBalance.data?.symbol ?? "ETH"}
								</div>
								<div className="text-sm text-muted-foreground">
									USDC:{" "}
									{usdcBalance.isLoading
										? "…"
										: (usdcBalance.data?.formatted ?? "0")}{" "}
									{usdcBalance.data?.symbol ?? "USDC"}
								</div>
								<FundWithWalletButton
									to={address as `0x${string}`}
									tokenAddress={USDC_ADDRESS}
									amount={5}
								/>
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
						{isOnrampError && (
							<div className="mt-2 text-sm text-red-600">{onrampError}</div>
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

			{/* Buttons handled by parent component */}
		</form>
	);
}
