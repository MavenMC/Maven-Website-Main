import { revalidatePath } from "next/cache";
import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { formatDateInput } from "@/lib/date";

type AnnouncementRow = {
  id: number;
  title: string;
  highlight: string | null;
  ip_text: string | null;
  active: number;
  starts_at: Date | string | null;
  ends_at: Date | string | null;
  sort_order: number;
};

async function getAnnouncements() {
  return dbQuery<AnnouncementRow[]>(
    "SELECT id, title, highlight, ip_text, active, starts_at, ends_at, sort_order FROM site_announcements ORDER BY sort_order ASC, id DESC",
  );
}

async function createAnnouncement(formData: FormData) {
  "use server";
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const highlight = String(formData.get("highlight") || "").trim() || null;
  const ipText = String(formData.get("ip_text") || "").trim() || null;
  const startsAt = String(formData.get("starts_at") || "").trim() || null;
  const endsAt = String(formData.get("ends_at") || "").trim() || null;
  const sortOrder = Number(formData.get("sort_order") || 0);
  const active = formData.get("active") === "on" ? 1 : 0;

  if (!title) return;

  await dbQuery(
    `INSERT INTO site_announcements (title, highlight, ip_text, active, starts_at, ends_at, sort_order)
     VALUES (:title, :highlight, :ip_text, :active, :starts_at, :ends_at, :sort_order)`,
    {
      title,
      highlight,
      ip_text: ipText,
      active,
      starts_at: startsAt || null,
      ends_at: endsAt || null,
      sort_order: sortOrder,
    },
  );

  revalidatePath("/");
  revalidatePath("/admin/anuncio");
}

async function updateAnnouncement(formData: FormData) {
  "use server";
  await requireAdmin();

  const id = Number(formData.get("id"));
  const title = String(formData.get("title") || "").trim();
  const highlight = String(formData.get("highlight") || "").trim() || null;
  const ipText = String(formData.get("ip_text") || "").trim() || null;
  const startsAt = String(formData.get("starts_at") || "").trim() || null;
  const endsAt = String(formData.get("ends_at") || "").trim() || null;
  const sortOrder = Number(formData.get("sort_order") || 0);
  const active = formData.get("active") === "on" ? 1 : 0;

  if (!id || !title) return;

  await dbQuery(
    `UPDATE site_announcements
     SET title = :title,
         highlight = :highlight,
         ip_text = :ip_text,
         active = :active,
         starts_at = :starts_at,
         ends_at = :ends_at,
         sort_order = :sort_order
     WHERE id = :id`,
    {
      id,
      title,
      highlight,
      ip_text: ipText,
      active,
      starts_at: startsAt || null,
      ends_at: endsAt || null,
      sort_order: sortOrder,
    },
  );

  revalidatePath("/");
  revalidatePath("/admin/anuncio");
}

async function deleteAnnouncement(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  await dbQuery("DELETE FROM site_announcements WHERE id = :id", { id });
  revalidatePath("/");
  revalidatePath("/admin/anuncio");
}

export default async function AdminAnnouncementPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Anúncio do topo</h1>
        <p>Gerencie o banner acima da navbar.</p>
      </header>

      <section className="admin-split">
        <div className="card admin-card">
          <h2 className="card-title">Novo anúncio</h2>
          <form className="admin-form" action={createAnnouncement}>
            <label>
              Título
              <input name="title" placeholder="Temporada 5 no ar" />
            </label>
            <label>
              Destaque
              <input name="highlight" placeholder="Eventos semanais" />
            </label>
            <label>
              IP
              <input name="ip_text" placeholder="mavenmc.com.br" />
            </label>
            <label>
              Início
              <input type="date" name="starts_at" />
            </label>
            <label>
              Fim
              <input type="date" name="ends_at" />
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
              Salvar anúncio
            </button>
          </form>
        </div>

        <div className="card admin-card">
          <h2 className="card-title">Anúncios existentes</h2>
          <div className="admin-list">
            {announcements.map((item) => (
              <div key={item.id} className="card admin-card">
                <form className="admin-form" action={updateAnnouncement}>
                  <input type="hidden" name="id" value={item.id} />
                  <label>
                    Título
                    <input name="title" defaultValue={item.title} />
                  </label>
                  <label>
                    Destaque
                    <input name="highlight" defaultValue={item.highlight ?? ""} />
                  </label>
                  <label>
                    IP
                    <input name="ip_text" defaultValue={item.ip_text ?? ""} />
                  </label>
                  <label>
                    Início
                    <input
                      type="date"
                      name="starts_at"
                      defaultValue={formatDateInput(item.starts_at)}
                    />
                  </label>
                  <label>
                    Fim
                    <input
                      type="date"
                      name="ends_at"
                      defaultValue={formatDateInput(item.ends_at)}
                    />
                  </label>
                  <label>
                    Ordem
                    <input type="number" name="sort_order" defaultValue={item.sort_order} />
                  </label>
                  <label className="checkbox">
                    <input type="checkbox" name="active" defaultChecked={Boolean(item.active)} />
                    Ativo
                  </label>
                  <div className="admin-actions">
                    <button className="btn primary" type="submit">
                      Atualizar
                    </button>
                  </div>
                </form>
                <form action={deleteAnnouncement}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className="btn ghost" type="submit">
                    Remover
                  </button>
                </form>
              </div>
            ))}
            {!announcements.length && <p className="muted">Nenhum anúncio cadastrado.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
