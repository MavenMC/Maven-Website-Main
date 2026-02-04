import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { getSocialLinks } from "@/lib/site-data";
import { resolveIcon } from "@/lib/icon-map";

export default async function Footer() {
  const socialLinks = await getSocialLinks();
  const footerSocials = socialLinks.slice(0, 3);

  return (
    <footer className="footer">
      <div className="container footer-shell">
        <div className="footer-bg" aria-hidden="true" />
        
        <div className="footer-top">
          <div className="footer-brand">
            <img src="/logos/Mavenlogo4.png" alt="MavenMC" className="logo-footer" />
          </div>
          
          <div className="footer-grid">
            <div>
              <h4>Servidor</h4>
              <Link className="footer-link" href="/noticias">
                Notícias
              </Link>
              <Link className="footer-link" href="/changelog">
                Changelog
              </Link>
              <Link className="footer-link" href="/patch-notes">
                Patch Notes
              </Link>
            </div>
            <div>
              <h4>Comunidade</h4>
              <Link className="footer-link" href="/forum">
                Fórum
              </Link>
              <Link className="footer-link" href="/blog">
                Blog
              </Link>
              <Link className="footer-link" href="/validar">
                Jogar
              </Link>
            </div>
            <div>
              <h4>Suporte</h4>
              <a className="footer-link" href="https://discord.gg/mvn" target="_blank" rel="noreferrer">
                Discord
              </a>
              <Link className="footer-link" href="/equipe">
                Equipe
              </Link>
              <a className="footer-link" href="https://loja.mavenmc.com.br/" target="_blank" rel="noreferrer">
                Loja
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-inner">
            <span>© {new Date().getFullYear()} MavenMC. Todos os direitos reservados.</span>
            <div className="footer-links">
              <Link href="/termos">Termos de Uso</Link>
              <span>•</span>
              <Link href="/privacidade">Privacidade</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
