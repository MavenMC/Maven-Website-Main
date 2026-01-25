import Hero from "@/components/Hero";
import HomeContent from "@/components/HomeContent";
import ContaValidadaAviso from "@/components/contavalidadaaviso";

export default function Home() {
  return (
    <>
      <main className="space-y-12">
        <Hero />
        <ContaValidadaAviso />
        <HomeContent />
      </main>
    </>
  );
}
