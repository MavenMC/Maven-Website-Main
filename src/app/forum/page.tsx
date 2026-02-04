import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { getForumCategories } from "@/lib/site-data";
import { resolveIcon } from "@/lib/icon-map";

const faqItems = [
  {
    question: "Como reporto um bug?",
    answer: "Abra um tópico em Suporte com print ou vídeo e sua versão do jogo.",
  },
  {
    question: "Posso divulgar meu clã?",
    answer: "Sim, use a categoria Clãs e alianças seguindo as regras fixadas.",
  },
  {
    question: "Quando os mods respondem?",
    answer: "Em geral dentro de 24h. Em eventos, respondemos ainda mais rápido.",
  },
];

export default async function ForumPage() {
  const forumCategories = await getForumCategories();

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-kicker">Fórum</span>
              <h2>Conecte-se com a comunidade</h2>
              <p className="muted">
                Sugestões, suporte e networking entre jogadores em um só lugar.
              </p>
            </div>
            <a href="https://discord.gg/mvn" className="btn secondary" target="_blank" rel="noreferrer">
              Entrar no Discord
            </a>
          </div>

          <div className="service-grid">
            {forumCategories.length ? (
              forumCategories.map((category) => {
                const Icon = resolveIcon(category.icon, MessageSquare);
                return (
                  <article key={category.id} className="card service-card">
                    <div className={`service-icon ${category.variant || ""}`}>
                      <Icon />
                    </div>
                    <h3>{category.title}</h3>
                    <p>{category.description ?? "Acompanhe as discussões do servidor."}</p>
                    <Link href="/noticias" className="btn ghost btn-sm">
                      Ver tópicos
                    </Link>
                  </article>
                );
              })
            ) : (
              <div className="card">
                <h3>Sem categorias</h3>
                <p className="muted">Nenhuma categoria publicada ainda.</p>
              </div>
            )}
          </div>

          <div className="section-header">
            <div>
              <span className="section-kicker">FAQ</span>
              <h2>Dúvidas rápidas</h2>
            </div>
          </div>

          <div className="faq-accordion">
            {faqItems.map((item) => (
              <details key={item.question} className="card faq-item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>

          <div className="cta-strip">
            <div>
              <strong>Quer abrir um tópico?</strong>
              <p className="muted">Use o fórum para reportar bugs e trocar ideias.</p>
            </div>
            <a href="https://discord.gg/mvn" className="btn primary btn-sm" target="_blank" rel="noreferrer">
              Acessar fórum
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
