export default function Mapa({ siteData }) {
  return (
    <section id="mapa" className="card reveal">
      <h2>Como Chegar</h2>
      <p>{siteData.address}</p>
      <iframe
        className="map-frame"
        title="Mapa da Paróquia Nossa Senhora do Carmo"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={siteData.links.mapEmbed}
      ></iframe>
    </section>
  );
}
