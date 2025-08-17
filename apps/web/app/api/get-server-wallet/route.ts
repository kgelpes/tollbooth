import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const apiKey = req.nextUrl.searchParams.get('api_key');
    if (apiKey === 'bedf5f96-7d70-43a1-8f3c-361127bb3b9b') {
        return NextResponse.json({ result: 'x402' });
    } else {
        return new NextResponse('Not Found', { status: 404 });
    }
}