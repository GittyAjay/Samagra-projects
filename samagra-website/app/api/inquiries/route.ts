import { NextRequest, NextResponse } from 'next/server';

function getApiBaseUrl() {
  return process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${getApiBaseUrl()}/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      const payload = await response.json();
      return NextResponse.json(payload, { status: response.status });
    }

    const text = await response.text();
    return new NextResponse(text, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        statusMessage:
          error instanceof Error ? error.message : 'Unable to reach the local API service.',
      },
      { status: 502 }
    );
  }
}
