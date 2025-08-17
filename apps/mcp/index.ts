import { CdpClient } from "@coinbase/cdp-sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import { config } from "dotenv";
import { toAccount } from "viem/accounts";
import { withPaymentInterceptor } from "x402-axios";

// Load environment variables and throw an error if any are missing
config();

const apiKeyId = process.env.CDP_API_KEY_ID as string | undefined;
const apiKeySecret = process.env.CDP_API_KEY_SECRET as string | undefined;
const walletSecret = process.env.CDP_WALLET_SECRET as string | undefined;
const baseURL = process.env.RESOURCE_SERVER_URL as string; // e.g. https://example.com
const endpointPath = process.env.ENDPOINT_PATH as string; // e.g. /weather

if (!apiKeyId || !apiKeySecret || !walletSecret || !baseURL || !endpointPath) {
	throw new Error("Missing environment variables");
}

// Initialize CDP client and get or create the server wallet account
const cdp = new CdpClient();
const serverAccount = await cdp.evm.getOrCreateAccount({ name: "x402" });
const account = toAccount(serverAccount);

// Create an axios client with payment interceptor using x402-axios
const client = withPaymentInterceptor(axios.create({ baseURL }), account);

// Create an MCP server
const server = new McpServer({
	name: "x402 MCP Client Demo",
	version: "1.0.0",
});

// Add an addition tool
server.tool(
	"get-data-from-resource-server",
	"Get data from the resource server (in this example, the weather)", //change this description to change when the client calls the tool
	{},
	async () => {
		const res = await client.get(endpointPath);
		return {
			content: [{ type: "text", text: JSON.stringify(res.data) }],
		};
	},
);

const transport = new StdioServerTransport();
await server.connect(transport);
