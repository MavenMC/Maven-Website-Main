import Link from "next/link";
import { Home, Gamepad2, ShoppingCart } from "lucide-react";
import ContaConectada from "@/components/ContaConectada";

export default function Header() {
  return (
    <header className="w-full bg-[#16090B]/90 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
        {/* ESQUERDA */}
        <nav className="flex items-center gap-8 text-base font-semibold">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-red-500 transition">
            <Home size={20} />
            Início
          </Link>

          <Link href="/validar" className="flex items-center gap-2 text-white/80 hover:text-white transition">
            <Gamepad2 size={20} />
            Jogar
          </Link>
        </nav>

        {/* ESPAÇADOR */}
        <div className="flex-1" />

        {/* DIREITA */}
        <div className="flex items-center gap-6">
          <Link
            href="https://loja.mavenmc.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex items-center gap-2
              bg-red-600 hover:bg-red-700
              transition
              px-6 py-2.5
              rounded-full
              text-white
              text-base
              font-bold
              shadow-md
            "
          >
            <ShoppingCart size={20} />
            Loja
          </Link>

          <ContaConectada />
        </div>
      </div>
    </header>
  );
}
