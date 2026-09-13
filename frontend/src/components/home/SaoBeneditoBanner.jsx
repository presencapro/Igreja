import { useState } from "react";
import styles from "./SaoBeneditoBanner.module.css";

const scheduleData = [
  {
    dayLabel: "30/09 — Quarta-Feira",
    dateNum: "30",
    month: "SET",
    weekDay: "Quarta",
    events: [
      { time: "18h", title: "Oração do tríduo em honra a São Benedito" },
      { time: "18h30", title: "Busca da bandeira de São Benedito" },
      { time: "19h30", title: "Santa Missa de abertura" },
      { time: "Após a Missa", special: true, title: "Solene Hasteamento da Bandeira de São Benedito" },
    ],
  },
  {
    dayLabel: "01/10 — Quinta-Feira",
    dateNum: "01",
    month: "OUT",
    weekDay: "Quinta",
    events: [
      { time: "18h30", title: "Oração do Tríduo em honra a São Benedito" },
      { time: "19h30", title: "Santa Missa" },
    ],
  },
  {
    dayLabel: "02/10 — Sexta-Feira",
    dateNum: "02",
    month: "OUT",
    weekDay: "Sexta",
    events: [
      { time: "18h30", title: "Oração do Tríduo em honra a São Benedito" },
      { time: "19h30", title: "Santa Missa" },
      { time: "Após a cel.", special: true, title: "Tradicional Combucão de São Benedito" },
    ],
  },
  {
    dayLabel: "03/10 — Sábado",
    dateNum: "03",
    month: "OUT",
    weekDay: "Sábado",
    events: [
      { time: "16h00", title: "Desfile de Príncipes e Princesa" },
      { time: "18h00", title: "Santa Missa" },
      { time: "Após a Missa", special: true, title: "Procissão com a imagem de São Benedito" },
    ],
  },
];

export default function SaoBeneditoBanner() {
  const [showSchedule, setShowSchedule] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className={styles.bannerContainer}>
      <div className={styles.contentWrapper}>

        {/* Badge */}
        <div className={styles.badge}>
          ✝️ FESTA DA COMUNIDADE
        </div>

        {/* Header */}
        <div className={styles.headerGroup}>
          <div className={styles.communityTag}>
            Paróquia N. Sra do Carmo
          </div>
          <p className={styles.mainTitle}>Festa de</p>
          <h2 className={styles.mainTitleBig}>São Benedito</h2>
          <div className={styles.dateBadge}>30|09 a 03|10</div>
        </div>

        <hr className={styles.divider} />

        {/* Tema */}
        <div className={styles.themeCard}>
          <span className={styles.themeLabel}>Tema</span>
          <p className={styles.themeText}>
            "São Benedito, testemunho de humildade e caridade: ensina-nos a servir com fé e amar com o coração."
          </p>
        </div>

        {/* Lema */}
        <div className={styles.lemaCard}>
          <span className={styles.lemaLabel}>Lema</span>
          <p className={styles.lemaSubtitle}>91 anos da Guarda de Nossa Senhora do Rosário</p>
          <p className={styles.lemaText}>
            "Há 91 anos, sob o manto de Maria, nossos tambores anunciam uma fé que atravessa gerações."
          </p>
        </div>

        {/* Toggle Button */}
        <button
          className={styles.toggleBtn}
          onClick={() => setShowSchedule(!showSchedule)}
        >
          {showSchedule ? "▲ Ocultar programação" : "▼ Ver programação completa"}
        </button>

        {/* Full Schedule */}
        {showSchedule && (
          <div className={styles.scheduleSection}>
            <h3 className={styles.scheduleTitle}>📅 Programação Oficial da Festa</h3>

            {/* Day Tabs */}
            <div className={styles.daysContainer}>
              {scheduleData.map((item, index) => (
                <button
                  key={index}
                  className={`${styles.dayTab} ${activeTab === index ? styles.activeDayTab : ""}`}
                  onClick={() => setActiveTab(index)}
                >
                  <span className={styles.tabDate}>{item.dateNum} {item.month}</span>
                  <span className={styles.tabWeek}>{item.weekDay}</span>
                </button>
              ))}
            </div>

            {/* Selected Day Events */}
            <div className={styles.dayCard}>
              <div className={styles.dayHeader}>
                📌 {scheduleData[activeTab].dayLabel}
              </div>

              <div className={styles.eventsList}>
                {scheduleData[activeTab].events.map((evt, idx) => (
                  <div key={idx} className={styles.eventRow}>
                    {evt.special ? (
                      <span className={styles.specialBadge}>✨ {evt.time}</span>
                    ) : (
                      <span className={styles.eventTimeBadge}>{evt.time}</span>
                    )}
                    <span className={styles.eventDetailText}>{evt.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Espaço Social */}
            <div className={styles.socialCard}>
              <p className={styles.socialTitle}>⛺ Espaço Social</p>
              <p className={styles.socialText}>
                Todos os dias, após as celebrações, vendas e comidas típicas em nosso espaço social.
              </p>
              <p className={styles.socialFoods}>
                Caldo • Canjica • Pastéis • Arroz Temperado • Feijão Tropeiro
              </p>
            </div>

            <p className={styles.footerNote}>
              Venha celebrar conosco este momento de fé, tradição e confraternização!<br />
              <strong>São Benedito, rogai por nós!</strong>
            </p>
          </div>
        )}

        {/* WhatsApp CTA */}
        <a
          href="https://wa.me/553137141018"
          target="_blank"
          rel="noreferrer"
          className={styles.whatsappCta}
        >
          <span>📱 Mais informações pelo WhatsApp</span>
        </a>

      </div>
    </section>
  );
}
