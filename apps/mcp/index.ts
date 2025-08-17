#!/usr/bin/env node
import { CdpClient } from "@coinbase/cdp-sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios, { type AxiosInstance } from "axios";
import { config } from "dotenv";
import type {
	Account,
	Chain,
	Client,
	LocalAccount,
	PublicActions,
	RpcSchema,
	Transport,
	WalletActions,
} from "viem";
import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount, toAccount } from "viem/accounts";
import { base } from "viem/chains";
import { withPaymentInterceptor } from "x402-axios";

config();

// Optional env: user token to map to a server wallet name. Defaults to "demo".
const userToken =
	(process.env.TOLLBOOTH_API_KEY as string | undefined) ?? "demo";

// Optional envs
const DASHBOARD_BASE_URL =
	(process.env.TOLLBOOTH_DASHBOARD_URL as string | undefined) ||
	"http://localhost:3000";

// Resolve and cache the account by user token
const accountCache = new Map<string, Promise<Account>>();
const getAccount = (apiKey: string): Promise<Account> => {
	let existing = accountCache.get(apiKey);
	if (!existing) {
		existing = (async () => {
			const hasAllCdpEnv =
				Boolean(process.env.CDP_API_KEY_ID) &&
				Boolean(process.env.CDP_API_KEY_SECRET) &&
				Boolean(process.env.CDP_WALLET_SECRET);

			const pkEnv =
				process.env.PRIVATE_KEY || process.env.RESOURCE_SIGNER_PRIVATE_KEY;

			if (hasAllCdpEnv) {
				const cdp = new CdpClient();
				let walletName = "x402";
				try {
					const walletResponse = await fetch(
						`${DASHBOARD_BASE_URL}/api/get-server-wallet?api_key=${encodeURIComponent(apiKey)}`,
					);
					if (walletResponse.ok) {
						const walletData = (await walletResponse.json()) as {
							result?: string;
						};
						if (walletData.result) walletName = walletData.result;
					}
				} catch {
					// ignore and keep default wallet name
				}
				const serverAccount = await cdp.evm.getOrCreateAccount({
					name: walletName,
				});
				return toAccount(serverAccount);
			}

			if (pkEnv) {
				const normalized = pkEnv.startsWith("0x") ? pkEnv : `0x${pkEnv}`;
				return privateKeyToAccount(normalized as `0x${string}`);
			}

			throw new Error(
				"No signer configured. Provide CDP credentials (CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET) or a PRIVATE_KEY.",
			);
		})();
		accountCache.set(apiKey, existing);
	}
	return existing;
};

// Cache axios clients per baseURL+token
const clientCache = new Map<string, Promise<AxiosInstance>>();
const getClientForBaseUrl = (
	baseURL: string,
	apiKey: string,
): Promise<AxiosInstance> => {
	const cacheKey = `${baseURL}:${apiKey}`;
	let existing = clientCache.get(cacheKey);
	if (!existing) {
		existing = (async () => {
			const account = await getAccount(apiKey);
			const signer = createWalletClient({
				account,
				chain: base,
				transport: http(),
			}).extend(publicActions);
			type ViemSignerWallet = Client<
				Transport,
				Chain,
				Account,
				RpcSchema,
				PublicActions<Transport, Chain, Account> & WalletActions<Chain, Account>
			>;
			type X402Wallet = ViemSignerWallet | LocalAccount;
			return withPaymentInterceptor(
				axios.create({ baseURL }),
				signer as unknown as X402Wallet,
			);
		})();
		clientCache.set(cacheKey, existing);
	}
	return existing;
};

// Create an MCP server
const server = new McpServer({
	name: "tollbooth-mcp-proxy",
	version: "1.0.0",
});

server.tool(
	"get-data-from-resource-server",
	"Get data from a resource server (pays via x402).",
	{
		resourceServerUrl: {
			type: "string",
			description: "URL of the resource server",
		},
		endpointPath: {
			type: "string",
			description: "Path to the endpoint on the resource server",
		},
	},
	async (args: { resourceServerUrl?: string; endpointPath?: string }) => {
		const { resourceServerUrl, endpointPath } = args;
		if (!resourceServerUrl || !endpointPath) {
			throw new Error("resourceServerUrl and endpointPath are required");
		}
		const client = await getClientForBaseUrl(resourceServerUrl, userToken);
		const res = await client.get(endpointPath);
		return {
			content: [{ type: "text", text: JSON.stringify(res.data) }],
		};
	},
);

const transport = new StdioServerTransport();
await server.connect(transport);
