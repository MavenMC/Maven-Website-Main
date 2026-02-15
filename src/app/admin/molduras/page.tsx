import { revalidatePath } from "next/cache";
import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

type FrameRow = {
  id: number;
  name: string;
  description: string | null;
  image_url: string;
  preview_url: string | null;
  rarity: string | null;
  active: number;
  sort_order: number;
};

async function getFrames() {
  return dbQuery<FrameRow[]>(
    "SELECT id, name, description, image_url, preview_url, rarity, active, sort_order FROM site_profile_frames ORDER BY sort_order ASC, id DESC"
  );
}

async function createFrame(formData: FormData) {
  "use server";
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const imageUrl = String(formData.get("image_url") || "").trim();
  const previewUrl = String(formData.get("preview_url") || "").trim() || null;
  const rarity = String(formData.get("rarity") || "common").trim();
  const sortOrder = Number(formData.get("sort_order") || 0);
  const active = formData.get("active") === "on" ? 1 : 0;

  if (!name || !imageUrl) return;

  await dbQuery(
    `INSERT INTO site_profile_frames
      (name, description, image_url, preview_url, rarity, sort_order, active)
     VALUES
      (:name, :description, :image_url, :preview_url, :rarity, :sort_order, :active)`,
    {
      name,
      description,
      image_url: imageUrl,
      preview_url: previewUrl,
      rarity,
      sort_order: sortOrder,
      active,
    }
  );

  revalidatePath("/perfil");
  revalidatePath("/admin/molduras");
}

async function updateFrame(formData: FormData) {
  "use server";
  await requireAdmin();

  const id = Number(formData.get("id"));
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const imageUrl = String(formData.get("image_url") || "").trim();
  const previewUrl = String(formData.get("preview_url") || "").trim() || null;
  const rarity = String(formData.get("rarity") || "common").trim();
  const sortOrder = Number(formData.get("sort_order") || 0);
  const active = formData.get("active") === "on" ? 1 : 0;

  if (!id || !name || !imageUrl) return;

  await dbQuery(
    `UPDATE site_profile_frames
     SET name = :name,
         description = :description,
         image_url = :image_url,
         preview_url = :preview_url,
         rarity = :rarity,
         sort_order = :sort_order,
         active = :active
     WHERE id = :id`,
    {
      id,
      name,
      description,
      image_url: imageUrl,
      preview_url: previewUrl,
      rarity,
      sort_order: sortOrder,
      active,
    }
  );

  revalidatePath("/perfil");
  revalidatePath("/admin/molduras");
}

async function deleteFrame(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  await dbQuery("DELETE FROM site_profile_frames WHERE id = :id", { id });
  revalidatePath("/perfil");
  revalidatePath("/admin/molduras");
}

