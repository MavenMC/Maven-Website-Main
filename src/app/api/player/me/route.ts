export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbQuery } from "@/lib/db";

type PlayerRow = {
  discord_id: string;
  discord_username: string | null;
  discord_avatar: string | null;
  email: string | null;
  minecraft_name: string | null;
  minecraft_uuid: string | null;
  account_type: string | null;
  verified: number | null;
  is_bedrock: number | null;
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.playerId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const rows = await dbQuery<PlayerRow[]>(
    "SELECT discord_id, discord_username, discord_avatar, email, minecraft_name, minecraft_uuid, account_type, verified, is_bedrock FROM player_accounts WHERE discord_id = :discord_id LIMIT 1",
    { discord_id: session.user.playerId },
  );

  const player = rows[0];
  if (!player) {
    return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    discordId: player.discord_id,
    discordUsername: player.discord_username,
    discordAvatar: player.discord_avatar,
    email: player.email,
    minecraftName: player.minecraft_name,
    minecraftUuid: player.minecraft_uuid,
    accountType: player.account_type,
    verified: Boolean(player.verified),
    isBedrock: Boolean(player.is_bedrock),
  });
}
