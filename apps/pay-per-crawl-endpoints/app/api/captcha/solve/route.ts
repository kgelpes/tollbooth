import { NextResponse } from "next/server";
import { createToken } from "../../../../custom-middleware/token";

export async function POST(request: Request) {
	const ttlSeconds = 300;
	try {
		const { path } = (await request.json()) as { path?: string };
		if (!path || typeof path !== "string" || !path.startsWith("/")) {
			return NextResponse.json({ error: "Invalid path" }, { status: 400 });
		}
		const token = await createToken(path, ttlSeconds);
		const isHttps = (() => {
			try {
				const url = new URL(request.url);
				return url.protocol === "https:";
			} catch {
				return false;
			}
		})();
		const secureAttr = isHttps ? "; Secure" : "";
		const cookieHeader = `captcha_token=${token}; Path=${path}; Max-Age=${ttlSeconds}; HttpOnly; SameSite=Lax${secureAttr}`;
		return new NextResponse(null, {
			status: 204,
			headers: {
				"Set-Cookie": cookieHeader,
			},
		});
	} catch {
		return NextResponse.json({ error: "Bad request" }, { status: 400 });
	}
}
