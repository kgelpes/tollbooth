import { CdpClient } from "@coinbase/cdp-sdk";
import axios, { type AxiosInstance } from "axios";
import { createMcpHandler } from "mcp-handler";
import { toAccount } from "viem/accounts";
import { withPaymentInterceptor } from "x402-axios";

export const runtime = "nodejs";

type RequiredEnvKey =
  | "CDP_API_KEY_ID"
  | "CDP_API_KEY_SECRET"
  | "CDP_WALLET_SECRET"
  | "RESOURCE_SERVER_URL"
  | "ENDPOINT_PATH";

const requiredEnvKeys: RequiredEnvKey[] = [
	"CDP_API_KEY_ID",
	"CDP_API_KEY_SECRET",
	"CDP_WALLET_SECRET",
	"RESOURCE_SERVER_URL",
	"ENDPOINT_PATH",
];

let clientPromise: Promise<AxiosInstance> | null = null;
const getClient = (): Promise<AxiosInstance> => {
  if (!clientPromise) {
    clientPromise = (async () => {
      for (const key of requiredEnvKeys) {
        if (!process.env[key]) {
          throw new Error(`Missing required environment variable: ${key}`);
        }
      }

      const cdp = new CdpClient();
      const serverAccount = await cdp.evm.getOrCreateAccount({ name: "x402" });
      const account = toAccount(serverAccount);

      return withPaymentInterceptor(
        axios.create({ baseURL: process.env.RESOURCE_SERVER_URL as string }),
        account,
      );
    })();
  }
  return clientPromise;
};

const handler = createMcpHandler(
	(server) => {
		server.tool(
			"get-data-from-resource-server",
			"Get data from the resource server (e.g. weather)",
			{},
			async () => {
        const client = await getClient();
				const res = await client.get(process.env.ENDPOINT_PATH as string);
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
