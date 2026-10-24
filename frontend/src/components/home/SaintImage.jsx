// src/components/home/SaintImage.jsx
// Componente responsável por exibir a imagem do Santo com controle de
// carregamento e erro. Nunca exibe "broken image": em caso de falha na
// URL remota, troca automaticamente pela imagem padrão /images/santo-default.jpg.
import { useState, useEffect } from "react";
import { DEFAULT_SANTO_IMAGE } from "../../api/santoService";
import { isValidImageUrl } from "../../utils/imageValidation";
import "./SaintImage.css";

export default function SaintImage({ src, alt = "Santo do Dia", className = "" }) {
  // Fonte segura: se vier undefined/null/inválida, já nasce com a imagem padrão
  const [currentSrc, setCurrentSrc] = useState(() =>
    isValidImageUrl(src) ? src : DEFAULT_SANTO_IMAGE
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCurrentSrc(isValidImageUrl(src) ? src : DEFAULT_SANTO_IMAGE);
    setLoaded(false);
  }, [src]);

  // Se a imagem remota falhar, uma única vez, troca pela imagem padrão
  const handleError = () => {
    if (currentSrc !== DEFAULT_SANTO_IMAGE) {
      setCurrentSrc(DEFAULT_SANTO_IMAGE);
    }
    setLoaded(true); // interrompe o skeleton para não tremer em cima do fallback
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={handleError}
      className={`${className} saint-image ${loaded ? "saint-image-loaded" : "saint-image-loading"}`}
    />
  );
}
