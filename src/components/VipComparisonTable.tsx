import store from "@/data/store.json";

const BENEFICIOS = [
  { key: "terreno", label: "Terrenos" },
  { key: "home", label: "Homes" },
  { key: "desconto", label: "Desconto" },
  { key: "kit", label: "Kit exclusivo" },
  { key: "guilda", label: "Guilda" },
  { key: "backCooldown", label: "Cooldown do /back" },
  { key: "voar", label: "Voar no lobby" },
  { key: "bau", label: "Baú virtual" },
  { key: "tagExclusiva", label: "Tag exclusiva" },
  { key: "spawners", label: "Spawners" },
  { key: "doubleXP", label: "Double XP" },
  { key: "coinsMensais", label: "Coins mensais" }
];

export default function VipComparisonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-[#0f1623]">
            <th className="p-4 text-left text-gray-400">Benefícios</th>

            {store.vips.map((vip) => (
              <th
                key={vip.id}
                className={`p-4 text-center font-bold ${
                  vip.id === "monarca"
                    ? "bg-[#1a1020] text-pink-400 border-l-2 border-pink-500"
                    : "text-white"
                }`}
              >
                {vip.nome}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {BENEFICIOS.map((beneficio) => (
            <tr
              key={beneficio.key}
              className="border-t border-white/5 hover:bg-white/5"
            >
              <td className="p-4 text-gray-300">
                {beneficio.label}
              </td>

              {store.vips.map((vip) => {
                const valor = vip.beneficios[beneficio.key as keyof typeof vip.beneficios];

                return (
                  <td
                    key={vip.id}
                    className={`p-4 text-center ${
                      vip.id === "monarca"
                        ? "bg-[#1a1020] border-l-2 border-pink-500"
                        : ""
                    }`}
                  >
                    {typeof valor === "boolean" ? (
                      valor ? (
                        <span className="text-green-400 text-lg">✔</span>
                      ) : (
                        <span className="text-gray-600">✖</span>
                      )
                    ) : typeof valor === "number" ? (
                      valor > 0 ? valor : "—"
                    ) : (
                      valor || "—"
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
