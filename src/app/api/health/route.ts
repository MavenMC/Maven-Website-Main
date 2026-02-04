export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { dbHealthcheck } from "@/lib/db";

export async function GET() {
  const [row] = await dbHealthcheck();
  return NextResponse.json({
    ok: row?.ok === 1,
  });
}
