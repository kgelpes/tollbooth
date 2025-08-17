import { createServerClient } from "@supabase/ssr";
import type { cookies as cookiesFn } from "next/headers";

const supabaseUrlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKeyEnv = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type CookieStore = Awaited<ReturnType<typeof cookiesFn>>;

export const createClient = (cookieStore: CookieStore): unknown => {
	if (!supabaseUrlEnv || !supabaseKeyEnv) {
		throw new Error(
			"Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
		);
	}
	return createServerClient(supabaseUrlEnv, supabaseKeyEnv, {
		cookies: {
			getAll() {
				return cookieStore.getAll();
			},
			setAll(cookiesToSet) {
				try {
					cookiesToSet.forEach(({ name, value, options }) => {
						cookieStore.set(name, value, options);
					});
				} catch {
					// The `setAll` method was called from a Server Component.
					// This can be ignored if you have middleware refreshing
					// user sessions.
				}
			},
		},
	});
};
