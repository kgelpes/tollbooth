import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const apiKey = req.nextUrl.searchParams.get("api_key");
    if (apiKey === "demo") {
        return NextResponse.json({ result: "x402" });
    } else {
        return new NextResponse("Not Found", { status: 404 });
    }
}
