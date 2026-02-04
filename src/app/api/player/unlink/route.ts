export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbQuery } from "@/lib/db";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.playerId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const rows = await dbQuery<{ minecraft_uuid: string | null }[]>(
      "SELECT minecraft_uuid FROM player_accounts WHERE discord_id = :discord_id LIMIT 1",
      { discord_id: session.user.playerId },
    );

    if (!rows[0]?.minecraft_uuid) {
      return NextResponse.json(
        { error: "Nenhuma conta Minecraft vinculada" },
        { status: 400 },
      );
    }

    await dbQuery(
      "UPDATE player_accounts SET minecraft_name = NULL, minecraft_uuid = NULL, is_bedrock = 0, verified = 0, last_updated = NOW() WHERE discord_id = :discord_id",
      { discord_id: session.user.playerId },
    );

    return NextResponse.json({
      success: true,
      message: "Conta Minecraft desvinculada com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao desvincular conta:", error);
    return NextResponse.json(
      { error: "Erro ao desvincular conta" },
      { status: 500 },
    );
  }
}
