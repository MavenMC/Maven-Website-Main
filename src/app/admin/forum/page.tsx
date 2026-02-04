import { revalidatePath } from "next/cache";
import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

type ForumRow = {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
  variant: string | null;
  sort_order: number;
  active: number;
};

async function getCategories() {
  return dbQuery<ForumRow[]>(
    "SELECT id, title, description, icon, variant, sort_order, active FROM site_forum_categories ORDER BY sort_order ASC, id ASC",
  );
}

async function createCategory(formData: FormData) {
  "use server";
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const icon = String(formData.get("icon") || "").trim() || null;
  const variant = String(formData.get("variant") || "").trim() || null;
  const sortOrder = Number(formData.get("sort_order") || 0);
  const active = formData.get("active") === "on" ? 1 : 0;

  if (!title) return;

  await dbQuery(
    `INSERT INTO site_forum_categories (title, description, icon, variant, sort_order, active)
     VALUES (:title, :description, :icon, :variant, :sort_order, :active)`,
    { title, description, icon, variant, sort_order: sortOrder, active },
  );

  revalidatePath("/");
  revalidatePath("/forum");
  revalidatePath("/admin/forum");
}

async function updateCategory(formData: FormData) {
  "use server";
  await requireAdmin();

  const id = Number(formData.get("id"));
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const icon = String(formData.get("icon") || "").trim() || null;
  const variant = String(formData.get("variant") || "").trim() || null;
  const sortOrder = Number(formData.get("sort_order") || 0);
  const active = formData.get("active") === "on" ? 1 : 0;

  if (!id || !title) return;

  await dbQuery(
    `UPDATE site_forum_categories
     SET title = :title,
         description = :description,
         icon = :icon,
         variant = :variant,
         sort_order = :sort_order,
         active = :active
     WHERE id = :id`,
    { id, title, description, icon, variant, sort_order: sortOrder, active },
  );

  revalidatePath("/");
  revalidatePath("/forum");
  revalidatePath("/admin/forum");
}

async function deleteCategory(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  await dbQuery("DELETE FROM site_forum_categories WHERE id = :id", { id });
  revalidatePath("/");
  revalidatePath("/forum");
  revalidatePath("/admin/forum");
}

export default async function AdminForumPage() {
  const categories = await getCategories();

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Fórum</h1>
        <p>Gerencie as categorias exibidas no site.</p>
      </header>

      <section className="admin-split">
        <div className="card admin-card">
          <h2 className="card-title">Nova categoria</h2>
          <form className="admin-form" action={createCategory}>
            <label>
              Título
              <input name="title" placeholder="Avisos e novidades" />
            </label>
            <label>
              Descrição
              <textarea name="description" rows={3} />
            </label>
            <label>
              Ícone (ex: megaphone, lifebuoy, sparkles, users, shieldcheck, message-square)
              <input name="icon" placeholder="megaphone" />
            </label>
            <label>
              Variante (plane, headset, shield)
              <input name="variant" placeholder="plane" />
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
              Salvar categoria
            </button>
          </form>
        </div>

        <div className="card admin-card">
          <h2 className="card-title">Categorias existentes</h2>
          <div className="admin-list">
            {categories.map((category) => (
              <div key={category.id} className="card admin-card">
                <form className="admin-form" action={updateCategory}>
                  <input type="hidden" name="id" value={category.id} />
                  <label>
                    Título
                    <input name="title" defaultValue={category.title} />
                  </label>
                  <label>
                    Descrição
                    <textarea name="description" rows={3} defaultValue={category.description ?? ""} />
                  </label>
                  <label>
                    Ícone
                    <input name="icon" defaultValue={category.icon ?? ""} />
                  </label>
                  <label>
                    Variante
                    <input name="variant" defaultValue={category.variant ?? ""} />
                  </label>
                  <label>
                    Ordem
                    <input type="number" name="sort_order" defaultValue={category.sort_order} />
                  </label>
                  <label className="checkbox">
                    <input type="checkbox" name="active" defaultChecked={Boolean(category.active)} />
                    Ativo
                  </label>
                  <button className="btn primary" type="submit">
                    Atualizar
                  </button>
                </form>
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={category.id} />
                  <button className="btn ghost" type="submit">
                    Remover
                  </button>
                </form>
              </div>
            ))}
            {!categories.length && <p className="muted">Nenhuma categoria cadastrada.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
