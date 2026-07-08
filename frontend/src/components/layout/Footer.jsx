import { Link } from "react-router-dom";

export default function Footer({ siteData }) {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h3>{siteData.name}</h3>
          <p>{siteData.address}</p>
          <p>{siteData.phone}</p>
        </div>
        <div>
          <h3>Links Rápidos</h3>
          <p>
            <Link to="/celebracoes">Celebrações</Link>
          </p>

          <p>
            <Link to="/acesso-secretaria">Administrador</Link>
          </p>
        </div>
        <div>
          <h3>Redes Sociais</h3>
          <p>
            <a href={siteData.links.instagramProfile} target="_blank" rel="noreferrer">
              Instagram
            </a>
          </p>
          <p>
            <a href={siteData.links.diocesePage} target="_blank" rel="noreferrer">
              Página na Diocese
            </a>
          </p>
        </div>
      </div>
      <p className="footer-copy">© 2026 {siteData.name}</p>
    </footer>
  );
}
