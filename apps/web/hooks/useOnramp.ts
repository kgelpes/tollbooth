"use client";

import { useMutation } from "@tanstack/react-query";

export interface OpenOnrampParams {
	assets?: readonly string[];
	defaultNetwork?: string;
	presetFiatAmount?: number;
	defaultAsset?: string;
	presetCryptoAmount?: number;
}

export function useOnramp() {
	const open = useMutation<{ url: string }, Error, OpenOnrampParams | undefined>({
		mutationFn: async (params?: OpenOnrampParams) => {
			const res = await fetch("/api/onramp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					assets: params?.assets ? [...params.assets] : ["USDC"],
					defaultNetwork: params?.defaultNetwork ?? "base-sepolia",
					presetFiatAmount: params?.presetFiatAmount,
					defaultAsset: params?.defaultAsset,
					presetCryptoAmount: params?.presetCryptoAmount,
				}),
			});
			if (!res.ok) {
				const maybe = (await res.json().catch(() => null)) as
					| { error?: string }
					| null;
				const message =
					typeof maybe?.error === "string" ? maybe.error : `HTTP ${res.status}`;
				throw new Error(message);
			}
			const json = (await res.json()) as { url: string };
			return { url: json.url };
		},
		onSuccess: ({ url }) => {
			window.open(url, "_blank", "noopener,noreferrer");
		},
	});

	return {
		open: async (params?: OpenOnrampParams) => open.mutateAsync(params),
		isOpening: open.isPending,
		error: open.error?.message ?? null,
		isError: open.isError,
	} as const;
}


