import { CdpClient } from "@coinbase/cdp-sdk";
import axios, { type AxiosInstance } from "axios";
import { createMcpHandler } from "mcp-handler";
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

let accountPromise: Promise<ReturnType<typeof toAccount>> | null = null;
const getAccount = (): Promise<ReturnType<typeof toAccount>> => {
  if (!accountPromise) {
    accountPromise = (async () => {
      for (const key of requiredEnvKeys) {
        if (!process.env[key]) {
          throw new Error(`Missing required environment variable: ${key}`);
        }
      }

      const cdp = new CdpClient();
      const serverAccount = await cdp.evm.getOrCreateAccount({ name: "x402" });
      return toAccount(serverAccount);
    })();
  }
  return accountPromise;
};

const clientCache = new Map<string, Promise<AxiosInstance>>();
const getClientForBaseUrl = (baseURL: string): Promise<AxiosInstance> => {
  let existing = clientCache.get(baseURL);
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
    clientCache.set(baseURL, existing);
  }
  return existing;
};

const handler = createMcpHandler(
	(server) => {
		server.tool(
			"get-data-from-resource-server",
      "Get data from a resource server (pays via x402).",
			{},
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

export { handler as GET, handler as POST, handler as DELETE };
