// Utilities for creating and verifying a short-lived, path-bound HMAC token
// Works in Next.js Edge/Node runtimes using Web Crypto (crypto.subtle)

type CaptchaPayload = {
	p: string; // path
	exp: number; // epoch seconds
};

function getSecret(): Uint8Array {
	const secret =
		process.env.CAPTCHA_TOKEN_SECRET || process.env.NEXTAUTH_SECRET;
	if (!secret) {
		throw new Error("Missing CAPTCHA_TOKEN_SECRET or NEXTAUTH_SECRET env var");
	}
	return new TextEncoder().encode(secret);
}

function toBase64Url(data: ArrayBuffer | Uint8Array): string {
	const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
	let str = "";
	for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
	// btoa returns base64, then convert to base64url
	return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+/g, "");
}

function fromBase64Url(base64url: string): Uint8Array {
	const base64 =
		base64url.replace(/-/g, "+").replace(/_/g, "/") +
		"==".slice(0, (4 - (base64url.length % 4)) % 4);
	const str = atob(base64);
	const out = new Uint8Array(str.length);
	for (let i = 0; i < str.length; i++) out[i] = str.charCodeAt(i);
	return out;
}

async function importKey(): Promise<CryptoKey> {
	return crypto.subtle.importKey(
		"raw",
		getSecret(),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign", "verify"],
	);
}

async function hmac(payloadBytes: Uint8Array): Promise<Uint8Array> {
	const key = await importKey();
	const sig = await crypto.subtle.sign("HMAC", key, payloadBytes);
	return new Uint8Array(sig);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) return false;
	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a[i] ^ b[i];
	}
	return result === 0;
}

export async function createToken(
	path: string,
	ttlSeconds: number,
): Promise<string> {
	const exp = Math.floor(Date.now() / 1000) + Math.max(1, ttlSeconds);
	const payload: CaptchaPayload = { p: path, exp };
	const payloadStr = JSON.stringify(payload);
	const payloadBytes = new TextEncoder().encode(payloadStr);
	const sigBytes = await hmac(payloadBytes);
	return `${toBase64Url(payloadBytes)}.${toBase64Url(sigBytes)}`;
}

export async function verifyToken(
	token: string,
	path: string,
): Promise<boolean> {
	try {
		const [payloadPart, sigPart] = token.split(".");
		if (!payloadPart || !sigPart) return false;
		const payloadBytes = fromBase64Url(payloadPart);
		const sigBytes = fromBase64Url(sigPart);
		// Verify signature
		const expectedSig = await hmac(payloadBytes);
		if (!timingSafeEqual(sigBytes, expectedSig)) return false;
		// Verify payload
		const payloadStr = new TextDecoder().decode(payloadBytes);
		const payload = JSON.parse(payloadStr) as CaptchaPayload;
		if (typeof payload.p !== "string" || typeof payload.exp !== "number")
			return false;
		if (payload.p !== path) return false;
		if (payload.exp < Math.floor(Date.now() / 1000)) return false;
		return true;
	} catch {
		return false;
	}
}
