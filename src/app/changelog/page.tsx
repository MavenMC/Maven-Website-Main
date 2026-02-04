import Link from "next/link";
import { Clock } from "lucide-react";
import { getChangelogEntries } from "@/lib/site-data";
import { formatShortDate } from "@/lib/date";

export default async function ChangelogPage() {
  const changelogItems = await getChangelogEntries();

  const parseItems = (itemsJson: string | null) => {
    if (!itemsJson) return [];
    try {
      const parsed = JSON.parse(itemsJson);
      if (Array.isArray(parsed)) return parsed.map((item) => String(item));
    } catch {
      return itemsJson
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  };

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-kicker">Changelog</span>
              <h2>Histórico de alterações</h2>
              <p className="muted">
                Todas as mudanças oficiais organizadas por versão.
              </p>
            </div>
            <Link href="/patch-notes" className="btn secondary">
              Ver patch notes
            </Link>
          </div>

          <div className="meta-card card">
            <div>
              <span className="card-eyebrow">Status da temporada</span>
              <h3 className="card-title">Temporada 5 em andamento</h3>
              <p className="card-sub">
                Próxima atualização grande prevista para a semana 3 de fevereiro.
              </p>
              <div className="progress-wrap">
                <div className="progress-bar">
                  <span style={{ width: "64%" }} />
                </div>
                <div className="progress-meta">
                  <span>Planejamento</span>
                  <span>64%</span>
                </div>
              </div>
            </div>
            <div className="service-icon plane">
              <Clock />
            </div>
          </div>

          <div className="category-grid">
            {changelogItems.length ? (
              changelogItems.map((item) => (
                <article key={item.id} className="card">
                  <span className="card-eyebrow">
                    {item.version} • {formatShortDate(item.published_at) || "Sem data"}
                  </span>
                  <h3 className="card-title">{item.title}</h3>
                  <div>
                    {parseItems(item.items_json).map((entry) => (
                      <p key={entry} className="card-sub">
                        • {entry}
                      </p>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <div className="card">
                <h3>Sem changelog</h3>
                <p className="muted">Nenhuma entrada publicada ainda.</p>
              </div>
            )}
          </div>

          <div className="cta-strip">
            <div>
              <strong>Encontrou algo diferente?</strong>
              <p className="muted">Reporta no fórum e ajude a equipe a ajustar.</p>
            </div>
            <Link href="/forum" className="btn secondary btn-sm">
              Reportar bug
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
