import { redirect } from "next/navigation";
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

function formatAccountType(accountType: string | null, isBedrock: number | null) {
  if (accountType === "original") return "Original (Java)";
  if (accountType === "bedrock" || isBedrock) return "Bedrock";
  return "Pirata";
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
            <a href="/validar" className="btn primary">
              Vincular conta
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="section-kicker">Perfil</span>
            <h2>Resumo da sua conta</h2>
            <p className="muted">Veja suas informações e status no Maven Network.</p>
          </div>
          <a href="/validar" className="btn secondary">
            Gerenciar vínculo
          </a>
        </div>

        <div className="feature-grid">
          <div className="card">
            <span className="card-eyebrow">Discord</span>
            <div className="profile-card-head">
              {player.discord_avatar ? (
                <img
                  src={player.discord_avatar}
                  alt={player.discord_username ?? "Discord"}
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar" />
              )}
              <div>
                <h3 className="card-title">{player.discord_username ?? "Usuário não informado"}</h3>
                <p className="card-sub">ID: {player.discord_id}</p>
                <p className="card-sub">Email: {player.email ?? "Não informado"}</p>
              </div>
            </div>
          </div>

          <div className="card">
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

          <div className="card">
            <span className="card-eyebrow">Ações</span>
            <h3 className="card-title">Gerenciar conta</h3>
            <p className="card-sub">
              Atualize seu nick, escolha plataforma e vincule/desvincule sua conta.
            </p>
            <a href="/validar" className="btn primary btn-sm">
              Ir para vínculo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
