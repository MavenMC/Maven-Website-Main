export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbQuery } from "@/lib/db";
import { notifyLink, updateMemberNickname } from "@/lib/discord";
import crypto from "crypto";

function getOfflineUUID(username: string) {
  const data = Buffer.from(`OfflinePlayer:${username}`, "utf8");
  const md5Buffer = crypto.createHash("md5").update(data).digest();
  md5Buffer[6] = (md5Buffer[6] & 0x0f) | 0x30;
  md5Buffer[8] = (md5Buffer[8] & 0x3f) | 0x80;
  const hex = md5Buffer.toString("hex");
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}`;
}

type PlayerAccountRow = {
  minecraft_uuid: string | null;
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.playerId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { nickname, platform, accountType } = await request.json();

    if (!nickname || nickname.trim().length < 3) {
      return NextResponse.json(
        { error: "Nickname deve ter pelo menos 3 caracteres" },
        { status: 400 },
      );
    }

    const cleanNickname = nickname.startsWith("*") ? nickname.substring(1) : nickname;
    if (cleanNickname.length > 16) {
      return NextResponse.json(
        { error: "Nickname deve ter no máximo 16 caracteres" },
        { status: 400 },
      );
    }

    const isBedrock = nickname.startsWith("*");
    const nicknameToValidate = isBedrock ? cleanNickname : nickname;

    if (!/^[a-zA-Z0-9_]+$/.test(nicknameToValidate) || nickname.includes(" ")) {
      return NextResponse.json(
        { error: "Nickname inválido. Use apenas letras, números e underscore (_)" },
        { status: 400 },
      );
    }

    if (platform === "bedrock" && !nickname.startsWith("*")) {
      return NextResponse.json(
        { error: "Nicknames Bedrock devem começar com *" },
        { status: 400 },
      );
    }

    if (platform === "java" && nickname.startsWith("*")) {
      return NextResponse.json(
        { error: "Nicknames Java não devem começar com *" },
        { status: 400 },
      );
    }

    let minecraftUuid: string | null = null;
    let finalAccountType = accountType || (isBedrock ? "bedrock" : "pirata");

    if (platform === "java") {
      if (accountType === "original") {
        try {
          const response = await fetch(
            `https://api.mojang.com/users/profiles/minecraft/${nickname}`,
            {
              headers: { "User-Agent": "MavenSite-Proxy/1.0" },
              next: { revalidate: 3600 },
            },
          );
          if (response.ok) {
            const data = await response.json();
            const id = data.id;
            minecraftUuid = `${id.substring(0, 8)}-${id.substring(8, 12)}-${id.substring(12, 16)}-${id.substring(16, 20)}-${id.substring(20)}`;
            finalAccountType = "original";
          } else {
            finalAccountType = "pirata";
            minecraftUuid = getOfflineUUID(nickname);
          }
        } catch {
          finalAccountType = "pirata";
          minecraftUuid = getOfflineUUID(nickname);
        }
      } else {
        minecraftUuid = getOfflineUUID(nickname);
      }
    } else if (platform === "bedrock") {
      minecraftUuid = getOfflineUUID(nickname);
    }

    const players = await dbQuery<{ uuid: string }[]>(
      "SELECT uuid FROM jogadores WHERE nome = :nome LIMIT 1",
      { nome: cleanNickname },
    );

    if (!players.length) {
      return NextResponse.json(
        {
          error:
            "Esta conta Minecraft não existe no servidor. Entre no servidor pelo menos uma vez antes de vincular.",
        },
        { status: 400 },
      );
    }

    if (minecraftUuid) {
      const existingLink = await dbQuery<{ discord_id: string }[]>(
        "SELECT discord_id FROM player_accounts WHERE minecraft_uuid = :minecraft_uuid AND discord_id <> :discord_id LIMIT 1",
        { minecraft_uuid: minecraftUuid, discord_id: session.user.playerId },
      );

      if (existingLink.length) {
        return NextResponse.json(
          { error: "Essa conta Minecraft já está vinculada a outro Discord" },
          { status: 400 },
        );
      }

      const currentPlayer = await dbQuery<PlayerAccountRow[]>(
        "SELECT minecraft_uuid FROM player_accounts WHERE discord_id = :discord_id LIMIT 1",
        { discord_id: session.user.playerId },
      );

      if (
        currentPlayer[0]?.minecraft_uuid &&
        currentPlayer[0].minecraft_uuid !== minecraftUuid
      ) {
        return NextResponse.json(
          {
            error:
              "Você já tem uma conta Minecraft vinculada. Desvincule-a primeiro para vincular outra.",
          },
          { status: 400 },
        );
      }
    }

    await dbQuery(
      "UPDATE player_accounts SET minecraft_name = :minecraft_name, minecraft_uuid = :minecraft_uuid, account_type = :account_type, verified = 1, is_bedrock = :is_bedrock, last_updated = NOW() WHERE discord_id = :discord_id",
      {
        discord_id: session.user.playerId,
        minecraft_name: nickname,
        minecraft_uuid: minecraftUuid,
        account_type: finalAccountType,
        is_bedrock: platform === "bedrock" ? 1 : 0,
      },
    );

    let nicknameUpdated = false;
    try {
      nicknameUpdated = await updateMemberNickname(session.user.playerId, nickname);
    } catch (error) {
      console.error("Erro ao atualizar nickname no Discord:", error);
    }

    await notifyLink({
      discordId: session.user.playerId,
      discordUsername: session.user.name ?? null,
      minecraftNickname: nickname,
      platform: platform || (isBedrock ? "bedrock" : "java"),
      accountType: finalAccountType,
      discordNicknameUpdated: nicknameUpdated,
    });

    return NextResponse.json({
      success: true,
      nickname,
      platform: platform || (isBedrock ? "bedrock" : "java"),
      accountType: finalAccountType,
      discordNicknameUpdated: nicknameUpdated,
      message: nicknameUpdated
        ? "Nickname atualizado na loja e no Discord!"
        : "Nickname atualizado na loja. Não foi possível alterar no Discord.",
    });
  } catch (error) {
    console.error("Erro ao atualizar nickname:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar nickname" },
      { status: 500 },
    );
  }
}
