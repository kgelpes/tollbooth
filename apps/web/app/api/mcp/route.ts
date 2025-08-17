import { CdpClient } from "@coinbase/cdp-sdk";
import axios, { type AxiosInstance } from "axios";
import { createMcpHandler } from "mcp-handler";
import type { NextRequest } from "next/server";
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

export const runtime = "nodejs";

type RequiredEnvKey =
  | "CDP_API_KEY_ID"
  | "CDP_API_KEY_SECRET"
  | "CDP_WALLET_SECRET";

const requiredEnvKeys: RequiredEnvKey[] = [
	"CDP_API_KEY_ID",
	"CDP_API_KEY_SECRET",
  "CDP_WALLET_SECRET",
];

const accountCache = new Map<string, Promise<ReturnType<typeof toAccount>>>();
const getAccount = (apiKey: string): Promise<ReturnType<typeof toAccount>> => {
  let existing = accountCache.get(apiKey);
  if (!existing) {
    existing = (async () => {
      for (const key of requiredEnvKeys) {
        if (!process.env[key]) {
          throw new Error(`Missing required environment variable: ${key}`);
        }
      }

      // Fetch wallet name from get-server-wallet endpoint
      const walletResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/get-server-wallet?api_key=${encodeURIComponent(apiKey)}`,
      );
      if (!walletResponse.ok) {
        throw new Error(
          `Failed to get server wallet: ${walletResponse.status}`,
        );
      }
      const walletData = await walletResponse.json();
      const walletName = walletData.result;

      const cdp = new CdpClient();
      const serverAccount = await cdp.evm.getOrCreateAccount({
        name: walletName,
      });
      return toAccount(serverAccount);
    })();
    accountCache.set(apiKey, existing);
  }
  return existing;
};

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

let defaultApiKey: string | undefined = process.env.TOLLBOOTH_API_KEY;
// Temporary demo mechanism: capture a default API key from the MCP URL query
// (?apiKey or ?api_key) or from env. In production, prefer a proper
// authenticated per-user configuration rather than query parameters.
const updateDefaultApiKeyFromRequest = (req: NextRequest): void => {
  const url = new URL(req.url);
  const fromQuery =
    url.searchParams.get("apiKey") ?? url.searchParams.get("api_key");
  if (fromQuery) {
    defaultApiKey = fromQuery;
  }
};

const handler = createMcpHandler(
	(server) => {
		server.tool(
			"get-data-from-resource-server",
      "Get data from a resource server (pays via x402).",
      {
        apiKey: {
          type: "string",
          description: "API key for server wallet authentication",
        },
        resourceServerUrl: {
          type: "string",
          description: "URL of the resource server",
        },
        endpointPath: {
          type: "string",
          description: "Path to the endpoint on the resource server",
        },
      },
      async (args: {
        apiKey?: string;
        resourceServerUrl?: string;
        endpointPath?: string;
      }) => {
        const { apiKey, resourceServerUrl, endpointPath } = args;
        // If tool input omits apiKey, fall back to key captured from URL/env.
        // This is a temporary approach for the demo.
        const resolvedApiKey = apiKey ?? defaultApiKey;
        if (!resolvedApiKey) {
          throw new Error(
            "apiKey is required (pass as tool param or set via MCP URL ?apiKey=... or env TOLLBOOTH_API_KEY)",
          );
        }
        if (!resourceServerUrl || !endpointPath) {
          throw new Error("resourceServerUrl and endpointPath are required");
        }
        const client = await getClientForBaseUrl(
          resourceServerUrl,
          resolvedApiKey,
        );
        const res = await client.get(endpointPath);
				return {
          content: [{ type: "text", text: JSON.stringify(res.data) }],
				};
			},
		);
	},
	{},
	{ basePath: "/api" },
);

export async function GET(req: NextRequest, ctx: unknown) {
  updateDefaultApiKeyFromRequest(req);
  // @ts-expect-error - handler conforms to Next.js route handler signature
  return handler(req, ctx);
}

export async function POST(req: NextRequest, ctx: unknown) {
  updateDefaultApiKeyFromRequest(req);
  // @ts-expect-error - handler conforms to Next.js route handler signature
  return handler(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: unknown) {
  updateDefaultApiKeyFromRequest(req);
  // @ts-expect-error - handler conforms to Next.js route handler signature
  return handler(req, ctx);
}
