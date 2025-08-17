import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "../../../../lib/auth";

export const { POST, GET } = toNextJsHandler(auth);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
