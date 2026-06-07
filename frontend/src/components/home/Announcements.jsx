import { Info, AlertTriangle, AlertOctagon, Megaphone } from "lucide-react";
import styles from "./Announcements.module.css";

const TYPE_META = {
  info: {
    label: "Informativo",
    icon: Info,
    className: "info",
  },
  warning: {
    label: "Atenção",
    icon: AlertTriangle,
    className: "warning",
  },
  urgent: {
    label: "Urgente",
    icon: AlertOctagon,
    className: "urgent",
  },
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

export default function Announcements({ announcements = [] }) {
  const visible = (announcements || []).filter(
    (a) => (a.title && a.title.trim()) || (a.message && a.message.trim())
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <Megaphone size={18} className={styles.headerIcon} />
        <h3 className={styles.title}>Comunicados</h3>
      </div>
      <div className={styles.preMessage}>
        <span className={styles.preIcon}>📢</span>
        <span>Seja bem-vindo(a)! Acompanhe abaixo os comunicados e informações importantes da Paróquia Nossa Senhora do Carmo.</span>
      </div>

      {visible.length > 0 && (
        <div className={styles.grid}>
          {visible.map((a) => {
            const meta = TYPE_META[a.type] || TYPE_META.info;
            const Icon = meta.icon;
            return (
              <article
                key={a.id}
                className={`${styles.card} ${styles[meta.className]}`}
              >
                <div className={styles.iconBox}>
                  <Icon size={22} />
                </div>
                <div className={styles.body}>
                  <div className={styles.tagRow}>
                    <span className={styles.tag}>{meta.label}</span>
                    {a.date && <span className={styles.date}>{formatDate(a.date)}</span>}
                  </div>
                  {a.title && <h4 className={styles.cardTitle}>{a.title}</h4>}
                  {a.message && <p className={styles.message}>{a.message}</p>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
