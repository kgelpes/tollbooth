import { AsyncLocalStorage } from "node:async_hooks";
import { CdpClient } from "@coinbase/cdp-sdk";
import axios, { type AxiosInstance } from "axios";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
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

const requestContext = new AsyncLocalStorage<{ apiKey: string }>();
const getCurrentApiKey = (): string => {
  const store = requestContext.getStore();
  return store?.apiKey ?? "demo";
};

const accountCache = new Map<string, Promise<ReturnType<typeof toAccount>>>();
const getAccount = (): Promise<ReturnType<typeof toAccount>> => {
  const apiKey = getCurrentApiKey();
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
      let walletName = "x402";
      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        walletName = walletData.result ?? walletName;
      }

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
const getClientForBaseUrl = (baseURL: string): Promise<AxiosInstance> => {
  const apiKey = getCurrentApiKey();
  const cacheKey = `${baseURL}:${apiKey}`;
  let existing = clientCache.get(cacheKey);
  if (!existing) {
    existing = (async () => {
      const account = await getAccount();
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

const handler = createMcpHandler(
	(server) => {
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
        const client = await getClientForBaseUrl(resourceServerUrl);
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

const verifyToken = async (_req: Request, bearerToken?: string) => {
  if (!bearerToken) return undefined;
  // For demo: accept any non-empty token. In production, validate properly.
  return {
    token: bearerToken,
    scopes: ["read:x402"],
    clientId: "tollbooth-client",
  };
};

const authHandler = withMcpAuth(handler, verifyToken, {
  required: false,
  requiredScopes: ["read:x402"],
  resourceMetadataPath: "/.well-known/oauth-protected-resource",
});

const typedAuthHandler = authHandler as unknown as (
  req: Request,
) => Promise<Response>;

export async function GET(req: Request) {
  const authHeader =
    req.headers.get("authorization") ?? req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "demo";
  return requestContext.run({ apiKey: token }, () => typedAuthHandler(req));
}

export async function POST(req: Request) {
  const authHeader =
    req.headers.get("authorization") ?? req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "demo";
  return requestContext.run({ apiKey: token }, () => typedAuthHandler(req));
}

export async function DELETE(req: Request) {
  const authHeader =
    req.headers.get("authorization") ?? req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "demo";
  return requestContext.run({ apiKey: token }, () => typedAuthHandler(req));
}
