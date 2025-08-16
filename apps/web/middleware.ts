import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const shouldProtect =
		pathname.startsWith("/agent/dashboard") ||
		pathname.startsWith("/publisher/dashboard");

	if (!shouldProtect) {
		return NextResponse.next();
	}

	// If Supabase env vars are missing, fail open (do not block route)
	if (!supabaseUrl || !supabaseKey) {
		return NextResponse.next();
	}

	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

	const supabase = createServerClient(supabaseUrl, supabaseKey, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value }) => {
					request.cookies.set(name, value);
				});
				response = NextResponse.next({ request });
				cookiesToSet.forEach(({ name, value, options }) => {
					response.cookies.set(name, value, options);
				});
			},
		},
	});

	const { data } = await supabase.auth.getSession();
	if (data?.session) {
		return response;
	}

	const redirectUrl = request.nextUrl.clone();
	redirectUrl.pathname = "/";
	redirectUrl.searchParams.set("from", pathname);
	return NextResponse.redirect(redirectUrl);
}

export const config = {
	matcher: ["/agent/dashboard/:path*", "/publisher/dashboard/:path*"],
};
