"use client";

import { Button } from "@tollbooth/ui/button";
import { useState } from "react";
import { erc20Abi, parseUnits } from "viem";
import {
	useAccount,
	useConnect,
	useSwitchChain,
	useWaitForTransactionReceipt,
	useWriteContract,
} from "wagmi";
import { baseSepolia } from "wagmi/chains";

const DEFAULT_USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;

interface FundWithWalletButtonProps {
	to: `0x${string}` | null | undefined;
	amount?: number; // in USDC units (not base units)
	tokenAddress?: `0x${string}`;
	decimals?: number;
}

export function FundWithWalletButton(props: FundWithWalletButtonProps) {
	const to = props.to;
	const amountValue = Number.isFinite(props.amount)
		? (props.amount as number)
		: 5;
	const tokenAddress = (props.tokenAddress ?? DEFAULT_USDC) as `0x${string}`;
	const decimalsValue = Number.isFinite(props.decimals)
		? (props.decimals as number)
		: 6;

	const { isConnected, chainId } = useAccount();
	const { connectors, connectAsync, status: connectStatus } = useConnect();
	const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
	const write = useWriteContract();
	const wait = useWaitForTransactionReceipt({ hash: write.data });

	const [error, setError] = useState<string | null>(null);

	const onClick = async (): Promise<void> => {
		setError(null);
		try {
			if (!isConnected) {
				const injected = connectors.find((c) => c.id === "injected");
				const connector = injected ?? connectors[0];
				if (!connector) {
					setError("No wallet connector available");
					return;
				}
				await connectAsync({ connector });
			}
			if (chainId !== baseSepolia.id) {
				await switchChainAsync({ chainId: baseSepolia.id });
			}
			if (!to) {
				setError("Missing destination address");
				return;
			}
			await write.writeContract({
				address: tokenAddress,
				abi: erc20Abi,
				functionName: "transfer",
				args: [to, parseUnits(String(amountValue), decimalsValue)],
			});
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to send");
		}
	};

	const isWorking =
		connectStatus === "pending" ||
		isSwitching ||
		write.isPending ||
		wait.isLoading;

	return (
		<div className="flex flex-col gap-2">
			<Button onClick={onClick} disabled={!to || isWorking}>
				{isWorking ? "Funding…" : `Fund ${amountValue} USDC`}
			</Button>
			{error && <div className="text-sm text-red-600">{error}</div>}
			{write.data && (
				<div className="text-xs text-muted-foreground break-all">
					Tx: {write.data}
				</div>
			)}
		</div>
	);
}
