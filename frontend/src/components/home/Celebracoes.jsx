import { useState, useMemo } from "react";
import { Clock, Calendar as CalendarIcon, MapPin, ChevronLeft, ChevronRight, Info, Megaphone } from "lucide-react";
import styles from "./Celebracoes.module.css";

export default function Celebracoes({ siteData }) {
  const { massTimes } = siteData;

  // Estado para navegação do calendário
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Nomes dos meses e dias
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Lógica de Processamento de Datas (Inteligente)
  const monthEvents = useMemo(() => {
    const events = {};
    const totalDays = new Date(year, month + 1, 0).getDate();

    const normalizeDay = (dayStr) => {
      const d = dayStr.toLowerCase();
      if (d.includes("domingo")) return 0;
      if (d.includes("segunda")) return 1;
      if (d.includes("terça")) return 2;
      if (d.includes("quarta")) return 3;
      if (d.includes("quinta")) return 4;
      if (d.includes("sexta")) return 5;
      if (d.includes("sabado") || d.includes("sábado")) return 6;
      return -1;
    };

    const getOrdinal = (dayStr) => {
      if (dayStr.includes("1°")) return 1;
      if (dayStr.includes("2°")) return 2;
      if (dayStr.includes("3°")) return 3;
      if (dayStr.includes("4°")) return 4;
      if (dayStr.includes("5°")) return 5;
      return null; // Null significa todas as ocorrências
    };

    massTimes.forEach(mt => {
      // Caso especial: "Dia 28"
      if (mt.day.toLowerCase().includes("dia 28")) {
        if (!events[28]) events[28] = [];
        events[28].push(mt);
        return;
      }

      const targetDay = normalizeDay(mt.day);
      if (targetDay === -1) return;

      const ordinal = getOrdinal(mt.day);
      let count = 0;

      for (let d = 1; d <= totalDays; d++) {
        const date = new Date(year, month, d);
        if (date.getDay() === targetDay) {
          count++;
          // Se for ordinal específico, só adiciona se bater o contador
          // No caso de "1° e 3°", precisamos tratar individualmente
          const isMatch = ordinal 
            ? (mt.day.includes(`${count}°`) || (mt.day.includes("e") && mt.day.includes(`${count}°`)))
            : true;

          // Correção para múltiplos ordinais (ex: "1° e 3° Quarta")
          const hasMultipleOrdinals = mt.day.includes(" e ");
          let verifiedMatch = false;
          if (hasMultipleOrdinals) {
             if (mt.day.includes("1°") && count === 1) verifiedMatch = true;
             if (mt.day.includes("2°") && count === 2) verifiedMatch = true;
             if (mt.day.includes("3°") && count === 3) verifiedMatch = true;
             if (mt.day.includes("4°") && count === 4) verifiedMatch = true;
             if (mt.day.includes("5°") && count === 5) verifiedMatch = true;
          } else if (ordinal) {
             if (count === ordinal) verifiedMatch = true;
          } else {
             verifiedMatch = true;
          }

          if (verifiedMatch) {
            if (!events[d]) events[d] = [];
            events[d].push(mt);
          }
        }
      }
    });

    // Adicionar eventos especiais
    if (siteData.specialEvents) {
      siteData.specialEvents.forEach(sp => {
        if (sp.startMonth === month || sp.endMonth === month) {
          const sDay = sp.startMonth === month ? sp.startDay : 1;
          const eDay = sp.endMonth === month ? sp.endDay : totalDays;
          
          for (let d = sDay; d <= eDay; d++) {
            if (!events[d]) events[d] = [];
            events[d].push({
              isSpecial: true,
              title: sp.title,
              location: sp.location || "Evento Paroquial",
              mapLink: sp.mapLink || ""
            });
          }
        }
      });
    }

    return events;
  }, [massTimes, siteData.specialEvents, month, year]);

  // Gerar grade do calendário
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const selectedEvents = monthEvents[selectedDay] || [];

  return (
    <section id="celebracoes" className="card full reveal">
      <div className={styles.sectionHeader}>
        <h2>Calendário de Celebrações</h2>
        <p className={styles.subtitle}>
          {siteData.celebrationsNote || "Selecione um dia para ver os horários das missas."}
        </p>
      </div>

      {/* Banner de Comunicado/Aviso */}
      {siteData.notices && siteData.notices.length > 0 && (
        <div className={styles.communicadoBanner}>
          <Megaphone size={20} className={styles.communicadoIcon} />
          <div className={styles.communicadoContent}>
            <span className={styles.communicadoLabel}>Comunicado / Avisos</span>
            {siteData.notices.length === 1 ? (
              <p className={styles.communicadoText}>{siteData.notices[0]}</p>
            ) : (
              <ul className={styles.communicadoList} style={{ margin: 0, paddingLeft: "1.2rem", listStyleType: "disc" }}>
                {siteData.notices.map((notice, idx) => (
                  <li key={idx} className={styles.communicadoText} style={{ marginBottom: idx === siteData.notices.length - 1 ? 0 : "0.25rem" }}>
                    {notice}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className={styles.calendarLayout}>
        {/* Calendário */}
        <div className={styles.calendarContainer}>
          <div className={styles.calendarHeader}>
            <button onClick={prevMonth} className={styles.navBtn}><ChevronLeft size={20} /></button>
            <h3>{monthNames[month]} {year}</h3>
            <button onClick={nextMonth} className={styles.navBtn}><ChevronRight size={20} /></button>
          </div>
          
          <div className={styles.calendarGrid}>
            {daysOfWeek.map(d => <div key={d} className={styles.dayLabel}>{d}</div>)}
            {blanks.map((_, i) => <div key={`b-${i}`} className={styles.dayCellBlank}></div>)}
            {days.map(d => (
              <button 
                key={d} 
                onClick={() => setSelectedDay(d)}
                className={`${styles.dayCell} ${selectedDay === d ? styles.selected : ""} ${monthEvents[d] ? styles.hasEvent : ""}`}
              >
                {d}
                <div style={{ display: "flex", gap: "2px", justifyContent: "center", marginTop: "2px" }}>
                  {monthEvents[d]?.some(e => !e.isSpecial) && <span className={styles.eventDot}></span>}
                  {monthEvents[d]?.some(e => e.isSpecial) && <span className={styles.eventDot} style={{ background: "var(--accent)" }}></span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detalhes do Dia */}
        <div className={styles.detailsContainer}>
          <div className={styles.detailsHeader}>
            <CalendarIcon size={20} />
            <h4>Eventos em {selectedDay} de {monthNames[month]}</h4>
          </div>

          <div className={styles.eventList}>
            {selectedEvents.length > 0 ? (
              selectedEvents.map((mt, i) => {
                if (mt.isSpecial) {
                  return (
                    <div key={i} className={styles.eventItem} style={{ background: "rgba(212, 175, 55, 0.08)", borderLeftColor: "var(--accent)" }}>
                      <div className={styles.eventTime} style={{ color: "var(--accent)", fontWeight: "700" }}>
                        <Info size={16} />
                        <span>Festa / Evento</span>
                      </div>
                      <div className={styles.eventLocation}>
                        <strong style={{ fontSize: "1rem", color: "var(--primary)", display: "block", marginBottom: "4px" }}>{mt.title}</strong>
                        <div style={{ fontSize: "0.85rem", color: "var(--muted)", display: "flex", alignItems: "flex-start", gap: "4px" }}>
                          {mt.mapLink ? (
                            <a 
                              href={mt.mapLink}
                              target="_blank" 
                              rel="noopener noreferrer"
                              title="Abrir no Google Maps"
                              style={{ textDecoration: "none", cursor: "pointer" }}
                            >
                              <span>📍</span>
                            </a>
                          ) : (
                            <span>📍</span>
                          )}
                          <span>{mt.location}</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                const isMatriz = mt.location.toLowerCase().includes("matriz");
                return (
                  <div key={i} className={`${styles.eventItem} ${isMatriz ? styles.matrizItem : ""}`}>
                    <div className={styles.eventTime}>
                      <Clock size={16} />
                      <span>{mt.time}</span>
                    </div>
                    <div className={styles.eventLocation}>
                      {mt.mapLink ? (
                        <a 
                          href={mt.mapLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.mapLink}
                          title="Abrir no Google Maps"
                          style={{ display: 'inline-flex', color: 'inherit' }}
                        >
                          <MapPin size={16} />
                        </a>
                      ) : (
                        <MapPin size={16} />
                      )}
                      <strong>{mt.location}</strong>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <Info size={32} />
                <p>Nenhuma celebração agendada para este dia.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.calendarFooter}>
         <ul className="schedule-list">
          <li><strong>Forania:</strong> {siteData.forania}</li>
          <li><strong>Ano da Criação:</strong> {siteData.foundedYear}</li>
        </ul>
      </div>
    </section>
  );
}
