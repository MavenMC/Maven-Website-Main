import { revalidatePath } from "next/cache";
import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

type AdminRow = {
  discord_id: string;
  role: string;
  created_at: Date | string;
};

async function getAdmins() {
  return dbQuery<AdminRow[]>(
    "SELECT discord_id, role, created_at FROM site_admins ORDER BY created_at DESC",
  );
}

async function createAdmin(formData: FormData) {
  "use server";
  await requireAdmin();

  const discordId = String(formData.get("discord_id") || "").trim();
  const role = String(formData.get("role") || "admin").trim() || "admin";

  if (!discordId) return;

  await dbQuery(
    "INSERT INTO site_admins (discord_id, role) VALUES (:discord_id, :role) ON DUPLICATE KEY UPDATE role = :role",
    { discord_id: discordId, role },
  );

  revalidatePath("/admin/admins");
}

async function updateAdmin(formData: FormData) {
  "use server";
  await requireAdmin();

  const discordId = String(formData.get("discord_id") || "").trim();
  const role = String(formData.get("role") || "admin").trim() || "admin";

  if (!discordId) return;

  await dbQuery("UPDATE site_admins SET role = :role WHERE discord_id = :discord_id", {
    discord_id: discordId,
    role,
  });

  revalidatePath("/admin/admins");
}

async function deleteAdmin(formData: FormData) {
  "use server";
  await requireAdmin();
  const discordId = String(formData.get("discord_id") || "").trim();
  if (!discordId) return;
  await dbQuery("DELETE FROM site_admins WHERE discord_id = :discord_id", { discord_id: discordId });
  revalidatePath("/admin/admins");
}

export default async function AdminAdminsPage() {
  const admins = await getAdmins();

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Admins</h1>
        <p>Controle quem pode acessar o painel administrativo.</p>
      </header>

      <section className="admin-split">
        <div className="card admin-card">
          <h2 className="card-title">Novo admin</h2>
          <form className="admin-form" action={createAdmin}>
            <label>
              Discord ID
              <input name="discord_id" placeholder="123456789012345678" />
            </label>
            <label>
              Função
              <input name="role" placeholder="admin" />
            </label>
            <button className="btn primary" type="submit">
              Adicionar
            </button>
          </form>
        </div>

        <div className="card admin-card">
          <h2 className="card-title">Admins cadastrados</h2>
          <div className="admin-list">
            {admins.map((admin) => (
              <div key={admin.discord_id} className="card admin-card">
                <form className="admin-form" action={updateAdmin}>
                  <label>
                    Discord ID
                    <input name="discord_id" defaultValue={admin.discord_id} readOnly />
                  </label>
                  <label>
                    Função
                    <input name="role" defaultValue={admin.role} />
                  </label>
                  <button className="btn primary" type="submit">
                    Atualizar
                  </button>
                </form>
                <form action={deleteAdmin}>
                  <input type="hidden" name="discord_id" value={admin.discord_id} />
                  <button className="btn ghost" type="submit">
                    Remover
                  </button>
                </form>
              </div>
            ))}
            {!admins.length && <p className="muted">Nenhum admin cadastrado.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
