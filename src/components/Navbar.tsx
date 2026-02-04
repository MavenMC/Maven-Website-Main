"use client";

import Link from "next/link";
import { useState } from "react";
import ContaConectada from "@/components/ContaConectada";

const navLinks = [
  { label: "Início", href: "/" },
  { 
    label: "Notícias", 
    dropdown: [
      { label: "Patch Notes", href: "/patch-notes" },
      { label: "Blog", href: "/blog" },
    ]
  },
  { label: "Equipe", href: "/equipe" },
  { label: "Changelog", href: "/changelog" },
  { label: "Fórum", href: "/forum" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="nav">
      <div className="container nav-inner">
        <div className="logo-glow" aria-hidden="true" />

        <Link href="/" className="logo" onClick={closeMobile}>
          <img src="/logos/slogan.png" alt="Maven Network" className="logo-mark" />
          <img
            src="/logos/favicon-rounded.png"
            alt=""
            className="logo-mark-small"
            aria-hidden="true"
          />
        </Link>

        <nav className="nav-links" aria-label="Seções do site">
          {navLinks.map((link) => (
            link.dropdown ? (
              <div key={link.label} className="nav-dropdown">
                <button type="button" className="nav-dropdown-trigger">
                  {link.label}
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="nav-dropdown-menu">
                  {link.dropdown.map((item) => (
                    <Link key={item.href} href={item.href}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            )
          ))}
        </nav>

        <div className="nav-actions">
          <ContaConectada />
        </div>

        <button type="button" className="menu-btn" onClick={() => setMobileOpen(true)}>
          Menu
        </button>
      </div>

      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`} onClick={closeMobile}>
        <div className="mobile-menu-panel" onClick={(event) => event.stopPropagation()}>
          <div className="mobile-menu-header">
            <span className="logo-text-admin">Menu</span>
            <button type="button" className="mobile-menu-close" onClick={closeMobile}>
              Fechar
            </button>
          </div>

          <div className="mobile-menu-links">
            {navLinks.map((link) => (
              link.dropdown ? (
                <div key={link.label} className="mobile-menu-section">
                  <span className="mobile-menu-label">{link.label}</span>
                  {link.dropdown.map((item) => (
                    <Link key={item.href} href={item.href} onClick={closeMobile} className="mobile-menu-sublink">
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link key={link.href} href={link.href} onClick={closeMobile}>
                  {link.label}
                </Link>
              )
            ))}
            <Link href="/validar" onClick={closeMobile}>
              Jogar
            </Link>
            <a
              href="https://loja.mavenmc.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobile}
            >
              Loja
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