export default async function AdminMoldurasPage() {
  const frames = await getFrames();

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Molduras de Perfil</h1>
        <p>
          Gerencie as molduras personalizadas para avatares de jogadores.
          <br />
          <strong>Tamanho padrão: 512x512px PNG com transparência</strong>
        </p>
      </header>

      <section className="admin-split">
        <div className="card admin-card">
          <h2 className="card-title">Nova moldura</h2>
          <form className="admin-form" action={createFrame}>
            <label>
              Nome
              <input name="name" placeholder="Moldura Épica" required />
            </label>
            <label>
              Descrição
              <textarea name="description" rows={2} placeholder="Moldura exclusiva para eventos especiais" />
            </label>
            <label>
              URL da imagem (512x512px PNG)
              <input name="image_url" type="url" placeholder="/uploads/frames/epic-frame.png" required />
            </label>
            <label>
              URL do preview (opcional)
              <input name="preview_url" type="url" placeholder="/uploads/frames/epic-frame-preview.png" />
            </label>
            <label>
              Raridade
              <select name="rarity">
                <option value="common">Comum</option>
                <option value="uncommon">Incomum</option>
                <option value="rare">Rara</option>
                <option value="epic">Épica</option>
                <option value="legendary">Lendária</option>
              </select>
            </label>
            <label>
              Ordem
              <input name="sort_order" type="number" defaultValue={0} />
            </label>
            <label className="checkbox">
              <input name="active" type="checkbox" defaultChecked />
              Ativa
            </label>
            <button type="submit" className="btn btn-primary">
              Criar moldura
            </button>
          </form>
        </div>

        <div>
          <h2 className="card-title">Molduras cadastradas</h2>
          <div className="admin-list">
            {frames.map(frame => (
              <details key={frame.id} className="card admin-card admin-dropdown">
                <summary>
                  <div className="admin-row">
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      {frame.image_url && (
                        <img
                          src={frame.image_url}
                          alt={frame.name}
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "8px",
                            objectFit: "cover",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        />
                      )}
                      <div>
                        <strong>{frame.name}</strong>
                        {frame.description && (
                          <p className="muted" style={{ margin: "0.25rem 0 0" }}>
                            {frame.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="admin-badges">
                      <span className={`status-pill ${frame.active ? "active" : "inactive"}`}>
                        {frame.active ? "Ativa" : "Inativa"}
                      </span>
                      {frame.rarity && <span className="status-pill badge">{frame.rarity}</span>}
                    </div>
                  </div>
                </summary>
                <form className="dropdown-form" action={updateFrame}>
                  <input type="hidden" name="id" value={frame.id} />
                  <label>
                    Nome
                    <input name="name" defaultValue={frame.name} required />
                  </label>
                  <label>
                    Descrição
                    <textarea name="description" rows={2} defaultValue={frame.description || ""} />
                  </label>
                  <label>
                    URL da imagem (512x512px PNG)
                    <input name="image_url" type="url" defaultValue={frame.image_url} required />
                  </label>
                  <label>
                    URL do preview (opcional)
                    <input name="preview_url" type="url" defaultValue={frame.preview_url || ""} />
                  </label>
                  <label>
                    Raridade
                    <select name="rarity" defaultValue={frame.rarity || "common"}>
                      <option value="common">Comum</option>
                      <option value="uncommon">Incomum</option>
                      <option value="rare">Rara</option>
                      <option value="epic">Épica</option>
                      <option value="legendary">Lendária</option>
                    </select>
                  </label>
                  <label>
                    Ordem
                    <input name="sort_order" type="number" defaultValue={frame.sort_order} />
                  </label>
                  <label className="checkbox">
                    <input name="active" type="checkbox" defaultChecked={!!frame.active} />
                    Ativa
                  </label>
                  <div className="admin-actions">
                    <button type="submit" className="btn btn-sm">
                      Salvar
                    </button>
                    <form action={deleteFrame}>
                      <input type="hidden" name="id" value={frame.id} />
                      <button type="submit" className="btn btn-sm danger-ghost">
                        Excluir
                      </button>
                    </form>
                  </div>
                </form>
              </details>
            ))}

            {frames.length === 0 && (
              <div className="card admin-card">
                <p className="muted">Nenhuma moldura cadastrada ainda.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="card admin-card" style={{ marginTop: "2rem" }}>
        <h3 className="card-title">Especificações técnicas</h3>
        <ul style={{ paddingLeft: "1.5rem", color: "rgb(var(--muted))" }}>
          <li>
            <strong>Tamanho:</strong> 512x512 pixels (quadrado)
          </li>
          <li>
            <strong>Formato:</strong> PNG com canal alpha (transparência)
          </li>
          <li>
            <strong>Uso:</strong> Sobrepõe o avatar do jogador no perfil
          </li>
          <li>
            <strong>Design:</strong> Centro transparente para mostrar o avatar do jogador
          </li>
          <li>
            <strong>Upload:</strong> Faça upload das imagens em <code>/public/uploads/frames/</code> e use o caminho
            relativo
          </li>
        </ul>
      </section>
    </div>
  );
}
