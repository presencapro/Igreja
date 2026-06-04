import { useState, useMemo } from "react";
import { Bell, X } from "lucide-react";
import styles from "./StickyCard.module.css";

export default function StickyCard({ siteData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const upcomingEvent = useMemo(() => {
    if (!siteData.specialEvents || siteData.specialEvents.length === 0) return null;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    for (const event of siteData.specialEvents) {
      if (
        event.endMonth > currentMonth || 
        (event.endMonth === currentMonth && event.endDay >= currentDay)
      ) {
        return event;
      }
    }
    
    return null;
  }, [siteData.specialEvents]);

  const mainNotice = upcomingEvent 
    ? `Próximo evento: ${upcomingEvent.title}` 
    : (siteData.notices && siteData.notices.length > 0 ? siteData.notices[0] : null);

  if (!mainNotice) return null;

  if (!isExpanded) {
    return (
      <button 
        className={`${styles.card} ${styles.minimized}`} 
        onClick={() => setIsExpanded(true)}
        aria-label="Ver avisos"
        title="Ver avisos"
      >
        <Bell size={24} className={styles.bellIcon} />
        <span className={styles.badge}>1</span>
      </button>
    );
  }

  return (
    <div className={`${styles.card} ${styles.expanded}`}>
       <div className={styles.header}>
         <span className={styles.title}>Aviso em Destaque</span>
         <button 
           className={styles.closeBtn} 
           onClick={() => setIsExpanded(false)} 
           aria-label="Fechar aviso"
           title="Fechar aviso"
         >
           <X size={18} />
         </button>
       </div>
       <p className={styles.text}>{mainNotice}</p>
       {upcomingEvent && upcomingEvent.location && (
         <p style={{ fontSize: "0.85rem", color: "var(--accent)", marginTop: "8px", fontWeight: "600" }}>
           📍 {upcomingEvent.location}
         </p>
       )}
    </div>
  );
}
