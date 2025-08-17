import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const shouldProtect =
		pathname.startsWith("/agent/dashboard") ||
		pathname.startsWith("/publisher/dashboard");

	if (!shouldProtect) {
		return NextResponse.next();
	}

	try {
		const sessionRes = await fetch(new URL("/api/auth/session", request.url), {
			headers: {
				cookie: request.headers.get("cookie") ?? "",
			},
			cache: "no-store",
		});

		if (sessionRes.ok) {
			const data = await sessionRes.json().catch(() => null);
			if (data?.session) {
				return NextResponse.next();
			}
		}
	} catch (error) {
		console.error("Middleware auth check failed:", error);
	}

	const redirectUrl = request.nextUrl.clone();
	redirectUrl.pathname = "/";
	redirectUrl.searchParams.set("from", pathname);
	return NextResponse.redirect(redirectUrl);
}

export const config = {
	matcher: ["/agent/dashboard/:path*", "/publisher/dashboard/:path*"],
};
