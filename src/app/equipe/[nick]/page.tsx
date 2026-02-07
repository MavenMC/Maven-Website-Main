import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, Music2, Youtube } from "lucide-react";
import { dbQuery } from "@/lib/db";
import { formatShortDate } from "@/lib/date";

type StaffMemberRow = {
  id: number;
  name: string;
  minecraft: string;
  minecraft_uuid: string | null;
  discord_id: string | null;
  responsibility: string | null;
  role_name: string | null;
  role_color: string | null;
};

type StaffProfileRow = {
  bio: string | null;
  pronouns: string | null;
  main_gamemode: string | null;
  country: string | null;
  timezone: string | null;
  birthday: Date | string | null;
  staff_since: Date | string | null;
  first_joined: Date | string | null;
  discord_handle: string | null;
  youtube_handle: string | null;
  tiktok_handle: string | null;
};

function getMinecraftAvatar(username: string): string {
  return `https://minotar.net/body/${username}/320`;
}

function getMinecraftHead3d(uuid: string): string {
  return `https://mc-heads.net/body/${uuid}/512`;
}

function formatOptionalDate(value: Date | string | null) {
  if (!value) return "Nao informado";
  return formatShortDate(value) || "Nao informado";
}

function normalizeHandle(value: string | null | undefined) {
  if (!value) return "";
  return value.replace(/^@+/, "").trim();
}

export default async function StaffProfilePage({
  params,
}: {
  params: Promise<{ nick: string }>;
}) {
  const resolvedParams = await params;
  const nick = decodeURIComponent(resolvedParams.nick ?? "").trim();
  if (!nick) notFound();

  const staffRows = await dbQuery<StaffMemberRow[]>(
    `SELECT m.id,
            m.name,
            m.minecraft,
            m.minecraft_uuid,
            m.discord_id,
            m.responsibility,
            r.name AS role_name,
            r.color AS role_color
     FROM site_staff_members m
     LEFT JOIN site_staff_roles r ON r.id = m.role_id
     WHERE m.active = 1 AND LOWER(m.minecraft) = LOWER(:nick)
     ORDER BY m.id ASC
     LIMIT 1`,
    { nick },
  );

  const staff = staffRows[0];
  if (!staff) notFound();

  let profile: StaffProfileRow | null = null;
  try {
    const profileRows = await dbQuery<StaffProfileRow[]>(
      `SELECT bio,
              pronouns,
              main_gamemode,
              country,
              timezone,
              birthday,
              staff_since,
              first_joined,
              discord_handle,
              youtube_handle,
              tiktok_handle
       FROM site_staff_profiles
       WHERE member_id = :member_id
       LIMIT 1`,
      { member_id: staff.id },
    );
    profile = profileRows[0] ?? null;
  } catch (error) {
    console.warn("Tabela site_staff_profiles nao existe ou erro ao buscar perfil de staff:", error);
  }
  const avatar = staff.minecraft_uuid
    ? getMinecraftHead3d(staff.minecraft_uuid)
    : getMinecraftAvatar(staff.minecraft);

  const discordHandle = normalizeHandle(profile?.discord_handle);
  const youtubeHandle = normalizeHandle(profile?.youtube_handle);
  const tiktokHandle = normalizeHandle(profile?.tiktok_handle);

  const socialLinks = [
    discordHandle
      ? { label: "Discord", url: `https://discord.com/users/${encodeURIComponent(discordHandle)}`, icon: MessageCircle }
      : null,
    youtubeHandle
      ? { label: "YouTube", url: `https://www.youtube.com/@${encodeURIComponent(youtubeHandle)}`, icon: Youtube }
      : null,
    tiktokHandle
      ? { label: "TikTok", url: `https://www.tiktok.com/@${encodeURIComponent(tiktokHandle)}`, icon: Music2 }
      : null,
  ].filter(Boolean) as Array<{ label: string; url: string; icon: typeof MessageCircle }>;

  return (
    <section className="section staff-profile-page">
      <div className="container">
        <Link href="/equipe" className="btn ghost btn-sm staff-profile-back">
          Voltar para equipe
        </Link>

        <div className="staff-profile-card">
          <div className="staff-profile-left">
            <div className="staff-profile-avatar">
              <Image src={avatar} alt={staff.minecraft} width={260} height={260} />
            </div>
            <div className="staff-profile-handle">
              @{staff.minecraft}
            </div>
          </div>

          <div className="staff-profile-right">
            <div className="staff-profile-header">
              <h1>{staff.name}</h1>
              {staff.role_name && (
                <span
                  className="staff-role-badge"
                  style={{
                    background: staff.role_color
                      ? `${staff.role_color}1A`
                      : "rgba(255, 255, 255, 0.08)",
                    borderColor: staff.role_color
                      ? `${staff.role_color}4D`
                      : "rgba(255, 255, 255, 0.2)",
                    color: staff.role_color ?? "rgb(var(--text))",
                  }}
                >
                  {staff.role_name}
                </span>
              )}
            </div>

            <div className="staff-profile-sub">
              {profile?.pronouns ? <span>{profile.pronouns}</span> : null}
              {staff.discord_id ? <span>ID: {staff.discord_id}</span> : null}
            </div>

            <div className="staff-profile-section">
              <div className="staff-profile-section-title">Sobre</div>
              <p>{profile?.bio?.trim() || staff.responsibility || "Sem bio registrada."}</p>
            </div>

            <div className="staff-profile-section">
              <div className="staff-profile-section-title">Detalhes</div>
              <div className="staff-profile-grid">
                <div className="staff-profile-item">
                  <span>Funcao</span>
                  <strong>{staff.role_name || "Staff"}</strong>
                </div>
                <div className="staff-profile-item">
                  <span>Minecraft</span>
                  <strong>{staff.minecraft}</strong>
                </div>
                <div className="staff-profile-item">
                  <span>Gamemode</span>
                  <strong>{profile?.main_gamemode || "Nao informado"}</strong>
                </div>
                <div className="staff-profile-item">
                  <span>Pais</span>
                  <strong>{profile?.country || "Nao informado"}</strong>
                </div>
                <div className="staff-profile-item">
                  <span>Timezone</span>
                  <strong>{profile?.timezone || "Nao informado"}</strong>
                </div>
                <div className="staff-profile-item">
                  <span>Aniversario</span>
                  <strong>{formatOptionalDate(profile?.birthday ?? null)}</strong>
                </div>
                <div className="staff-profile-item">
                  <span>Staff desde</span>
                  <strong>{formatOptionalDate(profile?.staff_since ?? null)}</strong>
                </div>
                <div className="staff-profile-item">
                  <span>Entrou em</span>
                  <strong>{formatOptionalDate(profile?.first_joined ?? null)}</strong>
                </div>
              </div>
            </div>

            {socialLinks.length ? (
              <div className="staff-profile-section">
                <div className="staff-profile-section-title">Redes</div>
                <div className="staff-profile-socials">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.url}
                        className="staff-profile-social"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Icon size={16} aria-hidden="true" />
                        {social.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
