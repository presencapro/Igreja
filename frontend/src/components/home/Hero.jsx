import Instagram from "./Instagram";

export default function Hero({ siteData }) {
  return (
    <section
      className="hero"
      style={{ backgroundImage: `url('/igreja-bg.jpg')` }}
    >
      <div className="overlay"></div>
      <div className="container hero-grid">
        <div className="hero-left">
          <div className="hero-title-group">
            <h1>Paróquia Nossa Senhora do Carmo - Paraopeba</h1>
            <p>
              Informações da paróquia, secretaria, clero e comunidades da Diocese de
              Sete Lagoas.
            </p>
          </div>
        </div>

        <div className="hero-right">
          <Instagram siteData={siteData} />
        </div>
      </div>
    </section>
  );
}

