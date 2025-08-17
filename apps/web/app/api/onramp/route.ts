import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../lib/auth";
import {
	buildOnrampUrl,
	requestOnrampSessionToken,
} from "../../../lib/coinbase/onramp";
import { getUserServerWalletAddress } from "../../../lib/repos/userServerWallets";

const ClientRequestBody = z.object({
	assets: z.array(z.string()).max(10).optional(),
	defaultNetwork: z.string().optional(),
	presetFiatAmount: z.number().positive().max(100000).optional(),
	defaultAsset: z.string().optional(),
	presetCryptoAmount: z.number().positive().max(100000).optional(),
});

async function getAuthedUserId(request: NextRequest): Promise<string | null> {
	const session = await auth.api.getSession({ headers: request.headers });
	return session?.user?.id ?? null;
}

export async function POST(request: NextRequest) {
	try {
		const userId = await getAuthedUserId(request);
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const address = await getUserServerWalletAddress(userId);
		if (!address) {
			return NextResponse.json(
				{ error: "Server wallet not found" },
				{ status: 400 },
			);
		}

		const parsed = ClientRequestBody.safeParse(
			await request.json().catch(() => ({})),
		);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid request body" },
				{ status: 400 },
			);
		}
		const body = parsed.data;

		const token = await requestOnrampSessionToken(address, {
			assets: body.assets,
			blockchains: [body.defaultNetwork ?? "base-sepolia"],
		});
		const url = buildOnrampUrl(token, {
			defaultNetwork: body.defaultNetwork ?? "base-sepolia",
			presetFiatAmount: body.presetFiatAmount,
			defaultAsset: body.defaultAsset,
			presetCryptoAmount: body.presetCryptoAmount,
			environment: "sandbox",
		});

		return NextResponse.json({ token, url });
	} catch (error) {
		console.error("Error generating onramp session token:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export const runtime = "nodejs";
