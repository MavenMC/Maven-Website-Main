import "server-only";

type DiscordWidgetResponse = {
  id: string;
  name: string;
  instant_invite?: string | null;
  presence_count: number;
};

const fallbackInvite = process.env.DISCORD_INVITE_URL ?? "https://discord.gg/mvn";

export async function getDiscordStats() {
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!guildId) {
    return {
      membersOnline: null,
      inviteUrl: fallbackInvite,
    };
  }

  try {
    const response = await fetch(`https://discord.com/api/guilds/${guildId}/widget.json`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return {
        membersOnline: null,
        inviteUrl: fallbackInvite,
      };
    }

    const data = (await response.json()) as DiscordWidgetResponse;
    return {
      membersOnline: data.presence_count ?? null,
      inviteUrl: data.instant_invite || fallbackInvite,
    };
  } catch {
    return {
      membersOnline: null,
      inviteUrl: fallbackInvite,
    };
  }
}

type DiscordRole = {
  id: string;
  name: string;
  permissions: string;
};

type DiscordMember = {
  roles: string[];
};

type DiscordGuild = {
  owner_id: string;
};

const ADMIN_PERMISSION = 0x8n;
const CACHE_TTL = 60_000;
const rolesCache: { fetchedAt: number; roles: DiscordRole[] | null } = {
  fetchedAt: 0,
  roles: null,
};
const guildCache: { fetchedAt: number; ownerId: string | null } = {
  fetchedAt: 0,
  ownerId: null,
};

async function getGuildRoles(guildId: string, botToken: string) {
  const now = Date.now();
  if (rolesCache.roles && now - rolesCache.fetchedAt < CACHE_TTL) {
    return rolesCache.roles;
  }

  const response = await fetch(`https://discord.com/api/guilds/${guildId}/roles`, {
    headers: { Authorization: `Bot ${botToken}` },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as DiscordRole[];
  rolesCache.roles = data;
  rolesCache.fetchedAt = now;
  return data;
}

async function getGuildOwnerId(guildId: string, botToken: string) {
  const now = Date.now();
  if (guildCache.ownerId && now - guildCache.fetchedAt < CACHE_TTL) {
    return guildCache.ownerId;
  }

  const response = await fetch(`https://discord.com/api/guilds/${guildId}`, {
    headers: { Authorization: `Bot ${botToken}` },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as DiscordGuild;
  guildCache.ownerId = data.owner_id;
  guildCache.fetchedAt = now;
  return data.owner_id;
}

async function getGuildMember(guildId: string, botToken: string, discordId: string) {
  const response = await fetch(`https://discord.com/api/guilds/${guildId}/members/${discordId}`, {
    headers: { Authorization: `Bot ${botToken}` },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as DiscordMember;
  return data;
}

export async function isDiscordAdmin(discordId: string) {
  const guildId = process.env.DISCORD_GUILD_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!guildId || !botToken) return false;

  try {
    const [member, roles, ownerId] = await Promise.all([
      getGuildMember(guildId, botToken, discordId),
      getGuildRoles(guildId, botToken),
      getGuildOwnerId(guildId, botToken),
    ]);

    if (!member || !roles) return false;
    if (ownerId && ownerId === discordId) return true;

    const memberRoles = new Set(member.roles);
    return roles.some((role) => {
      if (!memberRoles.has(role.id)) return false;
      try {
        const permissions = BigInt(role.permissions);
        return (permissions & ADMIN_PERMISSION) === ADMIN_PERMISSION;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

export async function updateMemberNickname(discordId: string, nickname: string) {
  const guildId = process.env.DISCORD_GUILD_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!guildId || !botToken) return false;

  try {
    const response = await fetch(`https://discord.com/api/guilds/${guildId}/members/${discordId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nick: nickname }),
    });

    if (!response.ok) {
      console.error("Erro ao alterar apelido:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao alterar apelido no Discord:", error);
    return false;
  }
}

type LoginNotificationPayload = {
  discord_id: string;
  discord_username: string | null;
  email: string | null;
  minecraft_name: string | null;
  account_type: string | null;
  verified: number | null;
  discord_avatar: string | null;
};

export async function notifyLogin(userData: LoginNotificationPayload) {
  if (!process.env.DISCORD_WEBHOOK_URL) return;

  const embed = {
    title: "Novo Login no Site",
    color: 0xf08a2b,
    fields: [
      {
        name: "Usuário",
        value: userData.discord_username || "Não informado",
        inline: true,
      },
      {
        name: "Discord ID",
        value: userData.discord_id || "N/A",
        inline: true,
      },
      {
        name: "Email",
        value: userData.email || "Não informado",
        inline: false,
      },
      {
        name: "Tipo de Conta",
        value:
          userData.account_type === "original"
            ? "Original (Java)"
            : userData.account_type === "bedrock"
            ? "Bedrock"
            : "Pirata",
        inline: true,
      },
      {
        name: "Status",
        value: userData.verified ? "Verificado" : "Não verificado",
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "Maven Site",
    },
  };

  if (userData.minecraft_name) {
    embed.fields.push({
      name: "Nick Minecraft",
      value: userData.minecraft_name,
      inline: false,
    });
  }

  try {
    const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
      console.error("Erro ao enviar webhook:", await response.text());
    }
  } catch (error) {
    console.error("Erro ao enviar notificação de login:", error);
  }
}

type LinkNotificationData = {
  discordId: string;
  discordUsername?: string | null;
  minecraftNickname: string;
  platform: "java" | "bedrock";
  accountType: string;
  discordNicknameUpdated: boolean;
};

export async function notifyLink(data: LinkNotificationData) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_LINK_LOGS ?? process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const platformLabel = data.platform === "bedrock" ? "Bedrock Edition" : "Java Edition";
  const accountTypeLabel =
    data.accountType === "original"
      ? "Original"
      : data.accountType === "bedrock"
      ? "Bedrock"
      : "Pirata";

  const embed = {
    title: "Nova Vinculação de Conta",
    color: data.accountType === "original" ? 0x22c55e : data.accountType === "bedrock" ? 0x3b82f6 : 0xf59e0b,
    fields: [
      {
        name: "Conta Discord",
        value: `<@${data.discordId}>\n\`${data.discordUsername || "Sem nome"}\``,
        inline: true,
      },
      {
        name: "Minecraft",
        value: `\`${data.minecraftNickname}\``,
        inline: true,
      },
      {
        name: "Plataforma",
        value: platformLabel,
        inline: true,
      },
      {
        name: "Tipo de Conta",
        value: accountTypeLabel,
        inline: true,
      },
      {
        name: "Nickname Discord",
        value: data.discordNicknameUpdated ? "Atualizado" : "Não atualizado",
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "Maven Site",
    },
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (error) {
    console.error("Erro ao enviar notificação de vinculação:", error);
  }
}
