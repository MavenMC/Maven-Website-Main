import Link from "next/link";
import { Megaphone } from "lucide-react";
import { getSitePosts } from "@/lib/site-data";
import { formatShortDate } from "@/lib/date";

export default async function NoticiasPage() {
  const newsItems = await getSitePosts("news");

  return (
    <>
      <section className="hero">
        <div className="hero-grid-bg grid-background" aria-hidden="true" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="hero-copy-content">
              <span className="pill">Últimas atualizações</span>
              <h1>
                Central de <span className="gradient-text">Notícias</span>
              </h1>
              <p>
                Tudo o que acontece no Maven Network em um só lugar. Acompanhe anúncios
                oficiais, eventos e mudanças importantes no servidor.
              </p>
              <div className="hero-actions">
                <Link href="/forum" className="btn primary">
                  Participar da comunidade
                </Link>
                <Link href="/patch-notes" className="btn secondary">
                  Ver patch notes
                </Link>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="card meta-card">
              <div>
                <span className="card-eyebrow">Status</span>
                <h3 className="card-title">Servidor online</h3>
                <p className="card-sub">Atualizado há 12 minutos</p>
              </div>
              <div className="service-icon plane">
                <Megaphone />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-kicker">Comunicados</span>
              <h2>Últimas notícias do servidor</h2>
              <p className="muted">
                Atualizações priorizadas pela equipe para manter todos informados.
              </p>
            </div>
            <Link href="/blog" className="btn secondary">
              Ler o blog
            </Link>
          </div>

          <div className="category-compact-grid">
            {newsItems.length ? (
              newsItems.map((news) => (
                <article key={news.id} className="card category-compact-card">
                  <div className={`category-visual ${news.cover ?? ""}`}>
                    <span>{news.tag || news.cover_label || "NEWS"}</span>
                  </div>
                  <div className="category-compact-content">
                    <span className="card-eyebrow">
                      {formatShortDate(news.published_at) || "Sem data"}
                    </span>
                    <h3>{news.title}</h3>
                    <p>{news.summary ?? "Atualização publicada pela equipe Maven."}</p>
                    <div className="category-action">
                      <Link href="/forum" className="btn ghost btn-sm">
                        Comentar no fórum
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="card">
                <h3>Sem notícias</h3>
                <p className="muted">Nenhum comunicado publicado ainda.</p>
              </div>
            )}
          </div>

          <div className="cta-strip">
            <div>
              <strong>Quer ser avisado em primeira mão?</strong>
              <p className="muted">Entre no Discord e habilite as notificações.</p>
            </div>
            <a href="https://discord.gg/mvn" className="btn secondary btn-sm" target="_blank" rel="noreferrer">
              Entrar no Discord
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
