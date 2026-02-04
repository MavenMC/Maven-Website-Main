import Link from "next/link";

export default function TermosPage() {
  return (
    <div className="page">
      <div className="container" style={{ padding: "4rem 2rem" }}>
        <Link href="/" className="btn secondary" style={{ marginBottom: "2rem", display: "inline-block" }}>
          ← Voltar
        </Link>
        
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Termos de Uso</h1>
        
        <div style={{ maxWidth: "800px", lineHeight: "1.8" }}>
          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o Maven Network, você concorda em cumprir estes termos de uso.
              Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>2. Uso do Serviço</h2>
            <p>
              Você concorda em usar o Maven Network apenas para fins legais e de maneira que não
              infrinja os direitos de terceiros ou restrinja ou iniba o uso e aproveitamento do
              serviço por qualquer outra pessoa.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>3. Conduta do Usuário</h2>
            <p>
              Os usuários devem manter um comportamento respeitoso e civilizado. Não é permitido:
            </p>
            <ul style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
              <li>Assédio, discriminação ou bullying</li>
              <li>Spam ou conteúdo indesejado</li>
              <li>Tentativas de hack ou exploits</li>
              <li>Compartilhamento de informações pessoais de terceiros</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>4. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo presente no Maven Network, incluindo textos, gráficos, logos e
              imagens, é propriedade do Maven Network ou de seus criadores e está protegido por
              leis de direitos autorais.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>5. Modificações</h2>
            <p>
              Reservamos o direito de modificar estes termos a qualquer momento. As alterações
              entrarão em vigor imediatamente após sua publicação no site.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>6. Contato</h2>
            <p>
              Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através
              do Discord ou do formulário de contato no site.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
