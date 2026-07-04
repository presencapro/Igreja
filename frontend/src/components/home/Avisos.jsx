import { useMemo } from "react";

export default function Avisos({ siteData }) {
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const groupedEvents = useMemo(() => {
    if (!siteData.specialEvents) return [];
    
    const groups = {};
    siteData.specialEvents.forEach(event => {
      const monthName = months[event.startMonth];
      if (!groups[monthName]) groups[monthName] = [];
      groups[monthName].push(event);
    });
    return groups;
  }, [siteData.specialEvents]);

  const formatDays = (startDay, endDay, startMonth, endMonth) => {
    if (startDay === endDay && startMonth === endMonth) return `${startDay}`;
    if (startMonth === endMonth) return `${startDay} a ${endDay}`;
    return `${String(startDay).padStart(2, '0')}/${String(startMonth + 1).padStart(2, '0')} a ${String(endDay).padStart(2, '0')}/${String(endMonth + 1).padStart(2, '0')}`;
  };

  return (
    <section id="avisos" className="card full reveal">
      <h2 style={{ marginBottom: "1.5rem" }}>Calendário de Eventos e Festividades</h2>
      
      {siteData.notices && siteData.notices.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.8rem", color: "var(--primary)" }}>Avisos Gerais</h3>
          <ul className="schedule-list">
            {siteData.notices.map((notice, idx) => (
              <li key={idx}><strong>Aviso:</strong> {notice}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="events-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        {Object.entries(groupedEvents).map(([month, events]) => (
          <div key={month} className="event-month-group">
            <h3 style={{ borderBottom: "2px solid var(--accent)", display: "inline-block", paddingBottom: "4px", marginBottom: "1rem", color: "var(--accent)" }}>
              {month}
            </h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {events.map((event, idx) => (
                <li key={idx} style={{ marginBottom: "1rem", padding: "12px", background: "rgba(128, 128, 128, 0.06)", borderRadius: "8px", borderLeft: "4px solid var(--accent)" }}>
                  <strong style={{ color: "var(--primary)", display: "block", fontSize: "1.05rem", marginBottom: "4px" }}>
                    Dia {formatDays(event.startDay, event.endDay, event.startMonth, event.endMonth)}
                  </strong>
                  <span style={{ fontWeight: "600", display: "block", lineHeight: "1.3" }}>{event.title}</span>
                  {event.location && (
                    <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "6px", display: "flex", alignItems: "flex-start", gap: "4px" }}>
                      <span>📍</span> <span>{event.location}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
