"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import BackgroundHeader from "@/components/backgroundheader";

type PlayerInfo = {
  discordId: string;
  discordUsername: string | null;
  minecraftName: string | null;
  accountType: string | null;
  verified: boolean;
  isBedrock: boolean;
};

export default function ValidarPage() {
  const { data: session, status } = useSession();
  const [plataforma, setPlataforma] = useState<"java" | "bedrock" | null>(null);
  const [accountType, setAccountType] = useState<"original" | "pirata">("original");
  const [nick, setNick] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(false);

  useEffect(() => {
    if (!session?.user?.playerId) return;
    setInfoLoading(true);
    fetch("/api/player/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.discordId) {
          setPlayerInfo(data);
        }
      })
      .catch(() => undefined)
      .finally(() => setInfoLoading(false));
  }, [session?.user?.playerId]);

  function selecionarJava() {
    setPlataforma("java");
    if (nick.startsWith("*")) setNick(nick.substring(1));
  }

  function selecionarBedrock() {
    setPlataforma("bedrock");
    if (nick && !nick.startsWith("*")) setNick(`*${nick}`);
  }

  async function handleValidar() {
    setErro("");
    setLoading(true);

    if (!plataforma) {
      setErro("Selecione a plataforma");
      setLoading(false);
      return;
    }

    if (!nick) {
      setErro("Informe o nick");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/player/nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nick,
          platform: plataforma,
          accountType: plataforma === "java" ? accountType : "bedrock",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao validar");
        return;
      }

      setPlayerInfo((prev) => ({
        ...(prev ?? {
          discordId: session?.user?.playerId ?? "",
          discordUsername: session?.user?.name ?? null,
          minecraftName: null,
          accountType: null,
          verified: false,
          isBedrock: false,
        }),
        minecraftName: data.nickname,
        accountType: data.accountType,
        verified: true,
        isBedrock: data.platform === "bedrock",
      }));
    } catch (err) {
      console.error(err);
      setErro("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlink() {
    setErro("");
    setLoading(true);
    try {
      const res = await fetch("/api/player/unlink", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Erro ao desvincular");
        return;
      }
      setPlayerInfo((prev) =>
        prev
          ? {
              ...prev,
              minecraftName: null,
              accountType: null,
              verified: false,
              isBedrock: false,
            }
          : prev,
      );
    } catch (err) {
      console.error(err);
      setErro("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen text-white">
        <BackgroundHeader />
        <main className="flex items-center justify-center px-4 py-16">
          <div className="auth-card">Carregando...</div>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen text-white">
        <BackgroundHeader />
        <main className="flex items-center justify-center px-4 py-16">
          <div className="auth-card">
            <h1>Conecte seu Discord</h1>
            <p className="auth-description">
              Para vincular sua conta Minecraft, primeiro conecte seu Discord.
            </p>
            <button type="button" className="btn primary" onClick={() => signIn("discord")}>
              Entrar com Discord
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (infoLoading) {
    return (
      <div className="min-h-screen text-white">
        <BackgroundHeader />
        <main className="flex items-center justify-center px-4 py-16">
          <div className="auth-card">Buscando informações...</div>
        </main>
      </div>
    );
  }

  if (playerInfo?.minecraftName) {
    return (
      <div className="min-h-screen text-white">
        <BackgroundHeader />

        <div className="flex items-center justify-center px-4 py-10 sm:py-16">
          <div className="bg-[#13080C] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_40px_rgba(0,0,0,0.6)]">
            <h1 className="text-2xl font-bold mb-4">Conta já vinculada</h1>

            <div className="bg-black/30 rounded-xl p-4 mb-6">
              <p className="font-semibold text-lg">{playerInfo.minecraftName}</p>
              <p className="text-sm text-gray-400">
                Plataforma: {playerInfo.isBedrock ? "BEDROCK" : "JAVA"}
              </p>
            </div>

            {erro && <p className="text-sm text-red-400 mb-3">⚠️ {erro}</p>}

            <div className="flex gap-3">
              <button
                onClick={handleUnlink}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 font-bold"
                disabled={loading}
              >
                Desvincular
              </button>
              <button
                onClick={() => setPlayerInfo({ ...playerInfo, minecraftName: null })}
                className="flex-1 py-3 rounded-xl bg-gray-600 hover:bg-gray-700"
                disabled={loading}
              >
                Alterar nick
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <BackgroundHeader />

      <main className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-[#13080C] border border-white/10 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
          <h1 className="text-2xl font-bold text-center">VALIDAR CONEXÃO</h1>

          <p className="text-center text-gray-400 mt-2 mb-6">
            Insira seu nick e selecione a plataforma
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={selecionarJava}
              className={`py-3 rounded-xl font-semibold ${
                plataforma === "java" ? "bg-red-500" : "bg-[#0f1623] hover:bg-[#1f2937]"
              }`}
            >
              🖥️ Java
            </button>

            <button
              onClick={selecionarBedrock}
              className={`py-3 rounded-xl font-semibold ${
                plataforma === "bedrock" ? "bg-red-500" : "bg-[#0f1623] hover:bg-[#1f2937]"
              }`}
            >
              📱 Bedrock
            </button>
          </div>

          {plataforma === "java" && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setAccountType("original")}
                className={`py-2 rounded-xl font-semibold ${
                  accountType === "original"
                    ? "bg-green-600"
                    : "bg-[#0f1623] hover:bg-[#1f2937]"
                }`}
              >
                Original
              </button>
              <button
                onClick={() => setAccountType("pirata")}
                className={`py-2 rounded-xl font-semibold ${
                  accountType === "pirata"
                    ? "bg-yellow-600"
                    : "bg-[#0f1623] hover:bg-[#1f2937]"
                }`}
              >
                Pirata
              </button>
            </div>
          )}

          <input
            value={nick}
            onChange={(e) => {
              let value = e.target.value;
              if (plataforma === "bedrock") {
                value = value.replace(/\*/g, "");
                value = `*${value}`;
              }
              setNick(value);
            }}
            placeholder="Seu nick no jogo"
            className="w-full px-4 py-3 rounded-xl bg-white text-black mb-2"
          />

          {erro && <p className="text-sm text-red-400 mb-2">⚠️ {erro}</p>}

          <button
            onClick={handleValidar}
            disabled={!plataforma || !nick || loading}
            className="w-full mt-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 font-bold disabled:bg-gray-600"
          >
            {loading ? "VALIDANDO..." : "VALIDAR"}
          </button>
        </div>
      </main>
    </div>
  );
}
