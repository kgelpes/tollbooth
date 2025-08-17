"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains";

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
	chains: [baseSepolia],
	transports: {
		[baseSepolia.id]: http(),
	},
});

export function Providers(props: { children: ReactNode }) {
	return (
		<WagmiProvider config={wagmiConfig}>
			<QueryClientProvider client={queryClient}>
				{props.children}
			</QueryClientProvider>
		</WagmiProvider>
	);
}
