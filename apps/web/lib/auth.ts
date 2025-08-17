import { betterAuth } from "better-auth";
import { admin, anonymous, siwe } from "better-auth/plugins";
import { Pool } from "pg";
import { verifyMessage } from "viem";

function generateNonce(): string {
	if (typeof globalThis.crypto?.randomUUID === "function") {
		return globalThis.crypto.randomUUID().replaceAll("-", "");
	}
	const bytes = new Uint8Array(16);
	globalThis.crypto.getRandomValues(bytes);
	let hex = "";
	for (const byte of bytes) {
		hex += byte.toString(16).padStart(2, "0");
	}
	return hex;
}

export const auth = betterAuth({
	database: new Pool({
		connectionString: process.env.DATABASE_URL,
	}),
	plugins: [
		admin(),
		anonymous(),
		siwe({
			domain:
				process.env.NEXT_PUBLIC_APP_DOMAIN ??
				process.env.VERCEL_URL ??
				"localhost",
			emailDomainName:
				process.env.NEXT_PUBLIC_APP_DOMAIN ??
				process.env.VERCEL_URL ??
				"localhost",
			anonymous: true,
			getNonce: async () => {
				return generateNonce();
			},
			verifyMessage: async ({ message, signature, address }) => {
				try {
					const isValid = await verifyMessage({
						address: address as `0x${string}`,
						message,
						signature: signature as `0x${string}`,
					});
					return Boolean(isValid);
				} catch {
					return false;
				}
			},
		}),
	],
});
