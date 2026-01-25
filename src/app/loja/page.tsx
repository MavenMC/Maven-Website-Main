"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import store from "@/data/store.json";
import VipComparisonTable from "@/components/VipComparisonTable";
import BackgroundHeader from "@/components/backgroundheader";

type Conta = {
  nick: string;
  plataforma: "java" | "bedrock";
};

const cores = {
  lendario: {
    border: "border-green-500/40",
    glow: "shadow-[0_0_30px_rgba(34,197,94,0.35)]",
  },
  supremo: {
    border: "border-yellow-500/40",
    glow: "shadow-[0_0_30px_rgba(234,179,8,0.35)]",
  },
  imperador: {
    border: "border-blue-500/40",
    glow: "shadow-[0_0_30px_rgba(59,130,246,0.35)]",
  },
  monarca: {
    border: "border-purple-500/40",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.35)]",
  },
};

export default function LojaPage() {
  const [conta, setConta] = useState<Conta | null>(null);
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem("maven_account");
    if (data) setConta(JSON.parse(data));
  }, []);

  function handleComprar(vipId: string) {
    if (!conta) {
      router.push("/validar");
      return;
    }

    const vip = store.vips.find((v) => v.id === vipId);
    if (!vip) return;

    const item = {
      id: vip.id,
      nome: `VIP ${vip.nome}`,
      preco: vip.preco.valor,
      quantidade: 1,
    };

    localStorage.setItem("maven_cart", JSON.stringify([item]));
    router.push("/carrinho");
  }

  return (
    <div className="space-y-12">
      <BackgroundHeader />

      {/* AVISO */}
      {!conta && (
        <div className="bg-[#1a0f14] border border-red-500/30 rounded-xl p-4 text-sm sm:text-base text-red-300">
          ⚠️ Para comprar um VIP, é necessário validar sua conta.
        </div>
      )}



{/* TÍTULO */}
<div className="pt-6 text-center space-y-2 ">
  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide">
    <span className="text-white-500 ">VIPS</span>
  </h1>

  <p className="text-gray-400 text-sm sm:text-base">
    Confira os nossos VIPs
  </p>
</div>

{/* BENEFÍCIOS + COMPRA */}
<div className="pt-6">
  <VipComparisonTable onComprar={handleComprar} />
</div>

    </div>
  );
}
