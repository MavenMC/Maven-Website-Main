import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbQuery } from "@/lib/db";
import { isDiscordAdmin } from "@/lib/discord";

type AdminRow = {
  discord_id: string;
  role: string;
};

function envAdmins() {
  const ids = process.env.SITE_ADMIN_DISCORD_IDS;
  if (!ids) return new Set<string>();
  return new Set(
    ids
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.playerId) return null;

  const envAllow = envAdmins();
  if (envAllow.has(session.user.playerId)) {
    return { discord_id: session.user.playerId, role: "admin" } satisfies AdminRow;
  }

  const rows = await dbQuery<AdminRow[]>(
    "SELECT discord_id, role FROM site_admins WHERE discord_id = :discord_id LIMIT 1",
    { discord_id: session.user.playerId },
  );

  if (rows[0]) return rows[0];

  const isAdmin = await isDiscordAdmin(session.user.playerId);
  if (isAdmin) {
    return { discord_id: session.user.playerId, role: "discord-admin" } satisfies AdminRow;
  }

  return null;
}

export async function requireAdmin() {
  const admin = await getAdminSession();
  if (!admin) {
    throw new Error("Unauthorized");
  }
  return admin;
}
