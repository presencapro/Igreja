import { useState } from "react";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";

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
  
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(2336);
  const [bookmarked, setBookmarked] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      setLiked(true);
      setLikesCount(prev => prev + 1);
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

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
              <img
                className="insta-post-avatar"
                src="/logo-paroquia.svg"
                alt="Logo da paróquia"
              />
              <div className="insta-post-meta">
                <strong>{siteData.name || "Paróquia Nossa Senhora do Carmo - Paraopeba"}</strong>
                <span>{instagramHandle}</span>
              </div>
            </div>
            <a
              className="insta-post-header-btn"
              href={siteData.links.instagramProfile}
              target="_blank"
              rel="noreferrer"
            >
              Ver perfil
            </a>
          </div>

          <div 
            className="insta-embed-wrap" 
            onDoubleClick={handleLike} 
            style={{ cursor: "pointer" }}
          >
            <video
              className="insta-embed-frame"
              src="/instagram-reel.mp4"
              controls
              playsInline
              preload="metadata"
            >
              Seu navegador não suporta a reprodução deste vídeo.
            </video>
            <div className="overlay"></div>
          </div>

          <a 
            className="insta-post-more-link"
            href={instagramReelUrl}
            target="_blank"
            rel="noreferrer"
          >
            Ver mais no Instagram
          </a>

          <div className="insta-post-actions">
            <div className="insta-post-actions-left">
              <button 
                className="insta-post-action-btn" 
                onClick={handleLike}
                style={{ color: liked ? "#ff3040" : "inherit" }}
                aria-label="Curtir"
              >
                <Heart size={24} fill={liked ? "#ff3040" : "none"} />
              </button>
              <a 
                className="insta-post-action-btn comment" 
                href={instagramReelUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Comentar"
              >
                <MessageCircle size={24} />
              </a>
              <a 
                className="insta-post-action-btn share" 
                href={instagramReelUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Compartilhar"
              >
                <Send size={24} />
              </a>
            </div>
            <button 
              className="insta-post-action-btn bookmark" 
              onClick={handleBookmark}
              style={{ color: bookmarked ? "#ffb000" : "inherit" }}
              aria-label="Salvar"
            >
              <Bookmark size={24} fill={bookmarked ? "#ffb000" : "none"} />
            </button>
          </div>

          <div className="insta-post-likes">
            {likesCount.toLocaleString("pt-BR")} curtidas
          </div>

          <div className="insta-post-footer">
            <p className="insta-post-caption">
              <strong>{instagramHandle.replace("@", "")}</strong>
              {" "}Vídeo em destaque da comunidade paroquial.
            </p>
          </div>
        </div>
      </section>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <a
          className="btn-secondary"
          href={siteData.links.instagramProfile}
          target="_blank"
          rel="noreferrer"
        >
          Ver perfil oficial no Instagram
        </a>
        <a
          className="btn-primary"
          href="#doacao"
        >
          Doação
        </a>
      </div>
    </section>
  );
}

