import { useState, useEffect } from "react";

export default function FloatingButtons({ phoneLinks, whatsappMessage }) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 380);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <a
        className="whatsapp-float"
        href={`${phoneLinks.whatsapp}?text=${whatsappMessage}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar no WhatsApp"
      >
        WhatsApp
      </a>

      <button
        type="button"
        className={`back-to-top ${showBackToTop ? "is-visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Voltar ao topo"
      >
        ↑
      </button>
    </>
  );
}
