import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { User } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbQuery } from "@/lib/db";
import ProfileLinker from "@/components/ProfileLinker";
import ProfilePublicForm from "@/components/ProfilePublicForm";

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

type ProfileRow = {
  uuid: string;
  apelido: string | null;
  bio: string | null;
  estatisticas_publicas: number | null;
  privacidade: string | null;
  cor_favorita: string | null;
};

type AssetRow = {
  banner_url: string | null;
  avatar_url: string | null;
  ring_url: string | null;
};

type SocialRow = {
  id: number;
  label: string;
  url: string;
  is_public: number;
};

type ProfileNickRow = {
  current_nick: string | null;
};

function formatAccountType(accountType: string | null, isBedrock: number | null) {
  if (accountType === "original") return "Original (Java)";
  if (accountType === "bedrock" || isBedrock) return "Bedrock";
  return "Pirata";
}

const uploadConfig = {
  banner: { maxSize: 5 * 1024 * 1024, label: "Banner" },
  avatar: { maxSize: 5 * 1024 * 1024, label: "Avatar" },
  ring: { maxSize: 5 * 1024 * 1024, label: "Moldura" },
};

const allowedImageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

function isFile(value: FormDataEntryValue | null): value is File {
  return Boolean(value && typeof value === "object" && "arrayBuffer" in value && "size" in value);
}

