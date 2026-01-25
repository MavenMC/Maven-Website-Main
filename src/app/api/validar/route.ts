export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { nick, plataforma } = await req.json();

  return NextResponse.json({
    success: true,
    data: {
      nick,
      uuid: "TEST-UUID-123",
      plataforma,
    },
  });
}
