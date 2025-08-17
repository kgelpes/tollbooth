import { PAYWALL_TEMPLATE } from "./x402/typescript/packages/x402/src/paywall/gen/template";
//"./paywall/gen/template";
// To generate the template go to: tollbooth/apps/pay-per-crawl-endpoints/custom-middleware/x402/typescript/packages/x402
// and run `npm run build:paywall`
import { config } from "./x402/typescript/packages/x402/src/types/shared/evm/config";
import type { PaymentRequirements } from "./x402/typescript/packages/x402/src/types/verify";

interface PaywallOptions {
	amount: number;
	paymentRequirements: PaymentRequirements[];
	currentUrl: string;
	testnet: boolean;
	cdpClientKey?: string;
	appName?: string;
	appLogo?: string;
	sessionTokenEndpoint?: string;
}

/**
 * Escapes a string for safe injection into JavaScript string literals
 *
 * @param str - The string to escape
 * @returns The escaped string
 */
function escapeString(str: string): string {
	return str
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		.replace(/'/g, "\\'")
		.replace(/\n/g, "\\n")
		.replace(/\r/g, "\\r")
		.replace(/\t/g, "\\t");
}

/**
 * Generates an HTML paywall page that allows users to pay for content access
 *
 * @param options - The options for generating the paywall
 * @param options.amount - The amount to be paid in USD
 * @param options.paymentRequirements - The payment requirements for the content
 * @param options.currentUrl - The URL of the content being accessed
 * @param options.testnet - Whether to use testnet or mainnet
 * @param options.cdpClientKey - CDP client API key for OnchainKit
 * @param options.appName - The name of the application to display in the wallet connection modal
 * @param options.appLogo - The logo of the application to display in the wallet connection modal
 * @param options.sessionTokenEndpoint - The API endpoint for generating session tokens for Onramp authentication
 * @returns An HTML string containing the paywall page
 */
export function getPaywallHtml({
	amount,
	testnet,
	paymentRequirements,
	currentUrl,
	cdpClientKey,
	appName,
	appLogo,
	sessionTokenEndpoint,
}: PaywallOptions): string {
	const logOnTestnet = testnet
		? "console.log('Payment requirements initialized:', window.x402);"
		: "";

	// Create the configuration script to inject with proper escaping
	const configScript = `
  <script>
    window.x402 = {
      amount: ${amount},
      paymentRequirements: ${JSON.stringify(paymentRequirements)},
      testnet: ${testnet},
      currentUrl: "${escapeString(currentUrl)}",
      config: {
        chainConfig: ${JSON.stringify({
					[base.id]: getUsdcChainConfigForChain(base.id),
					[baseSepolia.id]: getUsdcChainConfigForChain(baseSepolia.id),
				})},
      },
      cdpClientKey: "${escapeString(cdpClientKey || "")}",
      appName: "${escapeString(appName || "")}",
      appLogo: "${escapeString(appLogo || "")}",
      sessionTokenEndpoint: "${escapeString(sessionTokenEndpoint || "")}",
    };
    ${logOnTestnet}
  </script>`;

	// Inject the configuration script into the head
	return PAYWALL_TEMPLATE.replace("</head>", `${configScript}\n</head>`);
}
