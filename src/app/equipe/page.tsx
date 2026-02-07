import Link from "next/link";
import { Users } from "lucide-react";
import { dbQuery } from "@/lib/db";
import { resolveIcon } from "@/lib/icon-map";

type RoleRow = {
  id: number;
  slug: string;
  name: string;
  icon: string | null;
  color: string;
  sort_order: number;
};

type MemberRow = {
  id: number;
  role_id: number;
  name: string;
  minecraft: string;
  minecraft_uuid: string | null;
  responsibility: string | null;
  sort_order: number;
};

function getMinecraftAvatar(username: string): string {
  return `https://minotar.net/helm/${username}/128`;
}

function getMinecraftHead3d(uuid: string): string {
  return `https://mc-heads.net/head/${uuid}/512`;
}

async function getStaffData() {
  const roles = await dbQuery<RoleRow[]>(
    "SELECT id, slug, name, icon, color, sort_order FROM site_staff_roles WHERE active = 1 ORDER BY sort_order ASC, id ASC",
  );
  const members = await dbQuery<MemberRow[]>(
    `SELECT m.id,
            m.role_id,
            m.name,
            m.minecraft,
            m.minecraft_uuid,
            m.responsibility,
            m.sort_order
     FROM site_staff_members m
     WHERE m.active = 1
     ORDER BY m.sort_order ASC, m.id ASC`,
  );

  return roles.map((role) => ({
    ...role,
    members: members.filter((member) => member.role_id === role.id),
  }));
}

export default async function EquipePage() {
  const staffRoles = await getStaffData();

  // Separar cargos de liderança (CEO, Admin) dos demais
  const leadershipRoles = staffRoles.filter(role => 
    role.slug === 'ceo' || role.slug === 'admin'
  );
  const otherRoles = staffRoles.filter(role => 
    role.slug !== 'ceo' && role.slug !== 'admin'
  );

  return (
    <section className="section team-section">
      <div className="container">
        {/* Header */}
        <div className="team-header">
          <div className="team-header-badge">
            <Users size={32} strokeWidth={2.5} />
          </div>
          <div className="team-header-content">
            <h1 className="team-header-title">
              Nossa <span className="gradient-text">Equipe</span>
            </h1>
            <p className="team-header-subtitle">
              Conheça os profissionais que tornam tudo possível
            </p>
          </div>
        </div>

        {/* Leadership Section - Hero Cards */}
        {leadershipRoles.length > 0 && (
          <div className="leadership-section">
            <div className="leadership-grid">
              {leadershipRoles.map((role) => (
                role.members.map((member) => {
                  const Icon = resolveIcon(role.icon || role.slug, Users);
                  const minecraftAvatar = member.minecraft_uuid
                    ? getMinecraftHead3d(member.minecraft_uuid)
                    : getMinecraftAvatar(member.minecraft);
                  const responsibilityText = member.responsibility?.trim() || role.name;
                  
                  return (
                    <Link
                      key={member.id}
                      href={`/equipe/${encodeURIComponent(member.minecraft)}`}
                      className="hero-card"
                      style={{ "--role-color": role.color } as React.CSSProperties}
                    >
                      <div className="hero-card-glow"></div>
                      <div className="hero-card-content">
                        <div className="hero-card-avatar-wrapper">
                          <img
                            src={minecraftAvatar}
                            alt={member.minecraft}
                            className="hero-card-avatar"
                            loading="eager"
                          />
                        </div>
                        <div className="hero-card-info">
                          <div className="hero-card-badge">
                            <Icon size={14} strokeWidth={2.5} />
                            <span>{role.name}</span>
                          </div>
                          <h3 className="hero-card-name">{member.minecraft}</h3>
                          <p className="hero-card-role">{responsibilityText}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ))}
            </div>
          </div>
        )}

        {/* Other Staff Sections */}
        {otherRoles.map((role) => {
          if (role.members.length === 0) return null;
          
          const Icon = resolveIcon(role.icon || role.slug, Users);
          
          return (
            <div key={role.id} className="staff-section">
              <div className="staff-section-header">
                <div className="staff-section-icon" style={{ "--role-color": role.color } as React.CSSProperties}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <h2 className="staff-section-title">{role.name}</h2>
                <span className="staff-section-count">
                  {role.members.length} {role.members.length === 1 ? "membro" : "membros"}
                </span>
              </div>

              <div className="staff-grid">
                {role.members.map((member) => {
                  const minecraftAvatar = member.minecraft_uuid
                    ? getMinecraftHead3d(member.minecraft_uuid)
                    : getMinecraftAvatar(member.minecraft);
                  const responsibilityText = member.responsibility?.trim() || role.name;
                  
                  return (
                    <Link
                      key={member.id}
                      href={`/equipe/${encodeURIComponent(member.minecraft)}`}
                      className="staff-card"
                      style={{ "--role-color": role.color } as React.CSSProperties}
                    >
                      <div className="staff-card-header">
                        <img
                          src={minecraftAvatar}
                          alt={member.minecraft}
                          className="staff-card-avatar"
                          loading="lazy"
                        />
                        <div className="staff-card-badge">
                          <Icon size={12} strokeWidth={2.5} />
                        </div>
                      </div>
                      <div className="staff-card-body">
                        <h3 className="staff-card-name">{member.minecraft}</h3>
                        <p className="staff-card-responsibility">{responsibilityText}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
