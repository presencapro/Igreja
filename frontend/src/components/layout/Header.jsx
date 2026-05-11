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
            <a href="/#celebracoes" onClick={closeMenu}>Celebrações</a>
            <a href="/#secretaria" onClick={closeMenu}>Secretaria</a>
            <a href="/#avisos" onClick={closeMenu}>Avisos</a>
            
            {/* Nav do mobile extra - No desktop esse menuSome */}
            <div className={styles.mobileExtraLinks}>
              <a href="/#mapa" onClick={closeMenu}>Mapa</a>
              <a href="/#instagram" onClick={closeMenu}>Instagram</a>
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
            <a href="/#mapa">Mapa</a>
            <a href="/#instagram">Instagram</a>
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