export default function Secretaria({ siteData, phoneLinks }) {
  return (
    <section id="secretaria" className="card reveal">
      <h2>Horários da Secretaria</h2>
      <p>{siteData.officeHours}</p>
      <p>
        Contato: {siteData.phone}
        <br />
        Email: {siteData.email}
        <br />
        Endereço: {siteData.address}
        <br />
        CEP: {siteData.zipCode}
      </p>
      <a className="btn-secondary" href={phoneLinks.phoneHref}>
        Falar com a Secretaria
      </a>
    </section>
  );
}
