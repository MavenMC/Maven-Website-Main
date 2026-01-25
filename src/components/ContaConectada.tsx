"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Conta = {
  nick: string;
  plataforma: "java" | "bedrock";
};

export default function ContaConectada() {
  const [conta, setConta] = useState<Conta | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("maven_account");
    if (data) {
      setConta(JSON.parse(data));
    }
  }, []);

  // não conectado
  if (!conta) {
    return (
      <Link
        href="/validar"
        className="text-sm font-semibold text-white/80 hover:text-white transition"
      >
        Conectar
      </Link>
    );
  }

  // conectado
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-green-400">●</span>

      <span className="text-white font-semibold">
        {conta.nick}
      </span>

      <span className="text-xs text-gray-400">
        ({conta.plataforma.toUpperCase()})
      </span>
    </div>
  );
}
