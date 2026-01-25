"use client";

import { DiscordLogoIcon } from "@radix-ui/react-icons";
import { Youtube, Instagram, Twitch } from "lucide-react";
import Link from "next/link";
import { FaTiktok } from "react-icons/fa";
import { useState } from "react";

export default function HomeContent() {
    return (
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ESQUERDA */}
            <div className="lg:col-span-2 bg-[#1a1a1a] rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-bold mb-4">
                    👋 Olá jogadores!
                </h2>

                {/* Nickname */}
                <div>
                    <p className="text-red-400 font-semibold mb-1">
                        Como devo preencher o Nickname?
                    </p>
                    <p>
                        <strong>Jogadores Bedrock:</strong> adicione um asterisco (*) no
                        início do seu nick.
                    </p>
                    <p>
                        <strong>Jogadores Java:</strong> use seu nick normalmente, sem
                        alterações.
                    </p>

                    <p className="mt-2 text-gray-400">
                        <strong>Exemplo:</strong>
                        <br />• Java: <code>seunick</code>
                        <br />• Bedrock: <code>*seunick</code>
                    </p>
                </div>

                {/* Entrega */}
                <div>
                    <p className="text-red-400 font-semibold mb-1">
                        O VIP é entregue de imediato?
                    </p>
                    <p>
                        Após o envio do comprovante de pagamento, nossa equipe (STAFF)
                        realizará a entrega dos benefícios no menor tempo possível.
                    </p>
                </div>

                {/* Pagamento */}
                <div>
                    <p className="text-red-400 font-semibold mb-1">
                        Quais métodos de pagamento a loja aceita?
                    </p>
                    <p>
                        Aceitamos Mercado Pago, Pix, PayPal e Cartão de Crédito.
                    </p>
                </div>

                {/* Reembolso */}
                <div>
                    <p className="text-red-400 font-semibold mb-1">
                        Posso pedir reembolso?
                    </p>
                    <p>
                        Ao realizar uma compra, você está fazendo uma doação para a
                        manutenção do servidor. Por esse motivo, não realizamos reembolsos,
                        independentemente do motivo.
                    </p>
                    <p className="mt-2">
                        Caso algum benefício não funcione corretamente, você poderá
                        solicitar a troca por outro item funcional ou por um benefício
                        superior, caso não haja item equivalente disponível.
                    </p>
                    <p className="mt-2 text-gray-400">
                        Todos os benefícios são itens virtuais e temporários.
                    </p>
                </div>

                {/* Suporte */}
                <div className="pt-4 border-t border-white/10">
                    <p className="text-gray-300">
                        Qualquer dúvida, entre em contato com nosso time abrindo um
                        <span className="text-red-400 font-semibold">
                            {" "}ticket no Discord
                        </span>.
                    </p>
                </div>
            </div>

            {/* DIREITA */}
            <div className="space-y-6">

                {/* IP */}
                <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10 text-center">
                    <h3 className="text-lg font-bold mb-2">Nosso IP</h3>

                    <p className="text-white/70 mb-3">
                        Junte-se a mais de <strong>3.428 jogadores</strong>
                    </p>

                    <CopyIp />
                </div>

                {/* SOCIAL */}
                <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold mb-4 text-center">Social</h3>

                    <div className="flex justify-center gap-4">

                        {/* Discord */}
                        <Link
                            href="https://discord.gg/mvn"
                            target="_blank"
                            className="hover:scale-110 transition"
                        >
                            <DiscordLogoIcon className="w-10 h-10 text-indigo-400 cursor-pointer" />
                        </Link>

                        {/* TikTok */}
                        <Link
                            href="https://www.tiktok.com/@chelseazk_"
                            target="_blank"
                            className="hover:scale-110 transition"
                        >
                            <FaTiktok className="w-9 h-9 text-white cursor-pointer" />
                        </Link>

                        {/* YouTube */}
                        {/*<Link href="https://youtube.com/@maven" target="_blank"><Youtube className="w-10 h-10 text-red-500 cursor-pointer" />
                        </Link>
                        
                        <Link href="https://instagram.com/maven" target="_blank">
                        <Instagram className="w-10 h-10 text-pink-500 cursor-pointer" />
                        </Link>
                        
                        <Link href="https://twitch.tv/maven" target="_blank">
                        <Twitch className="w-10 h-10 text-purple-500 cursor-pointer" />
                        </Link>
                        */}
                    </div>
                </div>

            </div>
        </section>

        
    );

    function CopyIp() {
  const [copiado, setCopiado] = useState(false);
  const ip = "mavenmc.com.br";

  function copiarIp() {
    navigator.clipboard.writeText(ip);
    setCopiado(true);

    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div
      onClick={copiarIp}
      className="
        bg-black/40 rounded-lg py-2 px-4
        font-mono
        cursor-pointer
        transition
        text-white
        hover:text-red-500
        select-none
      "
      title="Clique para copiar"
    >
      {copiado ? "✔ IP copiado!" : ip}
    </div>
  );
}

}
