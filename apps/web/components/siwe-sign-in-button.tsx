"use client";

import { Button } from "@tollbooth/ui/button";
import { useState } from "react";
import { authClient } from "../lib/authClient";

interface EthereumProvider {
	request: (args: { method: string; params: unknown[] }) => Promise<unknown>;
}

interface SiweSignInButtonProps {
	className?: string;
	label?: string;
}

export function SiweSignInButton(props: SiweSignInButtonProps) {
	const [loading, setLoading] = useState(false);
	const { isPending, refetch } = authClient.useSession();

	const onClick = async (): Promise<void> => {
		try {
			setLoading(true);
			const ethereum = (window as unknown as { ethereum?: EthereumProvider })
				.ethereum;
			if (!ethereum) {
				alert("Please install MetaMask or another Ethereum wallet");
				return;
			}

			const accountsRes = (await ethereum.request({
				method: "eth_requestAccounts",
				params: [],
			})) as string[];
			const address = accountsRes?.[0] ?? "";
			if (!address) {
				alert("No account selected");
				return;
			}

			const chainHex = (await ethereum.request({
				method: "eth_chainId",
				params: [],
			})) as string;
			const chainId = Number.parseInt(chainHex, 16);

			const { data: nonceData } = await authClient.siwe.nonce({
				walletAddress: address,
				chainId,
			});
			const nonce = nonceData?.nonce ?? "";
			if (!nonce) {
				alert("Failed to get nonce");
				return;
			}

			const domain = window.location.host;
			const uri = window.location.origin;
			const issuedAt = new Date().toISOString();
			const statement = "Sign in with Ethereum to access Tollbooth";

			const message = [
				`${domain} wants you to sign in with your Ethereum account:`,
				address,
				"",
				statement,
				"",
				`URI: ${uri}`,
				`Version: 1`,
				`Chain ID: ${chainId}`,
				`Nonce: ${nonce}`,
				`Issued At: ${issuedAt}`,
			].join("\n");

			const signatureResult = await ethereum.request({
				method: "personal_sign",
				params: [message, address],
			});
			const signature = Array.isArray(signatureResult)
				? (signatureResult[0] as string)
				: (signatureResult as string);

			const verifyRes = await authClient.siwe.verify({
				message,
				signature,
				walletAddress: address,
				chainId,
			});

			if (!verifyRes.data) {
				alert("Sign in failed");
				return;
			}
			// Force immediate session refresh for UI
			refetch();
		} catch (error) {
			console.error("SIWE sign-in error:", error);
			alert("Sign in failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Button
			onClick={() => void onClick()}
			disabled={loading || isPending}
			className={props.className}
		>
			{loading || isPending
				? "Signing in..."
				: (props.label ?? "Sign in with Ethereum")}
		</Button>
	);
}
