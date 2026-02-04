import { revalidatePath } from "next/cache";
import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { formatDateInput } from "@/lib/date";

type ChangelogRow = {
  id: number;
  version: string;
  title: string;
  items_json: string | null;
  published_at: Date | string | null;
  sort_order: number;
  active: number;
};

function normalizeItems(raw: string) {
  const items = raw
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? JSON.stringify(items) : null;
}

function itemsToText(itemsJson: string | null) {
  if (!itemsJson) return "";
  try {
    const parsed = JSON.parse(itemsJson);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item)).join("\n");
    }
  } catch {
    return itemsJson;
  }
  return itemsJson;
}

async function getEntries() {
  return dbQuery<ChangelogRow[]>(
    "SELECT id, version, title, items_json, published_at, sort_order, active FROM site_changelog_entries ORDER BY published_at DESC, sort_order ASC, id DESC",
  );
}

async function createEntry(formData: FormData) {
  "use server";
  await requireAdmin();

  const version = String(formData.get("version") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const itemsRaw = String(formData.get("items") || "");
  const publishedAt = String(formData.get("published_at") || "").trim() || null;
  const sortOrder = Number(formData.get("sort_order") || 0);
  const active = formData.get("active") === "on" ? 1 : 0;

  if (!version || !title) return;

  await dbQuery(
    `INSERT INTO site_changelog_entries
      (version, title, items_json, published_at, sort_order, active)
     VALUES
      (:version, :title, :items_json, :published_at, :sort_order, :active)`,
    {
      version,
      title,
      items_json: normalizeItems(itemsRaw),
      published_at: publishedAt || null,
      sort_order: sortOrder,
      active,
    },
  );

  revalidatePath("/");
  revalidatePath("/changelog");
  revalidatePath("/admin/changelog");
}

async function updateEntry(formData: FormData) {
  "use server";
  await requireAdmin();

  const id = Number(formData.get("id"));
  const version = String(formData.get("version") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const itemsRaw = String(formData.get("items") || "");
  const publishedAt = String(formData.get("published_at") || "").trim() || null;
  const sortOrder = Number(formData.get("sort_order") || 0);
  const active = formData.get("active") === "on" ? 1 : 0;

  if (!id || !version || !title) return;

  await dbQuery(
    `UPDATE site_changelog_entries
     SET version = :version,
         title = :title,
         items_json = :items_json,
         published_at = :published_at,
         sort_order = :sort_order,
         active = :active
     WHERE id = :id`,
    {
      id,
      version,
      title,
      items_json: normalizeItems(itemsRaw),
      published_at: publishedAt || null,
      sort_order: sortOrder,
      active,
    },
  );

  revalidatePath("/");
  revalidatePath("/changelog");
  revalidatePath("/admin/changelog");
}

async function deleteEntry(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  await dbQuery("DELETE FROM site_changelog_entries WHERE id = :id", { id });
  revalidatePath("/");
  revalidatePath("/changelog");
  revalidatePath("/admin/changelog");
}

export default async function AdminChangelogPage() {
  const entries = await getEntries();

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Changelog</h1>
        <p>Controle as entradas detalhadas do servidor.</p>
      </header>

      <section className="admin-split">
        <div className="card admin-card">
          <h2 className="card-title">Nova entrada</h2>
          <form className="admin-form" action={createEntry}>
            <label>
              Versão
              <input name="version" placeholder="v5.0.2" />
            </label>
            <label>
              Título
              <input name="title" placeholder="Equilíbrio de combate" />
            </label>
            <label>
              Itens (1 por linha)
              <textarea name="items" rows={6} placeholder="Buff em espadas\nAjuste em flechas" />
            </label>
            <label>
              Data
              <input type="date" name="published_at" />
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
              Salvar entrada
            </button>
          </form>
        </div>

        <div className="card admin-card">
          <h2 className="card-title">Entradas cadastradas</h2>
          <div className="admin-list">
            {entries.map((entry) => (
              <div key={entry.id} className="card admin-card">
                <form className="admin-form" action={updateEntry}>
                  <input type="hidden" name="id" value={entry.id} />
                  <label>
                    Versão
                    <input name="version" defaultValue={entry.version} />
                  </label>
                  <label>
                    Título
                    <input name="title" defaultValue={entry.title} />
                  </label>
                  <label>
                    Itens (1 por linha)
                    <textarea name="items" rows={6} defaultValue={itemsToText(entry.items_json)} />
                  </label>
                  <label>
                    Data
                    <input
                      type="date"
                      name="published_at"
                      defaultValue={formatDateInput(entry.published_at)}
                    />
                  </label>
                  <label>
                    Ordem
                    <input type="number" name="sort_order" defaultValue={entry.sort_order} />
                  </label>
                  <label className="checkbox">
                    <input type="checkbox" name="active" defaultChecked={Boolean(entry.active)} />
                    Ativo
                  </label>
                  <button className="btn primary" type="submit">
                    Atualizar
                  </button>
                </form>
                <form action={deleteEntry}>
                  <input type="hidden" name="id" value={entry.id} />
                  <button className="btn ghost" type="submit">
                    Remover
                  </button>
                </form>
              </div>
            ))}
            {!entries.length && <p className="muted">Nenhuma entrada cadastrada.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
