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
import { toAccount } from "viem/accounts";
import { base } from "viem/chains";
import { withPaymentInterceptor } from "x402-axios";

config();

// Required env: User token to map to a server wallet name
const userToken = process.env.TOLLBOOTH_API_KEY as string | undefined;
if (!userToken) {
	throw new Error("Missing TOLLBOOTH_API_KEY env var");
}

// Optional envs
const DASHBOARD_BASE_URL =
	(process.env.TOLLBOOTH_DASHBOARD_URL as string | undefined) ||
	"http://localhost:3000";

// Resolve and cache the account by user token
const accountCache = new Map<string, Promise<ReturnType<typeof toAccount>>>();
const getAccount = (apiKey: string): Promise<ReturnType<typeof toAccount>> => {
	let existing = accountCache.get(apiKey);
	if (!existing) {
		existing = (async () => {
			const cdp = new CdpClient();
			const walletResponse = await fetch(
				`${DASHBOARD_BASE_URL}/api/get-server-wallet?api_key=${encodeURIComponent(apiKey)}`,
			);
			if (!walletResponse.ok) {
				throw new Error(
					`Failed to resolve server wallet: ${walletResponse.status}`,
				);
			}
			const walletData = (await walletResponse.json()) as { result: string };
			const walletName = walletData.result;
			const serverAccount = await cdp.evm.getOrCreateAccount({
				name: walletName,
			});
			return toAccount(serverAccount);
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
