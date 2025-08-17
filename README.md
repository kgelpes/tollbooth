# ToolBooth: ETHGlobal New York

This is the repository for the Coinbase challenge at ETHGlobal New York. The project, named **ToolBooth**, uses **x402** to restrict content access to genuine users, similar to the concept of "pay-per-crawl."

Our proof-of-concept (PoC) allows users to access a resource by completing a captcha without payment. If the captcha fails or a bot attempts access, the only way to proceed is by transacting a specific amount on the Base network. We've also implemented an **expiration date** for access, requiring users to pay again once the period expires. Additionally, a subscription-based mechanism is fully implemented on-chain using Flow callback scheduler.

The repository includes:

  * A **web app** for configuring endpoints and pricing.
  * An **MCP server** that enables an agent to access and automatically pay for content using CDP wallet abstraction.
  * A **simple web app** with custom middleware that displays content only after a captcha is solved or a fee is paid.

-----

## Running the Repository

To build the code, we use **Turborepo**. Run the following command:
`pnpm exec turbo build`

-----

## Web App for Configuring Endpoints and Pricing

-----

## MCP Server

To set up the MCP server, configure the following environment variables in a `.env` file:

```
RESOURCE_SERVER_URL=http://localhost:3002
ENDPOINT_PATH=/protected
NETWORK=base-sepolia
FACILITATOR_URL=https://x402.org/facilitator

CDP_API_KEY_ID=xxx
CDP_API_KEY_SECRET=xxx
CDP_WALLET_SECRET=xxx
```
mcp.json:
```

{
  "mcpServers": {
    "testing": {
      "command": "pnpm",
      "args": [
        "-C",
        "/Users/ajrafmannan/Downloads/mcp_deploy", // replace with absolute path
        "mcp"
      ],
      "env": {
        "API_ENDPOINT_PATH": "/protected",
        "MCP_HTTP_BASE_URL": "https://x402-mcp-server.fly.dev" // change this to our deployed url

      }
    }
  } }
```
-----

## Captcha Web App

The captcha web app has a `/protected` endpoint that is accessible only if the user solves a captcha. If the captcha is not solved, a payment prompt appears. If the payment is successful, the page remains visible for the duration specified by the `expirationTime` field in the middleware configuration.

To get started, set up the following environment variables in a `.env` file:

```
NEXT_PUBLIC_FACILITATOR_URL=https://x402.org/facilitator
NETWORK=base-sepolia
RESOURCE_WALLET_ADDRESS=0x
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```
