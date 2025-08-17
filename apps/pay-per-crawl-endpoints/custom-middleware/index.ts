import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { type Address, getAddress } from "viem";
import { exact } from "x402/schemes";
import {
  computeRoutePatterns,
  findMatchingPaymentRequirements,
  findMatchingRoute,
  processPriceToAtomicAmount,
  safeBase64Encode,
  toJsonSafe,
} from "x402/shared";
import {
  type FacilitatorConfig,
  moneySchema,
  type PaymentMiddlewareConfig,
  type PaymentPayload,
  type PaymentRequirements,
  type PaywallConfig,
  type Resource,
  type RoutesConfig,
} from "x402/types";
import { useFacilitator } from "x402/verify";
import { POST } from "./api/session-token";
import { getPaywallHtml } from "./paywall";

/**
 * Creates a payment middleware factory for Next.js
 *
 * @param payTo - The address to receive payments
 * @param routes - Configuration for protected routes and their payment requirements
 * @param facilitator - Optional configuration for the payment facilitator service
 * @param paywall - Optional configuration for the default paywall
 * @returns A Next.js middleware handler
 *
 * @example
 * ```typescript
 * // Simple configuration - All endpoints are protected by $0.01 of USDC on base-sepolia
 * export const middleware = paymentMiddleware(
 *   '0x123...', // payTo address
 *   {
 *     price: '$0.01', // USDC amount in dollars
 *     network: 'base-sepolia'
 *   },
 *   // Optional facilitator configuration. Defaults to x402.org/facilitator for testnet usage
 * );
 *
 * // Advanced configuration - Endpoint-specific payment requirements & custom facilitator
 * export const middleware = paymentMiddleware(
 *   '0x123...', // payTo: The address to receive payments
 *   {
 *     '/protected/*': {
 *       price: '$0.001', // USDC amount in dollars
 *       network: 'base',
 *       config: {
 *         description: 'Access to protected content'
 *       }
 *     },
 *     '/api/premium/*': {
 *       price: {
 *         amount: '100000',
 *         asset: {
 *           address: '0xabc',
 *           decimals: 18,
 *           eip712: {
 *             name: 'WETH',
 *             version: '1'
 *           }
 *         }
 *       },
 *       network: 'base'
 *     }
 *   },
 *   {
 *     url: 'https://facilitator.example.com',
 *     createAuthHeaders: async () => ({
 *       verify: { "Authorization": "Bearer token" },
 *       settle: { "Authorization": "Bearer token" }
 *     })
 *   },
 *   {
 *     cdpClientKey: 'your-cdp-client-key',
 *     appLogo: '/images/logo.svg',
 *     appName: 'My App',
 *   }
 * );
 * ```
 */