function sanitizeText(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

function normalizeHandle(value: string) {
  return value.replace(/^@+/, "").trim();
}

function isValidHandle(value: string) {
  return /^[a-zA-Z0-9._-]{2,32}$/.test(value);
}

function buildSocialUrl(label: string, handle: string) {
  const safeHandle = normalizeHandle(handle);
  if (!isValidHandle(safeHandle)) return null;

  switch (label.toLowerCase()) {
    case "discord":
      return /^\d{16,20}$/.test(safeHandle)
        ? `https://discord.com/users/${safeHandle}`
        : `https://discord.com/users/${encodeURIComponent(safeHandle)}`;
    case "youtube":
      return `https://www.youtube.com/@${encodeURIComponent(safeHandle)}`;
    case "tiktok":
      return `https://www.tiktok.com/@${encodeURIComponent(safeHandle)}`;
    default:
      return null;
  }
}

function extractHandle(url: string) {
  const match = url.match(/@([a-zA-Z0-9._-]+)/);
  if (match?.[1]) return match[1];
  const tail = url.split("/").pop();
  return tail ? normalizeHandle(tail) : "";
}

async function removeLocalUpload(currentUrl: string | null) {
  if (!currentUrl || !currentUrl.startsWith("/uploads/")) return;
  
  const filePath = path.join(process.cwd(), "public", currentUrl.replace(/^\//, ""));
  
  try {
    await fs.unlink(filePath);
    console.log(`[Perfil] Arquivo deletado: ${currentUrl}`);
    
    // Tentar limpar o diretório se estiver vazio
    const dirPath = path.dirname(filePath);
    try {
      const files = await fs.readdir(dirPath);
      if (files.length === 0) {
        await fs.rmdir(dirPath);
        console.log(`[Perfil] Diretório vazio removido: ${dirPath}`);
      }
    } catch {
      // Diretório não está vazio ou não pode ser removido, ignorar
    }
  } catch (error) {
    // Arquivo não existe ou não pode ser deletado
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error(`[Perfil] Erro ao deletar arquivo ${currentUrl}:`, error);
    }
  }
}

async function saveProfileUpload(uuid: string, kind: "banner" | "avatar" | "ring", file: File) {
  const extension = path.extname(file.name || "").toLowerCase();
  if (!allowedImageExtensions.has(extension)) {
    throw new Error("Tipo de arquivo invalido.");
  }

  const maxSize = uploadConfig[kind].maxSize;
  if (file.size > maxSize) {
    throw new Error(`${uploadConfig[kind].label} excede o tamanho permitido.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const folder = path.join(process.cwd(), "public", "uploads", "profiles", uuid);
  await fs.mkdir(folder, { recursive: true });

  const filename = `${kind}-${Date.now()}-${Math.random().toString(16).slice(2)}${extension}`;
  const filePath = path.join(folder, filename);
  await fs.writeFile(filePath, buffer);

  return `/uploads/profiles/${uuid}/${filename}`;
}

async function updatePublicProfile(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);

  if (!session?.user?.playerId) {
    redirect("/login");
  }

  const rows = await dbQuery<PlayerRow[]>(
    "SELECT discord_id, discord_username, discord_avatar, email, minecraft_name, minecraft_uuid, account_type, verified, is_bedrock FROM player_accounts WHERE discord_id = :discord_id LIMIT 1",
    { discord_id: session.user.playerId },
  );

  const player = rows[0];
  if (!player?.minecraft_uuid) {
    redirect("/perfil#vinculo");
  }

  const uuid = player.minecraft_uuid;

  try {

  const apelido = sanitizeText(String(formData.get("apelido") || ""), 50) || null;
  const bio = sanitizeText(String(formData.get("bio") || ""), 500) || null;
  const privacidade = String(formData.get("privacidade") || "PUBLICA").toUpperCase();
  const estatisticasPublicas = formData.get("estatisticas_publicas") ? 1 : 0;

  await dbQuery(
    "INSERT INTO perfil_jogadores (uuid, apelido, bio, estatisticas_publicas, privacidade) VALUES (:uuid, :apelido, :bio, :estatisticas_publicas, :privacidade) ON DUPLICATE KEY UPDATE apelido = :apelido, bio = :bio, estatisticas_publicas = :estatisticas_publicas, privacidade = :privacidade",
    {
      uuid,
      apelido,
      bio,
      estatisticas_publicas: estatisticasPublicas,
      privacidade: privacidade === "PRIVADA" ? "PRIVADA" : "PUBLICA",
    },
  );

  const assetRows = await dbQuery<AssetRow[]>(
    "SELECT banner_url, avatar_url, ring_url FROM perfil_jogadores_assets WHERE uuid = :uuid LIMIT 1",
    { uuid },
  );
  const currentAssets = assetRows[0] ?? null;

  let bannerUrl = currentAssets?.banner_url ?? null;
  let avatarUrl = currentAssets?.avatar_url ?? null;
  let ringUrl = currentAssets?.ring_url ?? null;

  if (formData.get("remove_banner")) {
    await removeLocalUpload(bannerUrl);
    bannerUrl = null;
  }
  if (formData.get("remove_avatar")) {
    await removeLocalUpload(avatarUrl);
    avatarUrl = null;
  }
  if (formData.get("remove_ring")) {
    await removeLocalUpload(ringUrl);
    ringUrl = null;
  }

  const bannerFile = formData.get("banner");
  if (isFile(bannerFile) && bannerFile.size > 0) {
    await removeLocalUpload(bannerUrl);
    bannerUrl = await saveProfileUpload(uuid, "banner", bannerFile);
  }

  const avatarFile = formData.get("avatar");
  if (isFile(avatarFile) && avatarFile.size > 0) {
    await removeLocalUpload(avatarUrl);
    avatarUrl = await saveProfileUpload(uuid, "avatar", avatarFile);
  }

  const ringFile = formData.get("ring");
  if (isFile(ringFile) && ringFile.size > 0) {
    await removeLocalUpload(ringUrl);
    ringUrl = await saveProfileUpload(uuid, "ring", ringFile);
  }

  await dbQuery(
    "INSERT INTO perfil_jogadores_assets (uuid, banner_url, avatar_url, ring_url) VALUES (:uuid, :banner_url, :avatar_url, :ring_url) ON DUPLICATE KEY UPDATE banner_url = :banner_url, avatar_url = :avatar_url, ring_url = :ring_url, updated_at = NOW()",
    {
      uuid,
      banner_url: bannerUrl,
      avatar_url: avatarUrl,
      ring_url: ringUrl,
    },
  );

  const socials: Array<{ label: string; url: string; is_public: number; sort_order: number }> = [];
  const definitions = [
    { key: "discord", label: "Discord" },
    { key: "youtube", label: "YouTube" },
    { key: "tiktok", label: "TikTok" },
  ];

  definitions.forEach((item, index) => {
    const handleValue = String(formData.get(`social_handle_${item.key}`) || "");
    const url = buildSocialUrl(item.label, handleValue);
    if (!url) return;
    const isPublic = formData.get(`social_public_${item.key}`) ? 1 : 0;
    socials.push({ label: item.label, url, is_public: isPublic, sort_order: index });
  });

  await dbQuery("DELETE FROM perfil_jogadores_redes WHERE uuid = :uuid", { uuid });
  for (const social of socials) {
    await dbQuery(
      "INSERT INTO perfil_jogadores_redes (uuid, label, url, is_public, sort_order) VALUES (:uuid, :label, :url, :is_public, :sort_order)",
      { uuid, ...social },
    );
  }

  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    throw error;
  } finally {
    // Sempre revalidar as páginas mesmo se houver erro parcial
    const nickRows = await dbQuery<ProfileNickRow[]>(
      "SELECT current_nick FROM account_stats WHERE uuid = :uuid LIMIT 1",
      { uuid },
    ).catch(() => []);
    const publicNick = nickRows[0]?.current_nick ?? player.minecraft_name;

    revalidatePath("/perfil");
    if (publicNick) {
      revalidatePath(`/perfil/${publicNick}`);
    }
  }
}

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.playerId) {
    redirect("/login");
  }

  const rows = await dbQuery<PlayerRow[]>(
    "SELECT discord_id, discord_username, discord_avatar, email, minecraft_name, minecraft_uuid, account_type, verified, is_bedrock FROM player_accounts WHERE discord_id = :discord_id LIMIT 1",
    { discord_id: session.user.playerId },
  );

  const player = rows[0];

  if (!player) {
    return (
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-kicker">Perfil</span>
              <h2>Conta não encontrada</h2>
              <p className="muted">Sua conta ainda não está vinculada ao site.</p>
            </div>
            <a href="#vinculo" className="btn primary">
              Vincular conta
            </a>
          </div>
          <div id="vinculo" className="profile-link-section">
            <ProfileLinker />
          </div>
        </div>
      </section>
    );
  }

  const isOriginal = player.account_type === "original" || player.account_type === "java_original";
  const isBedrock = player.account_type === "bedrock" || player.is_bedrock === 1;
  const skinSource = player.minecraft_name ?? player.minecraft_uuid ?? null;
  const minecraftAvatar = isOriginal && !isBedrock && skinSource
    ? `https://minotar.net/helm/${encodeURIComponent(skinSource)}/96`
    : null;

  const profileRows = player.minecraft_uuid
    ? await dbQuery<ProfileRow[]>(
        "SELECT uuid, apelido, bio, estatisticas_publicas, privacidade, cor_favorita FROM perfil_jogadores WHERE uuid = :uuid LIMIT 1",
        { uuid: player.minecraft_uuid },
      )
    : [];
  const profile = profileRows[0] ?? null;

  const assetRows = player.minecraft_uuid
    ? await dbQuery<AssetRow[]>(
        "SELECT banner_url, avatar_url, ring_url FROM perfil_jogadores_assets WHERE uuid = :uuid LIMIT 1",
        { uuid: player.minecraft_uuid },
      )
    : [];
  const assets = assetRows[0] ?? null;

  const socialRows = player.minecraft_uuid
    ? await dbQuery<SocialRow[]>(
        "SELECT id, label, url, is_public FROM perfil_jogadores_redes WHERE uuid = :uuid ORDER BY sort_order ASC, id ASC",
        { uuid: player.minecraft_uuid },
      )
    : [];

  const socialHandles = {
    discord: "",
    youtube: "",
    tiktok: "",
  };

  socialRows.forEach((social) => {
    const label = social.label.toLowerCase();
    if (label.includes("discord")) socialHandles.discord = extractHandle(social.url);
    if (label.includes("youtube")) socialHandles.youtube = extractHandle(social.url);
    if (label.includes("tiktok")) socialHandles.tiktok = extractHandle(social.url);
  });

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="section-kicker">Perfil</span>
            <h2>Resumo da sua conta</h2>
            <p className="muted">Veja suas informações e status no Maven Network.</p>
          </div>
          {player.minecraft_name && (
            <a href={`/perfil/${player.minecraft_name}`} className="btn secondary">
              Ver perfil publico
            </a>
          )}
        </div>

        <div className="account-profile-layout">
          <div className="account-profile-left">
            <div className="account-grid">
              <div className="card account-card">
            <span className="card-eyebrow">Discord</span>
            <div className="profile-card-head">
              {minecraftAvatar ? (
                <img
                  src={minecraftAvatar}
                  alt={player.minecraft_name ?? "Minecraft"}
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar" style={{ display: 'grid', placeItems: 'center' }}>
                  <User size={28} aria-hidden="true" />
                </div>
              )}
              <div>
                <h3 className="card-title">{player.discord_username ?? "Usuário não informado"}</h3>
                <p className="card-sub">ID: {player.discord_id}</p>
                <p className="card-sub">Email: {player.email ?? "Não informado"}</p>
              </div>
            </div>
          </div>

              <div className="card account-card">
            <span className="card-eyebrow">Minecraft</span>
            <h3 className="card-title">
              {player.minecraft_name ?? "Conta não vinculada"}
            </h3>
            <p className="card-sub">
              UUID: {player.minecraft_uuid ?? "Não informado"}
            </p>
            <p className="card-sub">
              Tipo: {formatAccountType(player.account_type, player.is_bedrock)}
            </p>
            <p className="card-sub">
              Status: {player.verified ? "Verificado" : "Não verificado"}
            </p>
          </div>
            </div>

            <div className="card account-card">
              <span className="card-eyebrow">Vinculo</span>
              <h3 className="card-title">Conectar Minecraft</h3>
              <p className="card-sub">
                Vincule sua conta para liberar o perfil publico e recursos do site.
              </p>
              <div className="profile-link-section">
                <ProfileLinker />
              </div>
            </div>
          </div>

          <div className="account-profile-right">
            <div className="card profile-preview-card">
              <div className="profile-preview-banner">
                {assets?.banner_url ? (
                  <img src={assets.banner_url} alt="Banner" />
                ) : (
                  <div className="profile-preview-banner-fallback" />
                )}
                <div className="profile-preview-avatar">
                  {assets?.avatar_url ? (
                    <img src={assets.avatar_url} alt="Avatar" />
                  ) : minecraftAvatar ? (
                    <img src={minecraftAvatar} alt="Avatar" />
                  ) : (
                    <div className="profile-preview-avatar-fallback">
                      <User size={24} aria-hidden="true" />
                    </div>
                  )}
                </div>
              </div>
              <div className="profile-preview-content">
                <span className="card-eyebrow">Preview</span>
                <h3 className="card-title">
                  {profile?.apelido || player.minecraft_name || player.discord_username || "Jogador"}
                </h3>
                <p className="card-sub">@{player.minecraft_name ?? "-"}</p>
                <p className="muted">
                  Veja como o seu perfil aparece para outras pessoas.
                </p>
                {player.minecraft_name && (
                  <a href={`/perfil/${player.minecraft_name}`} className="btn secondary btn-sm">
                    Abrir perfil publico
                  </a>
                )}
              </div>
            </div>

            {player.minecraft_uuid ? (
              <div className="card profile-public-card">
                <div className="section-header">
                  <div>
                    <span className="section-kicker">Perfil publico</span>
                    <h2>Personalize seu perfil</h2>
                    <p className="muted">Controle sua bio, assets e redes visiveis para o publico.</p>
                  </div>
                  {player.minecraft_name && (
                    <a href={`/perfil/${player.minecraft_name}`} className="btn secondary">
                      Ver perfil
                    </a>
                  )}
                </div>

                <ProfilePublicForm
                  action={updatePublicProfile}
                  profile={profile}
                  assets={assets}
                  socialHandles={socialHandles}
                />
              </div>
            ) : (
              <div className="card profile-public-card">
                <span className="card-eyebrow">Perfil publico</span>
                <h3 className="card-title">Vincule sua conta</h3>
                <p className="muted">Para liberar o perfil publico, conecte seu Minecraft.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
