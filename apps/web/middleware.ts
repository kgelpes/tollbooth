import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "./lib/auth";

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const shouldProtect =
		pathname.startsWith("/agent/dashboard") ||
		pathname.startsWith("/publisher/dashboard");

	if (!shouldProtect) {
		return NextResponse.next();
	}

	try {
		const session = await auth.api.getSession({ headers: request.headers });
		if (session) {
			return NextResponse.next();
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
	runtime: "nodejs",
	matcher: ["/agent/dashboard/:path*", "/publisher/dashboard/:path*"],
};
