import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { MessageCircle, Music2, User, Youtube } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { dbQuery } from "@/lib/db";
import { formatShortDate } from "@/lib/date";

export const dynamic = "force-dynamic";

const rankTags: Record<
  string,
  { name: string; color: string; gradient?: string }
> = {
  vip: { name: "VIP", color: "#22c55e", gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" },
  "vip+": { name: "VIP+", color: "#3b82f6", gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" },
  mvp: { name: "MVP", color: "#8b5cf6", gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" },
  "mvp+": { name: "MVP+", color: "#f59e0b", gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" },
  "mvp++": { name: "MVP++", color: "#ef4444", gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" },
  admin: { name: "ADMIN", color: "#dc2626", gradient: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)" },
  mod: { name: "MOD", color: "#06b6d4", gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)" },
  helper: { name: "HELPER", color: "#10b981", gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
};

type AccountStatsRow = {
  uuid: string;
  current_nick: string | null;
  total_playtime: number | string | bigint | null;
  mobs_killed: number | string | bigint | null;
  pvp_kills: number | string | bigint | null;
  blocks_broken: number | string | bigint | null;
  deaths: number | string | bigint | null;
  distance_traveled: number | string | bigint | null;
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

type RankRow = {
  rank_id: string;
  expires_at: Date | null;
  is_permanent: number | null;
};

type BadgeRow = {
  nome: string;
  descricao: string;
  icone: string | null;
};

type LinkedAccountRow = {
  discord_id: string | null;
  minecraft_name: string | null;
  account_type: string | null;
  is_bedrock: number | null;
};

type StaffRoleRow = {
  role_name: string | null;
  role_color: string | null;
};

type ViewerAccountRow = {
  minecraft_uuid: string | null;
};

type AccountNickRow = {
  minecraft_uuid: string | null;
  minecraft_name: string | null;
};

type ForumPostRow = {
  id: number;
  title: string;
  created_at: Date | string | null;
  category_title: string | null;
};

type ReportRow = {
  id: number;
  reportado_uuid: string;
  motivo: string;
  reportadoEm: Date | string | null;
  current_nick: string | null;
};

type PunishedPlayerRow = {
  reportado_uuid: string;
  current_nick: string | null;
};

type ReputationSummaryRow = {
  avg_rating: number | string | null;
  total_count: number | string | null;
};

type ReputationVoteRow = {
  rating: number | string | null;
  updated_at: Date | string | null;
};

function toNumber(value: number | string | bigint | null) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") return Number(value);
  return value;
}

function formatStat(value: number | string | bigint | null) {
  const normalized = toNumber(value);
  if (!Number.isFinite(normalized)) return "0";
  return normalized.toLocaleString("pt-BR");
}

function formatPlaytime(value: number | string | bigint | null) {
  const totalSeconds = Math.max(0, Math.floor(toNumber(value)));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours <= 0 && minutes <= 0) return "0m";
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function formatDate(value: Date | string | null) {
  if (!value) return "";
  const parsed = typeof value === "string" ? new Date(value) : value;
  return formatShortDate(parsed) || "";
}

function getSocialMeta(label: string) {
  const key = label.toLowerCase();
  if (key.includes("discord")) return { icon: MessageCircle, name: "Discord" };
  if (key.includes("youtube")) return { icon: Youtube, name: "YouTube" };
  if (key.includes("tiktok")) return { icon: Music2, name: "TikTok" };
  return { icon: MessageCircle, name: label };
}

function getSocialHandle(url: string) {
  const match = url.match(/@([a-zA-Z0-9._-]+)/);
  if (match?.[1]) return `@${match[1]}`;
  const tail = url.split("/").pop();
  return tail ? `@${tail}` : url;
}

function toFloat(value: number | string | null) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "string") return Number(value);
  return value;
}

async function submitReputation(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session?.user?.playerId) return;

  const viewerRows = await dbQuery<ViewerAccountRow[]>(
    "SELECT minecraft_uuid FROM player_accounts WHERE discord_id = :discord_id LIMIT 1",
    { discord_id: session.user.playerId },
  );
  const raterUuid = viewerRows[0]?.minecraft_uuid ?? null;
  if (!raterUuid) return;

  const targetUuid = String(formData.get("target_uuid") || "").trim();
  const nick = String(formData.get("nick") || "").trim();
  const rating = Number(formData.get("rating") || 0);

  if (!targetUuid || targetUuid === raterUuid) return;
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return;

  await dbQuery(
    "INSERT IGNORE INTO perfil_jogadores (uuid, estatisticas_publicas, privacidade) VALUES (:uuid, 1, 'PUBLICA')",
    { uuid: targetUuid },
  );

  const existing = await dbQuery<ReputationVoteRow[]>(
    "SELECT rating, updated_at FROM perfil_jogadores_reputacoes WHERE rater_uuid = :rater_uuid AND target_uuid = :target_uuid LIMIT 1",
    { rater_uuid: raterUuid, target_uuid: targetUuid },
  );

  const updatedAt = existing[0]?.updated_at ? new Date(existing[0].updated_at as string) : null;
  if (updatedAt && Date.now() - updatedAt.getTime() < 30 * 24 * 60 * 60 * 1000) {
    return;
  }

  await dbQuery(
    "INSERT INTO perfil_jogadores_reputacoes (rater_uuid, target_uuid, rating) VALUES (:rater_uuid, :target_uuid, :rating) ON DUPLICATE KEY UPDATE rating = :rating, updated_at = NOW()",
    { rater_uuid: raterUuid, target_uuid: targetUuid, rating },
  );

  revalidatePath(`/perfil/${nick}`);
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ nick: string }>;
}) {
  const session = await getServerSession(authOptions);
  const resolvedParams = await params;
  const nick = decodeURIComponent(resolvedParams.nick ?? "").trim();

  if (!nick) {
    notFound();
  }

  // Primeiro busca no player_accounts (fonte primária de UUIDs)
  const accountRows = await dbQuery<AccountNickRow[]>(
    "SELECT minecraft_uuid, minecraft_name FROM player_accounts WHERE LOWER(minecraft_name) = LOWER(:nick) LIMIT 1",
    { nick },
  );
  const account = accountRows[0] ?? null;
  
  let stats: AccountStatsRow | null = null;
  let uuid: string | null = null;

  if (account?.minecraft_uuid) {
    // SEMPRE usa o UUID do player_accounts (mesma fonte que a página de edição)
    uuid = account.minecraft_uuid;
    const statsRows = await dbQuery<AccountStatsRow[]>(
      "SELECT uuid, current_nick, total_playtime, mobs_killed, pvp_kills, blocks_broken, deaths, distance_traveled FROM account_stats WHERE uuid = :uuid LIMIT 1",
      { uuid },
    );
    stats = statsRows[0] ?? null;
    
    // Se não encontrou stats, cria um mínimo
    if (!stats) {
      stats = {
        uuid: account.minecraft_uuid,
        current_nick: account.minecraft_name,
        total_playtime: null,
        mobs_killed: null,
        pvp_kills: null,
        blocks_broken: null,
        deaths: null,
        distance_traveled: null,
      };
    }
  }

  // Fallback: se não encontrou em player_accounts, tenta direto no account_stats
  if (!stats) {
    const statsRows = await dbQuery<AccountStatsRow[]>(
      "SELECT uuid, current_nick, total_playtime, mobs_killed, pvp_kills, blocks_broken, deaths, distance_traveled FROM account_stats WHERE LOWER(current_nick) = LOWER(:nick) LIMIT 1",
      { nick },
    );
    stats = statsRows[0] ?? null;
    if (stats) {
      uuid = stats.uuid;
    }
  }

  if (!stats || !uuid) {
    notFound();
  }

  // Usa o UUID correto para todas as buscas
  let viewerUuid: string | null = null;
  if (session?.user?.playerId) {
    const viewerRows = await dbQuery<ViewerAccountRow[]>(
      "SELECT minecraft_uuid FROM player_accounts WHERE discord_id = :discord_id LIMIT 1",
      { discord_id: session.user.playerId },
    );
    viewerUuid = viewerRows[0]?.minecraft_uuid ?? null;
  }

  const isOwner = viewerUuid && viewerUuid === uuid;

  const profileRows = await dbQuery<ProfileRow[]>(
    "SELECT uuid, apelido, bio, estatisticas_publicas, privacidade, cor_favorita FROM perfil_jogadores WHERE uuid = :uuid LIMIT 1",
    { uuid },
  );
  const profile = profileRows[0] ?? null;
  const privacy = profile?.privacidade ?? "PUBLICA";

  if (privacy === "PRIVADA" && !isOwner) {
    return (
      <section className="section profile-page">
        <div className="container">
          <div className="card profile-locked">
            <span className="card-eyebrow">Perfil privado</span>
            <h2>Este perfil esta protegido</h2>
            <p className="muted">O jogador decidiu ocultar as informacoes publicas.</p>
          </div>
        </div>
      </section>
    );
  }

  const assetRows = await dbQuery<AssetRow[]>(
    "SELECT banner_url, avatar_url, ring_url FROM perfil_jogadores_assets WHERE uuid = :uuid LIMIT 1",
    { uuid },
  );
  const assets = assetRows[0] ?? null;

  const socials = await dbQuery<SocialRow[]>(
    `SELECT id, label, url, is_public
     FROM perfil_jogadores_redes
     WHERE uuid = :uuid ${isOwner ? "" : "AND is_public = 1"}
     ORDER BY sort_order ASC, id ASC`,
    { uuid },
  );

  // Busca TODOS os ranks ativos do jogador
  const rankRows = await dbQuery<RankRow[]>(
    "SELECT rank_id, expires_at, is_permanent FROM player_ranks WHERE player_uuid = :uuid AND (is_permanent = 1 OR expires_at >= NOW()) ORDER BY granted_at DESC",
    { uuid },
  );
  const ranks = rankRows.map((r) => ({
    ...r,
    tag: rankTags[String(r.rank_id).toLowerCase()],
  })).filter((r) => r.tag);

  // Rank principal (o mais recente)
  const rank = rankRows[0] ?? null;
  const rankTag = rank ? rankTags[String(rank.rank_id).toLowerCase()] : null;

  // Buscar tag de clã (se existir)
  type ClanRow = {
    clan_tag: string | null;
    clan_name: string | null;
    clan_color: string | null;
  };
  
  let clanInfo: ClanRow | null = null;
  try {
    const clanRows = await dbQuery<ClanRow[]>(
      "SELECT c.tag as clan_tag, c.name as clan_name, c.color as clan_color FROM clan_members cm JOIN clans c ON c.id = cm.clan_id WHERE cm.player_uuid = :uuid AND cm.active = 1 LIMIT 1",
      { uuid },
    );
    clanInfo = clanRows[0] ?? null;
  } catch {
    // Tabela de clãs não existe ainda
  }

  const accountLinkedRows = await dbQuery<LinkedAccountRow[]>(
    "SELECT discord_id, minecraft_name, account_type, is_bedrock FROM player_accounts WHERE minecraft_uuid = :uuid LIMIT 1",
    { uuid },
  );
  const accountLinked = accountLinkedRows[0] ?? null;
  const isOriginal = accountLinked?.account_type === "original" || accountLinked?.account_type === "java_original";
  const isBedrock = accountLinked?.account_type === "bedrock" || accountLinked?.is_bedrock === 1;
  const skinSource = accountLinked?.minecraft_name ?? stats.current_nick ?? "";
  const minecraftAvatar = isOriginal && !isBedrock && skinSource
    ? `https://minotar.net/helm/${encodeURIComponent(skinSource)}/128`
    : null;

  const badges = await dbQuery<BadgeRow[]>(
    "SELECT c.nome, c.descricao, c.icone FROM conquistas_jogadores cj JOIN conquistas c ON c.id = cj.conquista_id WHERE cj.jogador_uuid = :uuid AND cj.concluida = 1 ORDER BY cj.concluida_em DESC LIMIT 8",
    { uuid },
  );

  const staffNick = accountLinked?.minecraft_name ?? stats.current_nick ?? "";
  const staffRows = staffNick
    ? await dbQuery<StaffRoleRow[]>(
        `SELECT r.name AS role_name, r.color AS role_color
         FROM site_staff_members m
         LEFT JOIN site_staff_roles r ON r.id = m.role_id
         WHERE m.active = 1 AND r.active = 1 AND LOWER(m.minecraft) = LOWER(:minecraft)
         ORDER BY r.sort_order ASC, r.id ASC
         LIMIT 1`,
        { minecraft: staffNick },
      )
    : [];
  const staffRole = staffRows[0] ?? null;

  const forumPosts = await dbQuery<ForumPostRow[]>(
    `SELECT p.id, p.title, p.created_at, c.title AS category_title
     FROM site_forum_posts p
     LEFT JOIN site_forum_categories c ON c.id = p.category_id
     WHERE p.author_uuid = :uuid AND p.active = 1
     ORDER BY p.created_at DESC, p.id DESC
     LIMIT 6`,
    { uuid },
  );

  const acceptedReports = await dbQuery<ReportRow[]>(
    `SELECT r.id, r.reportado_uuid, r.motivo, r.reportadoEm, a.current_nick
     FROM reportes r
     LEFT JOIN account_stats a ON a.uuid = r.reportado_uuid
     WHERE r.reporter_uuid = :uuid AND r.status = 'ACEITO'
     ORDER BY r.reportadoEm DESC, r.id DESC
     LIMIT 6`,
    { uuid },
  );

  const punishedPlayers = await dbQuery<PunishedPlayerRow[]>(
    `SELECT DISTINCT r.reportado_uuid, a.current_nick
     FROM reportes r
     LEFT JOIN account_stats a ON a.uuid = r.reportado_uuid
     WHERE r.reporter_uuid = :uuid AND r.status = 'ACEITO'
     ORDER BY a.current_nick ASC
     LIMIT 6`,
    { uuid },
  );

  const reputationSummaryRows = await dbQuery<ReputationSummaryRow[]>(
    "SELECT AVG(rating) as avg_rating, COUNT(*) as total_count FROM perfil_jogadores_reputacoes WHERE target_uuid = :uuid",
    { uuid },
  );
  const reputationSummary = reputationSummaryRows[0] ?? { avg_rating: 0, total_count: 0 };
  const reputationAverage = toFloat(reputationSummary.avg_rating);
  const reputationCount = Number(reputationSummary.total_count ?? 0);

  const viewerVoteRows = viewerUuid
    ? await dbQuery<ReputationVoteRow[]>(
        "SELECT rating, updated_at FROM perfil_jogadores_reputacoes WHERE rater_uuid = :rater_uuid AND target_uuid = :target_uuid LIMIT 1",
        { rater_uuid: viewerUuid, target_uuid: uuid },
      )
    : [];
  const viewerVote = viewerVoteRows[0] ?? null;

  const displayName = profile?.apelido?.trim() || stats.current_nick || "Jogador";
  const showStats = profile?.estatisticas_publicas !== 0;
  const bannerStyle = assets?.banner_url
    ? { backgroundImage: `url(${assets.banner_url})` }
    : profile?.cor_favorita
      ? { backgroundImage: `linear-gradient(135deg, ${profile.cor_favorita}55, rgba(0,0,0,0.65))` }
      : undefined;

  return (
    <section className="section discord-profile-page">
      <div className="discord-profile-container">
        {/* Banner */}
        <div className="discord-profile-banner" style={bannerStyle}>
          {!assets?.banner_url && !profile?.cor_favorita && (
            <div className="discord-profile-banner-default" />
          )}
        </div>

        {/* Corpo principal */}
        <div className="discord-profile-body">
          {/* Avatar e header */}
          <div className="discord-profile-header">
            <div className="discord-profile-header-content">
              <div className="discord-profile-avatar-wrapper">
                {assets?.ring_url && (
                  <img src={assets.ring_url} alt="Moldura" className="discord-profile-ring" />
                )}
                {assets?.avatar_url ? (
                  <img src={assets.avatar_url} alt={displayName} className="discord-profile-avatar" />
                ) : minecraftAvatar ? (
                  <img src={minecraftAvatar} alt={displayName} className="discord-profile-avatar" />
                ) : (
                  <div className="discord-profile-avatar discord-profile-avatar-fallback">
                    <User size={64} />
                  </div>
                )}
              </div>

              <div className="discord-profile-name-section">
                <h1 className="discord-profile-name">{displayName}</h1>
                <span className="discord-profile-username">@{stats.current_nick ?? "-"}</span>
              </div>
            </div>

            {isOwner && (
              <Link href="/perfil" className="btn secondary btn-sm discord-profile-edit-btn">
                Editar perfil
              </Link>
            )}
          </div>

          <div className="discord-profile-content">
            {/* Coluna principal */}
            <div className="discord-profile-main">
              {/* Cargos / Roles */}
              {(ranks.length > 0 || staffRole || clanInfo) && (
                <div className="discord-section">
                  <h3 className="discord-section-title">CARGOS</h3>
                  <div className="discord-roles-list">
                    {/* Tag de Clã */}
                    {clanInfo?.clan_tag && (
                      <div className="discord-role discord-role-clan">
                        <div
                          className="discord-role-color"
                          style={{
                            background: clanInfo.clan_color || "rgba(var(--accent), 0.5)",
                          }}
                        />
                        <div className="discord-role-info">
                          <div className="discord-role-name">[{clanInfo.clan_tag}] {clanInfo.clan_name}</div>
                          <div className="discord-role-meta">Clã</div>
                        </div>
                      </div>
                    )}

                    {/* Staff Role */}
                    {staffRole?.role_name && (
                      <div className="discord-role">
                        <div
                          className="discord-role-color"
                          style={{
                            background: staffRole.role_color || "rgba(var(--primary), 0.5)",
                          }}
                        />
                        <div className="discord-role-info">
                          <div className="discord-role-name">{staffRole.role_name}</div>
                          <div className="discord-role-meta">Equipe</div>
                        </div>
                      </div>
                    )}

                    {/* Todos os Ranks */}
                    {ranks.map((r, idx) => (
                      <div key={`${r.rank_id}-${idx}`} className="discord-role">
                        <div
                          className="discord-role-color"
                          style={{
                            background: r.tag?.gradient || r.tag?.color || "rgba(var(--secondary), 0.5)",
                          }}
                        />
                        <div className="discord-role-info">
                          <div className="discord-role-name">{r.tag?.name || String(r.rank_id).toUpperCase()}</div>
                          <div className="discord-role-meta">
                            {r.is_permanent ? "Permanente" : `Expira ${new Date(r.expires_at!).toLocaleDateString("pt-BR")}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sobre */}
              <div className="discord-section">
                <h3 className="discord-section-title">SOBRE MIM</h3>
                <p className="discord-bio">{profile?.bio?.trim() || "Nenhuma bio adicionada."}</p>
              </div>

              {/* Stats em linha */}
              {showStats && (
                <div className="discord-section">
                  <h3 className="discord-section-title">ESTATÍSTICAS</h3>
                  <div className="discord-stats-grid">
                    <div className="discord-stat">
                      <span className="discord-stat-label">Tempo jogado</span>
                      <span className="discord-stat-value">{formatPlaytime(stats.total_playtime)}</span>
                    </div>
                    <div className="discord-stat">
                      <span className="discord-stat-label">PVP Kills</span>
                      <span className="discord-stat-value">{formatStat(stats.pvp_kills)}</span>
                    </div>
                    <div className="discord-stat">
                      <span className="discord-stat-label">Mobs abatidos</span>
                      <span className="discord-stat-value">{formatStat(stats.mobs_killed)}</span>
                    </div>
                    <div className="discord-stat">
                      <span className="discord-stat-label">Blocos quebrados</span>
                      <span className="discord-stat-value">{formatStat(stats.blocks_broken)}</span>
                    </div>
                    <div className="discord-stat">
                      <span className="discord-stat-label">Distância percorrida</span>
                      <span className="discord-stat-value">{formatStat(stats.distance_traveled)}</span>
                    </div>
                    <div className="discord-stat">
                      <span className="discord-stat-label">Mortes</span>
                      <span className="discord-stat-value">{formatStat(stats.deaths)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Fórum */}
              {forumPosts.length > 0 && (
                <div className="discord-section">
                  <h3 className="discord-section-title">POSTAGENS NO FÓRUM ({forumPosts.length})</h3>
                  <div className="discord-list">
                    {forumPosts.map((post) => (
                      <Link key={post.id} href={`/forum/topico/${post.id}`} className="discord-list-item">
                        <div>
                          <div className="discord-list-title">{post.title}</div>
                          <div className="discord-list-meta">{post.category_title ?? "Comunidade"} • {formatDate(post.created_at)}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="discord-profile-sidebar">
              {/* Redes sociais */}
              {socials.length > 0 && (
                <div className="discord-sidebar-section">
                  <h3 className="discord-sidebar-title">CONEXÕES</h3>
                  <div className="discord-connections">
                    {socials.map((social) => {
                      const meta = getSocialMeta(social.label);
                      const Icon = meta.icon;
                      return (
                        <a
                          key={social.id}
                          href={social.url}
                          target="_blank"
                          rel="noreferrer"
                          className="discord-connection"
                        >
                          <div className="discord-connection-icon">
                            <Icon size={20} />
                          </div>
                          <div className="discord-connection-info">
                            <div className="discord-connection-name">{meta.name}</div>
                            <div className="discord-connection-handle">{getSocialHandle(social.url)}</div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Conquistas/Badges */}
              {badges.length > 0 && (
                <div className="discord-sidebar-section">
                  <h3 className="discord-sidebar-title">CONQUISTAS ({badges.length})</h3>
                  <div className="discord-badges-compact">
                    {badges.slice(0, 8).map((badge) => (
                      <div key={badge.nome} className="discord-badge-compact" title={`${badge.nome} - ${badge.descricao}`}>
                        {badge.icone ? (
                          <span className="discord-badge-compact-icon">{badge.icone}</span>
                        ) : (
                          <span className="discord-badge-compact-icon">🏆</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reputação */}
              <div className="discord-sidebar-section">
                <h3 className="discord-sidebar-title">REPUTAÇÃO</h3>
                <div className="discord-reputation">
                  <div className="discord-reputation-score">
                    <span className="discord-reputation-value">{reputationAverage.toFixed(1)}</span>
                    <span className="discord-reputation-label">de 5.0</span>
                  </div>
                  <span className="discord-reputation-count">{reputationCount} avaliaç{reputationCount === 1 ? "ão" : "ões"}</span>

                  {viewerUuid && !isOwner && (
                    <form action={submitReputation} className="discord-reputation-form">
                      <input type="hidden" name="target_uuid" value={uuid} />
                      <input type="hidden" name="nick" value={stats.current_nick ?? ""} />
                      <select name="rating" defaultValue={Number(viewerVote?.rating ?? 0) || 5} className="discord-select">
                        <option value={5}>★★★★★ Excelente</option>
                        <option value={4}>★★★★☆ Muito bom</option>
                        <option value={3}>★★★☆☆ Bom</option>
                        <option value={2}>★★☆☆☆ Regular</option>
                        <option value={1}>★☆☆☆☆ Ruim</option>
                      </select>
                      <button className="btn primary btn-sm" type="submit">
                        Avaliar
                      </button>
                      {viewerVote?.updated_at && (
                        <span className="discord-reputation-last">Última: {formatDate(viewerVote.updated_at)}</span>
                      )}
                    </form>
                  )}
                </div>
              </div>

              {/* Denúncias aceitas */}
              {acceptedReports.length > 0 && (
                <div className="discord-sidebar-section">
                  <h3 className="discord-sidebar-title">DENÚNCIAS ACEITAS ({acceptedReports.length})</h3>
                  <div className="discord-list-compact">
                    {acceptedReports.slice(0, 5).map((report) => (
                      <div key={report.id} className="discord-list-compact-item">
                        <div className="discord-list-compact-name">{report.current_nick ?? "Jogador"}</div>
                        <div className="discord-list-compact-desc">{report.motivo}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
