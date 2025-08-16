import type { Address } from "viem";
import { type Network, paymentMiddleware, type Resource } from "./custom-middleware";

const facilitatorUrl = process.env.NEXT_PUBLIC_FACILITATOR_URL as Resource;
const payTo = process.env.RESOURCE_WALLET_ADDRESS as Address;
const network = process.env.NETWORK as Network;

export const middleware = paymentMiddleware(
	payTo,
	{
		"/protected": {
			price: "$0.001",
			network,
			config: {
				description: "Access to protected content",
				customPaywallHtml: "<h1>Ciao</h1>"
			},
		},
	},
	{
		url: facilitatorUrl,
	},
	{
		appName: "Next x402 Demo",
		appLogo: "/x402-icon-blue.png",
	},
);

// Configure which paths the middleware should run on
export const config = {
	matcher: ["/protected/:path*"],
};
