import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|api/|favicon\\.ico|images|uploads|videos|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4|css|js|woff|woff2|ttf|eot)$).*)',
  ],
};
