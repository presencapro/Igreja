export default function Destaques({ siteData, phoneLinks }) {
  return (
    <section id="destaques" className="card full reveal">
      <h2>Clero e Comunidades</h2>
      <div className="highlights">
        <article>
          <h3>Clero</h3>
          <p>
            {(siteData.clergy || []).map((member, index) => (
              <span key={member}>
                {member}
                {index < siteData.clergy.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
          <a href={siteData.links.diocesePage} target="_blank" rel="noreferrer">
            Equipe pastoral
          </a>
        </article>
        <article>
          <h3>Secretaria</h3>
          <p>Responsável: {siteData.secretary || "Secretaria paroquial"}</p>
          <a href={phoneLinks.phoneHref}>Atendimento paroquial</a>
        </article>
        <article>
          <h3>Comunidades</h3>
          <p>{siteData.communitiesShort}</p>
          <a href={siteData.links.diocesePage} target="_blank" rel="noreferrer">
            Ver lista completa
          </a>
        </article>
      </div>
    </section>
  );
}
