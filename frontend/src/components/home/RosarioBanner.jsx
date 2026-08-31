import { useState } from "react";
import styles from "./RosarioBanner.module.css";
import { parishData } from "../../data";

export default function RosarioBanner({ siteData }) {
  const [showSchedule, setShowSchedule] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const info = siteData?.rosarioFestivalInfo || parishData.rosarioFestivalInfo;
  const schedule = siteData?.rosarioFestivalSchedule || parishData.rosarioFestivalSchedule || [];

  // If no festival info is available, do not render the banner
  if (!info) {
    return null;
  }

  return (
    <section className={styles.bannerContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.badge}>🌹 EVENTO ESPECIAL</div>
        <div className={styles.headerTitle}>
          <h2 className={styles.mainHeading}>{info.title}</h2>
          <p className={styles.subHeading}>{info.subtitle}</p>
        </div>
        <div className={styles.rolesGrid}>
          <div className={styles.roleCard}>
            <span className={styles.roleLabel}>Festeiros</span>
            <div className={styles.roleName}>{info.festeiros}</div>
          </div>
          <div className={styles.roleCard}>
            <span className={styles.roleLabel}>Imperadores</span>
            <div className={styles.roleName}>{info.imperadores}</div>
          </div>
          <div className={styles.roleCard}>
            <span className={styles.roleLabel}>Padres</span>
            <div className={styles.roleName}>{info.padres}</div>
          </div>
        </div>
        <button className={styles.toggleBtn} onClick={() => setShowSchedule(!showSchedule)}>
          {showSchedule ? "▲ Ocultar programação" : "▼ Ver programação completa"}
        </button>
        {showSchedule && schedule.length > 0 && (
          <div className={styles.scheduleSection}>
            <h3 className={styles.scheduleSectionTitle}>📅 Programação Oficial da Festa</h3>
            <div className={styles.tabsContainer}>
              {schedule.map((dayItem, index) => (
                <button
                  key={index}
                  className={`${styles.tabBtn} ${activeTab === index ? styles.activeTab : ""}`}
                  onClick={() => setActiveTab(index)}
                >
                  <span className={styles.tabDayLabel}>{dayItem.day}</span>
                </button>
              ))}
            </div>
            <div className={styles.eventsList}>
              {schedule[activeTab]?.events.map((evt, idx) => {
                const isHighlight = evt.show || evt.title.includes("Missa Conga") || evt.title.includes("Encerramento");
                return (
                  <div key={idx} className={`${styles.eventCard} ${isHighlight ? styles.eventCardHighlight : ""}`}>
                    <div className={styles.eventTime}>{evt.time}</div>
                    <div className={styles.eventDetails}>
                      <div className={styles.eventTitle}>
                        {evt.show && <span className={styles.eventShowBadge}>🎵 SHOW</span>}
                        {evt.title}
                      </div>
                      {evt.responsaveis && (
                        <div className={styles.eventMeta}>
                          <strong>Responsáveis:</strong> {evt.responsaveis}
                        </div>
                      )}
                      {evt.participacao && (
                        <div className={styles.eventMeta}>
                          <strong>Participação:</strong> {evt.participacao}
                        </div>
                      )}
                      {evt.detail && (
                        <div className={styles.eventMeta}>{evt.detail}</div>
                      )}
                      {evt.show && (
                        <div className={styles.eventMeta} style={{ color: "#e5c158", fontWeight: "600" }}>
                          {evt.show}
                        </div>
                      )}
                      {evt.extra && (
                        <div className={styles.eventExtraTag}>📌 {evt.extra}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
