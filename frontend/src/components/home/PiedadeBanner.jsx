import { useState } from "react";
import styles from "./PiedadeBanner.module.css";

const scheduleData = [
  {
    dayLabel: "17/09 — Quarta-Feira",
    dateNum: "17",
    weekDay: "Quarta",
    events: [
      { time: "19h00", title: "Tríduo oracional e Santa Missa" },
    ],
  },
  {
    dayLabel: "18/09 — Quinta-Feira",
    dateNum: "18",
    weekDay: "Quinta",
    events: [
      { time: "19h00", title: "Tríduo oracional e Santa Missa" },
    ],
  },
  {
    dayLabel: "19/09 — Sexta-Feira",
    dateNum: "19",
    weekDay: "Sexta",
    events: [
      { time: "19h00", title: "Tríduo oracional e Santa Missa" },
    ],
  },
  {
    dayLabel: "20/09 — Sábado",
    dateNum: "20",
    weekDay: "Sábado",
    events: [
      { time: "11h00", title: "Santa Missa seguida de procissão" },
      { time: "Após a Missa", title: "Delicioso almoço (adquira a sua adesão)" },
      { time: "Show", isMusic: true, title: "Atrações musicais ao longo do dia" },
    ],
    barraquinha: "🍢 Movimentos de barraquinhas e atrações musicais todos os dias.",
  },
];

export default function PiedadeBanner() {
  const [showSchedule, setShowSchedule] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className={styles.bannerContainer}>
      <div className={styles.contentWrapper}>

        {/* Badge */}
        <div className={styles.badge}>
          ⛪ FESTA DA COMUNIDADE
        </div>

        {/* Header */}
        <div className={styles.headerGroup}>
          <div className={styles.communityTag}>
            Comunidade N. Sra da Piedade | Paróquia N. Sra do Carmo
          </div>
          <h2 className={styles.mainTitle}>
            Tríduo e Festa em Honra a<br />
            <em>Nossa Senhora da Piedade</em>
          </h2>
          <p className={styles.motto}>
            "Roga pelos filhos teus!"
          </p>
        </div>

        {/* Info Grid */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>📅</div>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>Período</span>
              <span className={styles.infoValue}>17 a 20 de Setembro</span>
              <span className={styles.infoSub}>Tríduo: dias 17, 18 e 19 às 19h</span>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>🙌</div>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>Festeiros</span>
              <span className={styles.infoValue}>Sr. Egídio e família</span>
              <span className={styles.infoSub}>Festa em honra e louvor</span>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>🙏</div>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>Apoio Pastoral</span>
              <span className={styles.infoValue}>Pe. Rafael Lucas &amp; Pe. Roberto Vicente</span>
              <span className={styles.infoSub}>Paróquia N. Sra do Carmo</span>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          className={styles.toggleBtn}
          onClick={() => setShowSchedule(!showSchedule)}
        >
          {showSchedule ? "▲ Ocultar programação" : "▼ Ver programação completa"}
        </button>

        {/* Full Schedule Section */}
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
                  <span className={styles.tabDate}>{item.dateNum} SET</span>
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
                    {evt.isMusic ? (
                      <span className={styles.musicBadge}>🎵 SHOW</span>
                    ) : (
                      <span className={styles.eventTimeBadge}>{evt.time}</span>
                    )}
                    <span className={styles.eventDetailText}>{evt.title}</span>
                  </div>
                ))}
              </div>

              {scheduleData[activeTab].barraquinha && (
                <div className={styles.extraCard}>
                  {scheduleData[activeTab].barraquinha}
                </div>
              )}
            </div>

            <div className={styles.warningBox}>
              🍽️ <strong>Dia 20 — Almoço especial:</strong> Adquira a sua adesão antecipadamente para participar do almoço após a procissão.
            </div>

            <p className={styles.footerNote}>
              <strong>Festeiros:</strong> Sr. Egídio e família —{" "}
              <strong>Apoio:</strong> Padre Rafael Lucas e Padre Roberto Vicente.
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
