import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, pathname, expiration_date } = body;

    if (!address || !pathname || !expiration_date) {
      return NextResponse.json(
        { success: false, error: "Missing address, pathname, or expiration_date" },
        { status: 400 }
      );
    }

    // Insert into Supabase
    const { data, error } = await supabase.from("payments").insert([
      {
        payer_address: address,
        resource: pathname,
        expires_at: new Date(expiration_date).toISOString(),
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ success: false, error: "Database insert error" }, { status: 500 });
    }

    return NextResponse.json({ success: true, payment: data[0] });
  } catch (err) {
    console.error("Handler error:", err);
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
