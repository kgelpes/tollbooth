import { betterAuth } from "better-auth";
import { admin, anonymous, siwe } from "better-auth/plugins";
import { Pool } from "pg";
import { verifyMessage } from "viem";

function generateNonce(): string {
	const array = new Uint8Array(16);
	globalThis.crypto.getRandomValues(array);
	return Buffer.from(array).toString("base64url");
}

export const auth = betterAuth({
	database: new Pool({
		connectionString: process.env.DATABASE_URL,
	}),
	plugins: [
		admin(),
		anonymous(),
		siwe({
			domain: process.env.NEXT_PUBLIC_APP_DOMAIN ?? "localhost",
			emailDomainName: process.env.NEXT_PUBLIC_APP_DOMAIN ?? "localhost",
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
