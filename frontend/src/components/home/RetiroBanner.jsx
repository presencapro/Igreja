import { useState, useContext, useMemo } from "react";
import { SiteContext } from "../../context/SiteContext";
import { MapPin } from "lucide-react";
import styles from "./RetiroBanner.module.css";

export default function RetiroBanner() {
  const { siteData } = useContext(SiteContext);
  const [showSchedule, setShowSchedule] = useState(false);

  // Use the festival data from context
  const festivalInfo = siteData.rosarioFestivalInfo;
  const festivalSchedule = siteData.rosarioFestivalSchedule;

  // Pega o mapLink do evento especial correspondente
  const mapLink = siteData.specialEvents?.find(
    (e) => e.startMonth === 8 && e.startDay === 25
  )?.mapLink || "https://maps.google.com/?q=-19.257777,-44.511005";

  // Group events by day
  const groupedEvents = useMemo(() => {
    if (!festivalSchedule || festivalSchedule.length === 0) return {};
    
    const groups = {};
    festivalSchedule.forEach(event => {
      if (!groups[event.day]) {
        groups[event.day] = [];
      }
      groups[event.day].push(event);
    });
    return groups;
  }, [festivalSchedule]);

  if (!festivalInfo || !festivalSchedule || festivalSchedule.length === 0) {
    return null;
  }

  return (
    <section className={styles.bannerContainer}>
      <div className={styles.contentWrapper}>

        {/* Badge */}
        <a
          href={mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.badge}
          title="Ver no Google Maps"
        >
          ⛪ FESTA DO RETIRO
          <MapPin size={14} style={{ marginLeft: "0.35rem", opacity: 0.85 }} />
        </a>

        {/* Header */}
        <div className={styles.headerGroup}>
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.communityTag}
            title="Ver localização no Google Maps"
          >
            <MapPin size={16} />
            {festivalInfo.location}
          </a>
          <h2 className={styles.mainTitle}>
            Festa em honra de<br />
            <em>Nossa Senhora do Rosário e Nossa Senhora das Dores</em>
          </h2>
          <p className={styles.motto}>
            Virgem Santíssima, rogai por nós!
          </p>
        </div>

        {/* Info Grid */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>📅</div>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>Período</span>
              <span className={styles.infoValue}>{festivalInfo.date}</span>
              <span className={styles.infoSub}>Sexta, Sábado e Domingo</span>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>🎵</div>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>Atrações Musicais</span>
              <span className={styles.infoValue}>Shows todos os dias</span>
              <span className={styles.infoSub}>Logo após as celebrações</span>
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
            <h3 className={styles.scheduleTitle}>📅 Programação Oficial</h3>

            {Object.entries(groupedEvents).map(([dayLabel, events], index) => (
              <div key={index} className={styles.dayCard}>
                <div className={styles.dayHeader}>
                  📌 {dayLabel}
                </div>

                <div className={styles.eventsList}>
                  {events.map((evt, idx) => (
                    <div key={idx} className={styles.eventRow}>
                      {evt.isShow ? (
                        <span className={styles.musicBadge}>🎵 SHOW</span>
                      ) : (
                        <span className={styles.eventTimeBadge}>{evt.time}</span>
                      )}
                      
                      <div className={styles.eventDetailContent}>
                        <span className={styles.eventDetailText}>{evt.event}</span>
                        {evt.details && (
                          <span className={styles.eventSubText}>{evt.details}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
