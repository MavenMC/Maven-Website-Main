import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      className="
        w-full h-16 flex items-center justify-between px-8
        bg-gradient-to-r from-[#222525] via-[#14070b] to-[#0b0f16]
        border-b border-red-500/20
      "
    >
      {/* LOGO / HOME */}
      <Link
        href="/"
        className="text-xl font-extrabold text-white tracking-wide hover:text-red-400 transition"
      >
        MAVEN
      </Link>

      {/* LINKS */}
      <div className="flex items-center gap-6 text-sm">
        <Link href="/" className="text-gray-300 hover:text-white">
          Início
        </Link>

        <Link href="/validar" className="text-gray-300 hover:text-white">
          Jogar
        </Link>
      </div>

      {/* AÇÕES */}
      <div className="flex items-center gap-4">
        <Link
          href="/loja"
          className="
            px-4 py-2 rounded-full font-semibold
            bg-red-500 hover:bg-green-600 text-white
            transition
          "
        >
          Loja
        </Link>

        <Link
          href="/carrinho"
          className="text-gray-300 hover:text-white"
        >
          🛒 Carrinho
        </Link>
      </div>
    </nav>
  );
}
