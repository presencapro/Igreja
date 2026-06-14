export default function Instagram({ siteData }) {
  return (
    <section id="instagram" className="card full instagram-card reveal">
      <h2>Destaque do Instagram</h2>
      <p>
        Acompanhe publicações, avisos e conteúdos da comunidade no perfil
        oficial.
      </p>
      <section className="destaque-instagram">
        <div className="insta-embed-wrap">
          <iframe
            className="insta-embed-frame"
            src={siteData.links.instagramPost}
            allowTransparency={true}
            allowFullScreen={true}
            frameBorder="0"
            scrolling="no"
            title="Post do Instagram da paróquia"
          ></iframe>
        </div>
      </section>
      <a
        className="btn-secondary"
        href={siteData.links.instagramProfile}
        target="_blank"
        rel="noreferrer"
      >
        Ver perfil oficial no Instagram
      </a>
    </section>
  );
}
