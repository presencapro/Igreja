import { useState } from "react";
import styles from "./EmbirucuBanner.module.css";

const scheduleData = [
  {
    dayLabel: "11/09 — Sexta-Feira",
    dateNum: "11",
    weekDay: "Sexta",
    events: [
      { time: "18h30", title: "Terço Mariano" },
      { time: "19h30", title: "Santa Missa" },
    ],
  },
  {
    dayLabel: "12/09 — Sábado",
    dateNum: "12",
    weekDay: "Sábado",
    events: [
      { time: "18h30", title: "Terço Mariano" },
      { time: "19h30", title: "Santa Missa" },
      { time: "Após a Missa", title: "Levantamento da bandeira" },
      { time: "Show", isMusic: true, title: "Música ao vivo com Zezé e Tiozinho" },
    ],
    barraquinha: "🍢 Funcionamento de barraquinha com deliciosos pastéis, caldo, canjica, churrasco, tropeiro e refrigerante.",
  },
  {
    dayLabel: "13/09 — Domingo",
    dateNum: "13",
    weekDay: "Domingo",
    events: [
      { time: "06h00", title: "Alvorada festiva" },
      { time: "11h00", title: "Santa Missa" },
      { time: "Em seguida", title: "Procissão" },
      { time: "Logo após", title: "Almoço na barraquinha" },
      { time: "Show", isMusic: true, title: "Música ao vivo com Ricardo Araújo e Heleno" },
      { time: "13h30", title: "Cumprimento de promessas" },
    ],
    barraquinha: "🍢 Funcionamento de barraquinha com deliciosos pastéis, caldo, canjica, churrasco, tropeiro e refrigerante.",
  },
];

export default function EmbirucuBanner() {
  const [showSchedule, setShowSchedule] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className={styles.bannerContainer}>
      <div className={styles.contentWrapper}>
        
        {/* Badge */}
        <div className={styles.badge}>
          ⛪ FESTA DA COMUNIDADE
        </div>

        {/* Header Titles matching flyer */}
        <div className={styles.headerGroup}>
          <div className={styles.communityTag}>
            Comunidade Embiruçu | Paróquia N. Sra do Carmo
          </div>
          <h2 className={styles.mainTitle}>
            Festa do Senhor Bom Jesus, Nossa Senhora do Rosário e São Sebastião
          </h2>
          <p className={styles.motto}>
            "Eis que estou à porta e bato" (Ap 3,20)
          </p>
        </div>

        {/* Info Grid */}
        <div className={styles.infoGrid}>
          <a
            href="https://maps.app.goo.gl/GcU9QntA9Qtg6A796"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.infoCardLink}
            title="Abrir no Google Maps"
          >
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📍</div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Localização & Data</span>
                <span className={styles.infoValue}>Comunidade Embiruçu ↗</span>
                <span className={styles.infoSub}>11 a 13 de setembro de 2026</span>
              </div>
            </div>
          </a>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>🙌</div>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>Festeiros</span>
              <span className={styles.infoValue}>Neusa e José Calixto</span>
              <span className={styles.infoSub}>Festa em honra e louvor</span>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>🙏</div>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>Apoio Pastoral</span>
              <span className={styles.infoValue}>Pe. Rafael Lucas & Pe. Roberto Vicente</span>
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

            {/* Day Selector Tabs */}
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

            {/* General Barraquinha Note & Warning */}
            <div className={styles.extraCard} style={{ marginTop: "1.25rem" }}>
              🍢 <strong>Funcionamento de barraquinha no sábado e domingo:</strong> serão servidos deliciosos pastéis, caldo, canjica, churrasco, tropeiro e refrigerante.
            </div>

            <div className={styles.warningBox}>
              ⚠️ <strong>Aviso Importante:</strong> É expressamente proibido o comércio de bebidas alcoólicas na barraquinha e local próximo dela sem alvará expedido.
            </div>

            <p className={styles.footerNote}>
              <strong>Festeiros:</strong> Neusa e José Calixto — <strong>Apoio:</strong> Padre Rafael Lucas e Padre Roberto Vicente.
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
