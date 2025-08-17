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
import { privateKeyToAccount, toAccount } from "viem/accounts";
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

const requestContext = new AsyncLocalStorage<{
  apiKey: string;
  origin?: string;
}>();
const getCurrentApiKey = (): string => {
  const store = requestContext.getStore();
  return store?.apiKey ?? "demo";
};
const getCurrentOrigin = (): string | undefined => {
  const store = requestContext.getStore();
  return store?.origin;
};

type SupportedAccount = ReturnType<typeof toAccount> | LocalAccount;
const accountCache = new Map<string, Promise<SupportedAccount>>();
const getAccount = (): Promise<SupportedAccount> => {
  const apiKey = getCurrentApiKey();
  let existing = accountCache.get(apiKey);
  if (!existing) {
    existing = (async () => {
      const hasAllCdpEnv = requiredEnvKeys.every((k) =>
        Boolean(process.env[k]),
      );
      const privateKey =
        process.env.PRIVATE_KEY ||
        process.env.RESOURCE_SIGNER_PRIVATE_KEY ||
        "";

      // Preferred: use Coinbase CDP server wallet when env is configured
      if (hasAllCdpEnv) {
        // Fetch wallet name from get-server-wallet endpoint
        const origin = getCurrentOrigin();
        const base =
          origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const walletResponse = await fetch(
          `${base}/api/get-server-wallet?api_key=${encodeURIComponent(apiKey)}`,
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
      }

      // Fallback: use a local private key signer when CDP env is not present
      if (privateKey) {
        const normalized = privateKey.startsWith("0x")
          ? privateKey
          : `0x${privateKey}`;
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
        let { resourceServerUrl, endpointPath } = args;
        resourceServerUrl =
          resourceServerUrl ||
          process.env.RESOURCE_SERVER_URL ||
          process.env.NEXT_PUBLIC_RESOURCE_SERVER_URL ||
          "";
        endpointPath =
          endpointPath || process.env.ENDPOINT_PATH || "/protected";
        if (!resourceServerUrl) {
          throw new Error(
            "resourceServerUrl is required (pass as arg or set RESOURCE_SERVER_URL env)",
          );
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

function extractToken(req: Request): string {
  const authHeader =
    req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }
  try {
    const url = new URL(req.url);
    const qp =
      url.searchParams.get("apiKey") || url.searchParams.get("api_key");
    if (qp && qp.trim().length > 0) return qp.trim();
  } catch {
    // ignore
  }
  return "demo";
}

export async function GET(req: Request) {
  const token = extractToken(req);
  const origin = (() => {
    try {
      return new URL(req.url).origin;
    } catch {
      return undefined;
    }
  })();
  return requestContext.run({ apiKey: token, origin }, () =>
    typedAuthHandler(req),
  );
}

export async function POST(req: Request) {
  const token = extractToken(req);
  const origin = (() => {
    try {
      return new URL(req.url).origin;
    } catch {
      return undefined;
    }
  })();
  return requestContext.run({ apiKey: token, origin }, () =>
    typedAuthHandler(req),
  );
}

export async function DELETE(req: Request) {
  const token = extractToken(req);
  const origin = (() => {
    try {
      return new URL(req.url).origin;
    } catch {
      return undefined;
    }
  })();
  return requestContext.run({ apiKey: token, origin }, () =>
    typedAuthHandler(req),
  );
}
