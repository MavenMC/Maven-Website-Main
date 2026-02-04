import { revalidatePath } from "next/cache";
import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

type SocialRow = {
  id: number;
  label: string;
  url: string;
  icon: string | null;
  sort_order: number;
  active: number;
};

async function getLinks() {
  return dbQuery<SocialRow[]>(
    "SELECT id, label, url, icon, sort_order, active FROM site_social_links ORDER BY sort_order ASC, id ASC",
  );
}

async function createLink(formData: FormData) {
  "use server";
  await requireAdmin();

  const label = String(formData.get("label") || "").trim();
  const url = String(formData.get("url") || "").trim();
  const icon = String(formData.get("icon") || "").trim() || null;
  const sortOrder = Number(formData.get("sort_order") || 0);
  const active = formData.get("active") === "on" ? 1 : 0;

  if (!label || !url) return;

  await dbQuery(
    `INSERT INTO site_social_links (label, url, icon, sort_order, active)
     VALUES (:label, :url, :icon, :sort_order, :active)`,
    { label, url, icon, sort_order: sortOrder, active },
  );

  revalidatePath("/");
  revalidatePath("/admin/redes");
}

async function updateLink(formData: FormData) {
  "use server";
  await requireAdmin();

  const id = Number(formData.get("id"));
  const label = String(formData.get("label") || "").trim();
  const url = String(formData.get("url") || "").trim();
  const icon = String(formData.get("icon") || "").trim() || null;
  const sortOrder = Number(formData.get("sort_order") || 0);
  const active = formData.get("active") === "on" ? 1 : 0;

  if (!id || !label || !url) return;

  await dbQuery(
    `UPDATE site_social_links
     SET label = :label,
         url = :url,
         icon = :icon,
         sort_order = :sort_order,
         active = :active
     WHERE id = :id`,
    { id, label, url, icon, sort_order: sortOrder, active },
  );

  revalidatePath("/");
  revalidatePath("/admin/redes");
}

async function deleteLink(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  await dbQuery("DELETE FROM site_social_links WHERE id = :id", { id });
  revalidatePath("/");
  revalidatePath("/admin/redes");
}

export default async function AdminSocialPage() {
  const links = await getLinks();

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Redes sociais</h1>
        <p>Gerencie os links exibidos na home e no rodapé.</p>
      </header>

      <section className="admin-split">
        <div className="card admin-card">
          <h2 className="card-title">Novo link</h2>
          <form className="admin-form" action={createLink}>
            <label>
              Nome
              <input name="label" placeholder="Discord" />
            </label>
            <label>
              URL
              <input name="url" placeholder="https://discord.gg/mvn" />
            </label>
            <label>
              Ícone (ex: discord, youtube, instagram, twitch)
              <input name="icon" placeholder="discord" />
            </label>
            <label>
              Ordem
              <input type="number" name="sort_order" defaultValue={0} />
            </label>
            <label className="checkbox">
              <input type="checkbox" name="active" defaultChecked />
              Ativo
            </label>
            <button className="btn primary" type="submit">
              Salvar link
            </button>
          </form>
        </div>

        <div className="card admin-card">
          <h2 className="card-title">Links cadastrados</h2>
          <div className="admin-list">
            {links.map((link) => (
              <div key={link.id} className="card admin-card">
                <form className="admin-form" action={updateLink}>
                  <input type="hidden" name="id" value={link.id} />
                  <label>
                    Nome
                    <input name="label" defaultValue={link.label} />
                  </label>
                  <label>
                    URL
                    <input name="url" defaultValue={link.url} />
                  </label>
                  <label>
                    Ícone
                    <input name="icon" defaultValue={link.icon ?? ""} />
                  </label>
                  <label>
                    Ordem
                    <input type="number" name="sort_order" defaultValue={link.sort_order} />
                  </label>
                  <label className="checkbox">
                    <input type="checkbox" name="active" defaultChecked={Boolean(link.active)} />
                    Ativo
                  </label>
                  <button className="btn primary" type="submit">
                    Atualizar
                  </button>
                </form>
                <form action={deleteLink}>
                  <input type="hidden" name="id" value={link.id} />
                  <button className="btn ghost" type="submit">
                    Remover
                  </button>
                </form>
              </div>
            ))}
            {!links.length && <p className="muted">Nenhum link cadastrado.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
