function getInstagramHandle(url) {
  if (!url) return "@paroquia";

  try {
    const parsed = new URL(url);
    const username = parsed.pathname.split("/").filter(Boolean)[0];
    return username ? `@${username}` : "@paroquia";
  } catch {
    return "@paroquia";
  }
}

function getInstagramReelUrl(url) {
  return url || "https://www.instagram.com/reel/DaAkIeRBR7g/";
}

export default function Instagram({ siteData }) {
  const instagramHandle = getInstagramHandle(siteData.links.instagramProfile);
  const instagramReelUrl = getInstagramReelUrl(siteData.links.instagramPost);

  return (
    <section id="instagram" className="card full instagram-card reveal">
      <h2>Destaque do Instagram</h2>
      <p>
        Acompanhe publicações, avisos e conteúdos da comunidade no perfil
        oficial.
      </p>
      <section className="destaque-instagram">
        <div className="insta-post-card">
          <div className="insta-post-header">
            <div className="insta-post-profile">
              <div className="insta-post-meta">
                <strong>{siteData.name}</strong>
                <span>{instagramHandle}</span>
              </div>
            </div>
            <a
              className="insta-post-tag"
              href={instagramReelUrl}
              target="_blank"
              rel="noreferrer"
            >
              Reel
            </a>
          </div>
          <div className="insta-embed-wrap">
            <video
              className="insta-embed-frame"
              src="/instagram-reel.mp4"
              controls
              playsInline
              preload="metadata"
            >
              Seu navegador não suporta a reproducao deste video.
            </video>
          </div>
          <div className="insta-post-footer">
            <p className="insta-post-caption">
              Video em destaque da comunidade paroquial.
            </p>
          </div>
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
