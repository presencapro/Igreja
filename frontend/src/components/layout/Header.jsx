import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";

export default function Header({ siteData, theme, setTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header className={styles.topbar}>
        <div className={`container ${styles.topbarContent}`}>
          
          <nav className={`${styles.navHalf} ${styles.navLeft} ${menuOpen ? styles.isOpen : ""}`}>
            <Link to="/celebracoes" onClick={closeMenu}>Celebrações</Link>
            <Link to="/secretaria" onClick={closeMenu}>Secretaria</Link>
            <Link to="/pastorais" onClick={closeMenu}>Pastorais e Movimentos</Link>

            {/* Nav do mobile extra - No desktop esse menuSome */}
            <div className={styles.mobileExtraLinks}>
              <Link to="/mapa" onClick={closeMenu}>Mapa</Link>
              <Link to="/instagram" onClick={closeMenu}>Instagram</Link>
              <Link to="/pastorais" onClick={closeMenu}>Pastorais e Movimentos</Link>
              <Link to="/pastorais/acesso" onClick={closeMenu}>Acesso da Pastoral</Link>
              <Link to="/acesso-secretaria" className={styles.navAdmin} onClick={closeMenu}>Admin</Link>
            </div>
          </nav>

          <div className={styles.brandCenter}>
            <Link to="/" className={styles.brandLink}>
              <img
                className={styles.brandLogo}
                src="/logo-paroquia.svg"
                alt="Logo da Paróquia"
              />
            </Link>
          </div>

          <nav className={`${styles.navHalf} ${styles.navRight}`}>
            <Link to="/mapa">Mapa</Link>
            <Link to="/instagram">Instagram</Link>
            <Link to="/acesso-secretaria" className={styles.navAdmin}>Admin</Link>
          </nav>

          <div className={styles.mobileActions}>
            <button
              type="button"
              className={styles.themeToggle}
              onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            <button
              type="button"
              className={`${styles.navToggle} ${menuOpen ? styles.isOpen : ""}`}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span className={styles.navToggleBar} />
              <span className={styles.navToggleBar} />
              <span className={styles.navToggleBar} />
            </button>
          </div>
        </div>
      </header>
      {menuOpen && <button className={styles.navBackdrop} onClick={closeMenu} />}
    </>
  );
}