import { revalidatePath } from "next/cache";
import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import fs from "fs/promises";
import path from "path";

type AssetRow = {
  uuid: string;
  banner_url: string | null;
  avatar_url: string | null;
  ring_url: string | null;
};

type CleanupResult = {
  success: boolean;
  deletedCount: number;
  deletedSizeMB: string;
  errors: string[];
  message: string;
};

/**
 * Rotina de limpeza de arquivos órfãos
 * Remove arquivos de upload que não estão mais referenciados no banco de dados
 */
async function cleanOrphanUploads(formData: FormData): Promise<void> {
  "use server";
  await requireAdmin();

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "profiles");

  // Verificar se o diretório existe
  try {
    await fs.access(uploadsDir);
  } catch {
    // Diretório não existe, nada a fazer
  }

  const allAssets = await dbQuery<AssetRow[]>(
    "SELECT uuid, banner_url, avatar_url, ring_url FROM perfil_jogadores_assets"
  );

  // Criar set de URLs válidas
  const validUrls = new Set<string>();
  for (const asset of allAssets) {
    if (asset.banner_url) validUrls.add(asset.banner_url);
    if (asset.avatar_url) validUrls.add(asset.avatar_url);
    if (asset.ring_url) validUrls.add(asset.ring_url);
  }

  let deletedCount = 0;
  let deletedSize = 0;
  const errors: string[] = [];

  try {
    const uuidDirs = await fs.readdir(uploadsDir);

    for (const uuidDir of uuidDirs) {
      const dirPath = path.join(uploadsDir, uuidDir);

      let stat;
      try {
        stat = await fs.stat(dirPath);
      } catch {
        continue;
      }

      if (!stat.isDirectory()) continue;

      const files = await fs.readdir(dirPath);

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const relativePath = `/uploads/profiles/${uuidDir}/${file}`;

        // Se o arquivo não está no banco, deletar
        if (!validUrls.has(relativePath)) {
          try {
            const fileStats = await fs.stat(filePath);
            await fs.unlink(filePath);
            deletedCount++;
            deletedSize += fileStats.size;
            console.log(`[Cleanup] Deletado: ${relativePath}`);
          } catch (err) {
            errors.push(`Erro ao deletar ${relativePath}: ${err}`);
          }
        }
      }

      // Remover diretório se estiver vazio
      try {
        const remainingFiles = await fs.readdir(dirPath);
        if (remainingFiles.length === 0) {
          await fs.rmdir(dirPath);
          console.log(`[Cleanup] Diretório vazio removido: ${uuidDir}`);
        }
      } catch {
        // Ignorar erros ao remover diretório
      }
    }
  } catch (err) {
    errors.push(`Erro geral: ${err}`);
  }

  revalidatePath("/admin/limpeza");
}

export default async function CleanupPage() {
  await requireAdmin();

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Limpeza de Arquivos</h1>
        <p>
          Remove arquivos de perfil que não estão mais referenciados no banco de dados.
          <br />
          <strong>Use com cuidado!</strong> Esta operação não pode ser desfeita.
        </p>
      </header>

      <section className="card admin-card">
        <h2 className="card-title">Limpar arquivos órfãos</h2>
        <p className="muted" style={{ marginBottom: "1rem" }}>
          Arquivos órfãos são imagens de perfil (banners, avatares, molduras) que foram deletados do banco de dados mas
          ainda ocupam espaço no disco.
        </p>

        <form action={cleanOrphanUploads}>
          <button type="submit" className="btn danger-ghost">
            Executar Limpeza
          </button>
        </form>
      </section>

      <section className="card admin-card" style={{ marginTop: "2rem" }}>
        <h3 className="card-title">Como funciona?</h3>
        <ul style={{ paddingLeft: "1.5rem", color: "rgb(var(--muted))", lineHeight: "1.8" }}>
          <li>
            <strong>Varredura:</strong> Lista todos os arquivos em <code>/public/uploads/profiles/</code>
          </li>
          <li>
            <strong>Verificação:</strong> Compara com as referências no banco de dados
          </li>
          <li>
            <strong>Remoção:</strong> Deleta arquivos que não estão referenciados
          </li>
          <li>
            <strong>Diretórios:</strong> Remove diretórios vazios após a limpeza
          </li>
        </ul>

        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            borderRadius: "12px",
            background: "rgba(var(--secondary), 0.1)",
            border: "1px solid rgba(var(--secondary), 0.3)",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.875rem" }}>
            <strong>💡 Dica:</strong> Execute esta limpeza periodicamente (ex: mensalmente) para manter o servidor
            organizado e economizar espaço em disco.
          </p>
        </div>
      </section>
    </div>
  );
}
