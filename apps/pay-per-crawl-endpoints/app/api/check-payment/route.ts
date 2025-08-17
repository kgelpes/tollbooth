import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pathname, address } = body;

    if (!pathname || !address) {
      return NextResponse.json(
        { success: false, error: "Missing pathname or address" },
        { status: 400 },
      );
    }

    // Create Supabase client inside the function to avoid build-time issues
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // Query with date constraint in SQL
    const { data, error } = await supabase
      .from("payments")
      .select("id")
      .eq("resource", pathname)
      .eq("payer_address", address)
      .lte("created_at", new Date().toISOString()) // created_at <= now
      .gte("expires_at", new Date().toISOString()) // expires_at >= now
      .limit(1);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Database error" },
        { status: 500 },
      );
    }

    if (data && data.length > 0) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false });
    }
  } catch (err) {
    console.error("Handler error:", err);
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 },
    );
  }
}
