import Image from "next/image";

export default function PromoBanner() {
  return (
    <div
      className="
        relative overflow-hidden rounded-xl
        bg-gradient-to-r from-red-700 via-red-600 to-red-700
        p-8 mt-8
        shadow-[0_0_50px_rgba(225,29,72,0.5)]
      "
    >
      <div className="relative z-10 text-center">
        <h2 className="text-4xl font-extrabold text-white">
          ESPECIAL ANO NOVO
        </h2>

        <p className="text-xl text-white/90 mt-2">
          Promoção de até
        </p>

        <p className="text-6xl font-extrabold text-white drop-shadow-lg">
          25% OFF
        </p>

        <p className="text-red-200 mt-2 font-semibold">
          Validade: 21/01/2026
        </p>
      </div>

      {/* glow */}
      <div className="absolute inset-0 bg-red-500/20 blur-3xl" />
    </div>
  );
}
