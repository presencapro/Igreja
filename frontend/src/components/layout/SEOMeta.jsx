import { Helmet } from "react-helmet-async";

export default function SEOMeta({ siteData }) {
  return (
    <Helmet>
      <title>{siteData.heroTitle}</title>
      <meta name="description" content={siteData.heroText} />
      
      {/* Open Graph Dinâmico para Bots avançados (Google, Twitter) */}
      <meta property="og:title" content={siteData.heroTitle} />
      <meta property="og:description" content={siteData.heroText} />
      <meta property="og:site_name" content={siteData.name} />
      
      {/* Fallback de Imagem Base caso haja uma imagem no State */}
      <meta property="og:image" content="https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80&fm=webp" />
    </Helmet>
  );
}
