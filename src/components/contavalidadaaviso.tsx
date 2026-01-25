"use client";

import { useEffect, useState } from "react";

type Conta = {
  nick: string;
  plataforma: "java" | "bedrock";
};

export default function ContaValidadaAviso() {
  const [conta, setConta] = useState<Conta | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("maven_account");
    if (data) setConta(JSON.parse(data));
  }, []);

  if (!conta) return null;

  return (
    <div className="bg-green-500/10 border border-green-500/30 text-green-300 rounded-xl p-4 text-sm sm:text-base">
      ✅ Conta <strong>{conta.nick}</strong> validada com sucesso (
      {conta.plataforma.toUpperCase()})
    </div>
  );
}
