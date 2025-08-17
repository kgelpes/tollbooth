import { CdpClient } from "@coinbase/cdp-sdk";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import {
	deleteUserServerWallet,
	getUserServerWalletAddress,
	upsertUserServerWallet,
} from "../../../lib/repos/userServerWallets";

async function getAuthedUserId(request: NextRequest): Promise<string | null> {
	const session = await auth.api.getSession({ headers: request.headers });
	return session?.user?.id ?? null;
}

export async function GET(request: NextRequest) {
	const userId = await getAuthedUserId(request);
	if (!userId) {
		return NextResponse.json(
			{ success: false, error: "Unauthorized" },
			{ status: 401 },
		);
	}

	const address = await getUserServerWalletAddress(userId);
	if (!address) {
		return NextResponse.json(
			{ success: false, error: "Not found" },
			{ status: 404 },
		);
	}

	return NextResponse.json({ success: true, userId, address });
}

export async function POST(request: NextRequest) {
	try {
		const userId = await getAuthedUserId(request);
		if (!userId) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 },
			);
		}

		const existing = await getUserServerWalletAddress(userId);
		if (existing) {
			return NextResponse.json({ success: true, userId, address: existing });
		}

		const cdp = new CdpClient();
		const account = await cdp.evm.createAccount();

		await upsertUserServerWallet(userId, account.address);

		return NextResponse.json({
			success: true,
			userId,
			address: account.address,
		});
	} catch (error) {
		console.error("Error creating account:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to create account" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest) {
	const userId = await getAuthedUserId(request);
	if (!userId) {
		return NextResponse.json(
			{ success: false, error: "Unauthorized" },
			{ status: 401 },
		);
	}
	const removed = await deleteUserServerWallet(userId);
	return NextResponse.json({ success: true, removed });
}
