import { useState } from "react";
import styles from "./RosarioBanner.module.css";
import { parishData } from "../../data";

export default function RosarioBanner({ siteData }) {
  const [showSchedule, setShowSchedule] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const info = siteData?.rosarioFestivalInfo || parishData.rosarioFestivalInfo || {
    title: "70 anos da Festa de N.S. do Rosário",
    subtitle: "Paraopeba - MG",
    festeiros: "Ana Júlia Lima Marques & Marcelino Reis",
    imperadores: "Taynara Nadi Lima Marques & Marcelo Reis",
    padres: "Pe. Rafael Lucas & Pe. Roberto Vicente",
  };

  const schedule = siteData?.rosarioFestivalSchedule || parishData.rosarioFestivalSchedule || [];

  return (
    <section className={styles.bannerContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.badge}>
          🌹 EVENTO ESPECIAL
        </div>

        <div className={styles.headerTitle}>
          <h2 className={styles.mainHeading}>70 ANOS DA FESTA DE N.S. DO ROSÁRIO</h2>
          <p className={styles.subHeading}>{info.subtitle}</p>
        </div>

        {/* Roles Grid: Festeiros, Imperadores, Padres */}
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

        {/* Toggle Schedule Button */}
        <button 
          className={styles.toggleBtn}
          onClick={() => setShowSchedule(!showSchedule)}
        >
          {showSchedule ? "▲ Ocultar programação" : "▼ Ver programação completa"}
        </button>

        {/* Schedule Display */}
        {showSchedule && schedule.length > 0 && (
          <div className={styles.scheduleSection}>
            <h3 className={styles.scheduleSectionTitle}>📅 Programação Oficial da Festa</h3>

            {/* Date Tabs */}
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

            {/* Active Day Events */}
            <div className={styles.eventsList}>
              {schedule[activeTab]?.events.map((evt, idx) => {
                const isHighlight = evt.show || evt.title.includes("Missa Conga") || evt.title.includes("Encerramento");

                return (
                  <div
                    key={idx}
                    className={`${styles.eventCard} ${isHighlight ? styles.eventCardHighlight : ""}`}
                  >
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
                        <div className={styles.eventMeta}>
                          {evt.detail}
                        </div>
                      )}

                      {evt.show && (
                        <div className={styles.eventMeta} style={{ color: "#e5c158", fontWeight: "600" }}>
                          {evt.show}
                        </div>
                      )}

                      {evt.extra && (
                        <div className={styles.eventExtraTag}>
                          📌 {evt.extra}
                        </div>
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
