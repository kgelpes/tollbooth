import { generateJwt } from "@coinbase/cdp-sdk/auth";

export interface OnrampSessionOptions {
	assets?: readonly string[];
	blockchains?: readonly string[];
}

export async function requestOnrampSessionToken(
	address: string,
	options?: OnrampSessionOptions,
): Promise<string> {
	const apiKeyId = process.env.CDP_API_KEY_ID;
	const apiKeySecret = process.env.CDP_API_KEY_SECRET;
	if (!apiKeyId || !apiKeySecret) {
		throw new Error("Missing CDP_API_KEY_ID or CDP_API_KEY_SECRET");
	}

	const jwt = await generateJwt({
		apiKeyId,
		apiKeySecret,
		requestMethod: "POST",
		requestHost: "api.developer.coinbase.com",
		requestPath: "/onramp/v1/token",
	});

	const payload = {
		addresses: [
			{
				address,
				blockchains: (options?.blockchains?.length
					? options.blockchains
					: ["base"]) as string[],
			},
		],
		...(options?.assets?.length
			? { assets: options.assets as string[] }
			: {}),
	} as const;

	const resp = await fetch(
		"https://api.developer.coinbase.com/onramp/v1/token",
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${jwt}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		},
	);

	if (!resp.ok) {
		const text = await resp.text().catch(() => "");
		throw new Error(
			`Failed to generate session token (HTTP ${resp.status})${text ? `: ${text}` : ""}`,
		);
	}

	const data = (await resp.json()) as { token: string };
	return data.token;
}

export interface BuildOnrampUrlOptions {
	defaultNetwork?: string;
	presetFiatAmount?: number;
	defaultAsset?: string;
	presetCryptoAmount?: number;
	environment?: "sandbox" | "production";
}

export function buildOnrampUrl(
	sessionToken: string,
	options?: BuildOnrampUrlOptions,
): string {
	const env = options?.environment ?? "production";
	const base = env === "sandbox"
		? "https://pay-sandbox.coinbase.com/"
		: "https://pay.coinbase.com/buy/select-asset";
	const url = new URL(base);
	url.searchParams.set("sessionToken", sessionToken);
	if (options?.defaultNetwork) {
		url.searchParams.set("defaultNetwork", options.defaultNetwork);
	} else {
		url.searchParams.set("defaultNetwork", env === "sandbox" ? "base-sepolia" : "base");
	}
	if (
		typeof options?.presetFiatAmount === "number" &&
		Number.isFinite(options.presetFiatAmount) &&
		options.presetFiatAmount > 0
	) {
		url.searchParams.set(
			"presetFiatAmount",
			String(options.presetFiatAmount),
		);
	}
	if (typeof options?.defaultAsset === "string" && options.defaultAsset.length > 0) {
		url.searchParams.set("defaultAsset", options.defaultAsset);
	}
	if (
		typeof options?.presetCryptoAmount === "number" &&
		Number.isFinite(options.presetCryptoAmount) &&
		options.presetCryptoAmount > 0
	) {
		url.searchParams.set(
			"presetCryptoAmount",
			String(options.presetCryptoAmount),
		);
	}
	return url.toString();
}


