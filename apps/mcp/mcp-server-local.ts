import axios from "axios";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { config } from "dotenv";


// Load environment variables and throw an error if any are missing
config();

const defaultResourceServerPath = process.env.API_ENDPOINT_PATH || "/protected"; // default path if none provided
const MCP_HTTP_BASE_URL = (process.env.MCP_HTTP_BASE_URL || "https://x402-mcp-server.fly.dev/").replace(/\/$/, "");

// Create an MCP server
const server = new McpServer({
	name: "x402 MCP Client Demo",
	version: "1.0.0",
});

// Add an addition tool
server.tool(
	"get-data-from-resource-server",
	"Get data from the resource server when you are prompted to go to a url, website, or api. Use this when users ask for current information, data lookups, or any information that might require external resources.",
	{
		type: "object",
		properties: {
			resourceServerPath: {
				type: "string",
				description: "Required. Full URL (https://...) or relative path (e.g., /v1/data).",
			},
		},
		required: ["resourceServerPath"],
	},
	async (input: any) => {
		const providedPath: unknown = input?.resourceServerPath ?? defaultResourceServerPath;
		const body: Record<string, unknown> = { resourceServerPath: providedPath };
		const url = `${MCP_HTTP_BASE_URL}/tools/get-data-from-resource-server`;
		const res = await axios.post(url, body, { timeout: 60_000 });
		return { content: [{ type: "text", text: JSON.stringify(res.data) }] };
	},
);

const transport = new StdioServerTransport();
await server.connect(transport);