export function paymentMiddleware(
  payTo: Address,
  routes: RoutesConfig,
  facilitator?: FacilitatorConfig,
  paywall?: PaywallConfig,
) {
  const { verify, settle } = useFacilitator(facilitator);
  const x402Version = 1;

  // Pre-compile route patterns to regex and extract verbs
  const routePatterns = computeRoutePatterns(routes);

  return async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const method = request.method.toUpperCase();
    const captcha = request.nextUrl.searchParams.get("captcha");

    // Find matching route configuration
    const matchingRoute = findMatchingRoute(routePatterns, pathname, method);

    if (!matchingRoute || captcha == "success") {
      return NextResponse.next();
    }

    const { price, network, config = {} } = matchingRoute.config;
    const {
      description,
      mimeType,
      maxTimeoutSeconds,
      inputSchema,
      outputSchema,
      customPaywallHtml,
      resource,
      errorMessages,
    } = config as PaymentMiddlewareConfig;

    const atomicAmountForAsset = processPriceToAtomicAmount(price, network);
    if ("error" in atomicAmountForAsset) {
      return new NextResponse(atomicAmountForAsset.error, { status: 500 });
    }
    const { maxAmountRequired, asset } = atomicAmountForAsset;

    const resourceUrl =
      resource ||
      (`${request.nextUrl.protocol}//${request.nextUrl.host}${pathname}` as Resource);

    const paymentRequirements: PaymentRequirements[] = [
      {
        scheme: "exact",
        network,
        maxAmountRequired,
        resource: resourceUrl,
        description: description ?? "",
        mimeType: mimeType ?? "application/json",
        payTo: getAddress(payTo),
        maxTimeoutSeconds: maxTimeoutSeconds ?? 300,
        asset: getAddress(asset.address),
        // TODO: Rename outputSchema to requestStructure
        outputSchema: {
          input: {
            type: "http",
            method,
            ...inputSchema,
          },
          output: outputSchema,
        },
        extra: asset.eip712,
      },
    ];

    // Check for payment header
    const paymentHeader = request.headers.get("X-PAYMENT");
    // const paymentHeader = "eyJ4NDAyVmVyc2lvbiI6MSwic2NoZW1lIjoiZXhhY3QiLCJuZXR3b3JrIjoiYmFzZS1zZXBvbGlhIiwicGF5bG9hZCI6eyJzaWduYXR1cmUiOiIweDY4MTJkYzM2ODEzNDMzNTI0ODc2M2FjMWM0M2I0MDIyODlhZWFhYWFkMGNjM2IwMjIyNjc0OTQ5MDc3YzVjZjgzYWYxMjU2ZGY2ZTA0ZDhkYzFiMjY0N2NmN2E0OWM1ZGMyYzUyNDVkMzU4MGZiYTFkYTMxODA3YzlmZTYzZTA2MWIiLCJhdXRob3JpemF0aW9uIjp7ImZyb20iOiIweDdBOEU3OWRFNjNjMjljM2VlMjM3NUNkM0QyZTkwRkVhQTVhQWYzMjIiLCJ0byI6IjB4M2FlRTgxMDhkMDQwOTBmNjhkMTZkMUFjOUJkOGU0NDU5RDM5MDAzZSIsInZhbHVlIjoiMTAwMCIsInZhbGlkQWZ0ZXIiOiIxNzU1MzcyMTA1IiwidmFsaWRCZWZvcmUiOiIxNzU1MzczMDA1Iiwibm9uY2UiOiIweDQ3YzExMWIyYjAwNmViMjdjN2IyMGUwYjJjNzkzNDgxNjVhNGQ5NzMzODgwMjFiMThiMDMxOTgxMzE2MTg4NmMifX19"
    if (!paymentHeader) {
      const accept = request.headers.get("Accept");
      if (accept?.includes("text/html")) {
        const userAgent = request.headers.get("User-Agent");
        if (userAgent?.includes("Mozilla")) {
          let displayAmount: number;
          if (typeof price === "string" || typeof price === "number") {
            const parsed = moneySchema.safeParse(price);
            if (parsed.success) {
              displayAmount = parsed.data;
            } else {
              displayAmount = Number.NaN;
            }
          } else {
            displayAmount = Number(price.amount) / 10 ** price.asset.decimals;
          }

          // customPaywallHtml should only be shown if the captcha hasn't previously failed

          let html;
					/*
          if(captcha == "fail"){
            
          } else {
            html = customPaywallHtml;
          }
          */

          html = getPaywallHtml({
            amount: displayAmount,
            paymentRequirements: toJsonSafe(paymentRequirements) as Parameters<
              typeof getPaywallHtml
            >[0]["paymentRequirements"],
            currentUrl: request.url,
            testnet: network === "base-sepolia",
            cdpClientKey: paywall?.cdpClientKey,
            appLogo: paywall?.appLogo,
            appName: paywall?.appName,
            sessionTokenEndpoint: paywall?.sessionTokenEndpoint,
          });

          return new NextResponse(html, {
            status: 402,
            headers: { "Content-Type": "text/html" },
          });
        }
      }

      return new NextResponse(
        JSON.stringify({
          x402Version,
          error:
            errorMessages?.paymentRequired || "X-PAYMENT header is required",
          accepts: paymentRequirements,
        }),
        { status: 402, headers: { "Content-Type": "application/json" } },
      );
    }

    // Verify payment
    let decodedPayment: PaymentPayload;
    try {
      decodedPayment = exact.evm.decodePayment(paymentHeader);
      decodedPayment.x402Version = x402Version;
    } catch (error) {
      return new NextResponse(
        JSON.stringify({
          x402Version,
          error:
            errorMessages?.invalidPayment ||
            (error instanceof Error ? error : "Invalid payment"),
          accepts: paymentRequirements,
        }),
        { status: 402, headers: { "Content-Type": "application/json" } },
      );
    }

    const selectedPaymentRequirements = findMatchingPaymentRequirements(
      paymentRequirements,
      decodedPayment,
    );
    if (!selectedPaymentRequirements) {
      return new NextResponse(
        JSON.stringify({
          x402Version,
          error:
            errorMessages?.noMatchingRequirements ||
            "Unable to find matching payment requirements",
          accepts: toJsonSafe(paymentRequirements),
        }),
        { status: 402, headers: { "Content-Type": "application/json" } },
      );
    }

    // decodedPayment.payload.authorization.validBefore = "1755374005"
    const verification = await verify(
      decodedPayment,
      selectedPaymentRequirements,
    );

    if (!verification.isValid) {
      return new NextResponse(
        JSON.stringify({
          x402Version,
          error:
            errorMessages?.verificationFailed || verification.invalidReason,
          accepts: paymentRequirements,
          payer: verification.payer,
        }),
        { status: 402, headers: { "Content-Type": "application/json" } },
      );
    }

    // Proceed with request
    const response = await NextResponse.next();

    // if the response from the protected route is >= 400, do not settle the payment
    if (response.status >= 400) {
      return response;
    }

    // Settle payment after response
    try {
      const settlement = await settle(
        decodedPayment,
        selectedPaymentRequirements,
      );

      if (settlement.success) {
        response.headers.set(
          "X-PAYMENT-RESPONSE",
          safeBase64Encode(
            JSON.stringify({
              success: true,
              transaction: settlement.transaction,
              network: settlement.network,
              payer: settlement.payer,
            }),
          ),
        );
      }
    } catch (error) {
      return new NextResponse(
        JSON.stringify({
          x402Version,
          error:
            errorMessages?.settlementFailed ||
            (error instanceof Error ? error : "Settlement failed"),
          accepts: paymentRequirements,
        }),
        { status: 402, headers: { "Content-Type": "application/json" } },
      );
    }

    return response;
  };
}

export type {
  Money,
  Network,
  PaymentMiddlewareConfig,
  Resource,
  RouteConfig,
  RoutesConfig,
} from "x402/types";

// Export session token API handlers for Onramp
export { POST };
