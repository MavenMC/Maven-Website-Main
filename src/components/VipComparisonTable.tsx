"use client";

import Image from "next/image";
import { Check, X } from "lucide-react";
import store from "@/data/store.json";

type Props = {
  onComprar: (vipId: string) => void;
};

const beneficios = [
  { label: "Terrenos", lendario: "10", supremo: "15", imperador: "20", monarca: "25" },
  { label: "Homes", lendario: "10", supremo: "15", imperador: "20", monarca: "25" },
  { label: "Desconto", lendario: "10%", supremo: "15%", imperador: "20%", monarca: "25%" },
  { label: "Kit exclusivo", lendario: "LENDÁRIO", supremo: "IMPERADOR", imperador: "SUPREMO", monarca: "SUPREMO" },
  { label: "Guilda", lendario: true, supremo: true, imperador: true, monarca: true },
  { label: "Cooldown do /back", lendario: "30 min", supremo: "15 min", imperador: "10 min", monarca: "sem cooldown" },
  { label: "Voar no lobby", lendario: true, supremo: true, imperador: true, monarca: true },
  { label: "Baú virtual", lendario: true, supremo: true, imperador: true, monarca: true },
  { label: "Tag exclusiva", lendario: true, supremo: true, imperador: true, monarca: true },
  { label: "Spawners", lendario: false, supremo: false, imperador: true, monarca: true },
  { label: "Double XP", lendario: false, supremo: false, imperador: false, monarca: true },
  { label: "Coins mensais", lendario: "—", supremo: "—", imperador: "—", monarca: "500" },
];

function renderValue(value: string | boolean) {
  if (value === true) return <Check className="text-green-400 mx-auto" />;
  if (value === false) return <X className="text-red-500 mx-auto" />;
  return <span>{value}</span>;
}

export default function VipComparisonTable({ onComprar }: Props) {
  const getVip = (id: string) => store.vips.find((v) => v.id === id)!;

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0f0f0f]">
      <table className="w-full text-sm">

        {/* HEADER */}
        <thead>
          <tr className="bg-gradient-to-r from-black to-[#111]">
            <th className="p-4 text-left text-gray-400">BENEFÍCIOS</th>

            {["lendario", "supremo", "imperador", "monarca"].map((vip) => (
              <th
                key={vip}
                className={`p-4 text-center ${
                  vip === "monarca"
                    ? "bg-purple-500/10 border-l border-purple-500/40"
                    : ""
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <Image
                    src={`/icons/vips/${vip}.png`}
                    alt={vip}
                    width={28}
                    height={28}
                  />
                  <span className="text-xs font-bold uppercase">
                    {vip}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {beneficios.map((b, i) => (
            <tr key={i} className="border-t border-white/5">
              <td className="p-4 text-gray-300">{b.label}</td>
              <td className="p-4 text-center">{renderValue(b.lendario)}</td>
              <td className="p-4 text-center">{renderValue(b.supremo)}</td>
              <td className="p-4 text-center">{renderValue(b.imperador)}</td>
              <td className="p-4 text-center bg-purple-500/5 border-l border-purple-500/40">
                {renderValue(b.monarca)}
              </td>
            </tr>
          ))}

          {/* PREÇO + BOTÃO */}
          <tr className="border-t border-white/10 bg-black/40">
            <td className="p-4 font-bold text-gray-400">
              Comprar VIP
            </td>

            {["lendario", "supremo", "imperador", "monarca"].map((id) => {
              const vip = getVip(id);

              return (
                <td
                  key={id}
                  className={`p-4 text-center ${
                    id === "monarca"
                      ? "bg-purple-500/10 border-l border-purple-500/40"
                      : ""
                  }`}
                >
                  <p className="text-lg font-extrabold mb-3">
                    R$ {vip.preco.valor.toFixed(2)}
                    {vip.preco.tipo === "mensal" && "/mês"}
                  </p>

                  <button
                    onClick={() => onComprar(id)}
                    className={`
                      w-full py-2 rounded-xl font-bold transition
                      ${
                        id === "lendario"
                          ? "bg-green-500 hover:bg-green-600"
                          : id === "supremo"
                          ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                          : id === "imperador"
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "bg-purple-500 hover:bg-purple-600"
                      }
                    `}
                  >
                    COMPRAR
                  </button>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
