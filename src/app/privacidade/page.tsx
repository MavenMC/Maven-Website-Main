import Link from "next/link";

export default function PrivacidadePage() {
  return (
    <div className="page">
      <div className="container" style={{ padding: "4rem 2rem" }}>
        <Link href="/" className="btn secondary" style={{ marginBottom: "2rem", display: "inline-block" }}>
          ← Voltar
        </Link>
        
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Política de Privacidade</h1>
        
        <div style={{ maxWidth: "800px", lineHeight: "1.8" }}>
          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>1. Informações que Coletamos</h2>
            <p>
              Coletamos informações que você nos fornece diretamente ao usar o Maven Network,
              incluindo:
            </p>
            <ul style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
              <li>Informações da sua conta do Discord (nome de usuário, ID, avatar)</li>
              <li>Nome de usuário do Minecraft para validação de conta</li>
              <li>Dados de uso e interação com o site</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>2. Como Usamos Suas Informações</h2>
            <p>
              Usamos as informações coletadas para:
            </p>
            <ul style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
              <li>Fornecer, manter e melhorar nossos serviços</li>
              <li>Processar validações de conta</li>
              <li>Comunicar-nos com você sobre atualizações e novidades</li>
              <li>Proteger contra atividades fraudulentas ou maliciosas</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>3. Compartilhamento de Informações</h2>
            <p>
              Não vendemos suas informações pessoais. Podemos compartilhar suas informações
              apenas nas seguintes circunstâncias:
            </p>
            <ul style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
              <li>Com seu consentimento explícito</li>
              <li>Para cumprir obrigações legais</li>
              <li>Para proteger os direitos e segurança do Maven Network e seus usuários</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>4. Segurança dos Dados</h2>
            <p>
              Implementamos medidas de segurança apropriadas para proteger suas informações
              pessoais contra acesso não autorizado, alteração, divulgação ou destruição.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>5. Cookies e Tecnologias Similares</h2>
            <p>
              Usamos cookies e tecnologias similares para melhorar sua experiência, manter sua
              sessão ativa e analisar o uso do site.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>6. Seus Direitos</h2>
            <p>
              Você tem o direito de acessar, corrigir ou excluir suas informações pessoais.
              Para exercer esses direitos, entre em contato conosco.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>7. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Notificaremos sobre quaisquer
              alterações significativas publicando a nova política nesta página.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>8. Contato</h2>
            <p>
              Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco
              através do Discord ou do formulário de contato no site.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
