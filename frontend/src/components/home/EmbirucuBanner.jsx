import { useState } from "react";

const schedule = [
  {
    day: "11/09 — Sexta-feira",
    items: [
      "18:30 – Terço Mariano",
      "19:30 – Santa Missa",
    ],
  },
  {
    day: "12/09 — Sábado",
    items: [
      "18:30 – Terço Mariano",
      "19:30 – Santa Missa",
      "Logo após – Levantamento da Bandeira",
      "🎵 Música ao vivo",
    ],
    extra: "🍢 Funcionamento da barraquinha com deliciosos pastéis, caldo, canjica, churrasco, tropeiro e refrigerante.",
  },
  {
    day: "13/09 — Domingo",
    items: [
      "06:00 – Alvorada festiva",
      "11:00 – Santa Missa",
      "Em seguida – Procissão",
      "Logo após – Almoço na barraquinha",
      "🎵 Música ao vivo",
      "13:30 – Cumprimento de promessas",
    ],
    extra: "🍢 Funcionamento da barraquinha com deliciosos pastéis, caldo, canjica, churrasco, tropeiro e refrigerante.",
  },
];

export default function EmbirucuBanner() {
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const handleDayClick = (index) => {
    setSelectedDay(index === selectedDay ? null : index);
  };

  const calendarDays = [
    { num: "11", label: "SET" },
    { num: "12", label: "SET" },
    { num: "13", label: "SET" },
  ];

  return (
    <section className="event-banner">
      <div className="event-banner-content">
        {/* Visual icon */}
        <div className="event-visual">
          <div className="event-placeholder">
            <div className="event-icon">✝️</div>
            <div className="event-number">2026</div>
          </div>
        </div>

        {/* Details */}
        <div className="event-details">
          <div className="event-badge">⛪ FESTA DA COMUNIDADE</div>
          <h2>FESTA DE SENHOR BOM JESUS, NOSSA SENHORA DO ROSÁRIO E SÃO SEBASTIÃO</h2>
          <p className="event-motto">
            "Eis que estou à porta e bato" (Ap 3,20)
          </p>

          <div className="event-schedule">
            <div className="event-item">
              <div className="event-icon-wrapper">📍</div>
              <div className="event-info">
                <span className="event-time">Comunidade Embiruçu — Paraopeba/MG</span>
                <span className="event-desc">11 a 13 de setembro de 2026</span>
              </div>
            </div>

            <div className="event-item highlight">
              <div className="event-icon-wrapper">⛪</div>
              <div className="event-info">
                <span className="event-time">Missas, Terço Mariano e Procissão</span>
                <span className="event-desc">
                  Festeiros: Neusa e José Calixto
                </span>
              </div>
            </div>

            <div className="event-item">
              <div className="event-icon-wrapper">🙏</div>
              <div className="event-info">
                <span className="event-time">Pe. Rafael Lucas &amp; Pe. Roberto Vicente</span>
                <span className="event-desc">Apoio pastoral</span>
              </div>
            </div>
          </div>

          {/* Toggle button */}
          <button
            className="event-toggle-btn"
            onClick={() => setShowSchedule(!showSchedule)}
          >
            {showSchedule ? "▲ Ocultar programação" : "▼ Ver programação completa"}
          </button>

          {/* Full schedule */}
          {showSchedule && (
            <div className="full-schedule">
              <h3>📅 Programação da Festa</h3>

              {/* Calendar grid — 3 days */}
              <div className="calendar-grid semana-grid">
                {calendarDays.map((d, index) => (
                  <button
                    key={d.num}
                    className={`calendar-day has-events${selectedDay === index ? " selected" : ""}`}
                    onClick={() => handleDayClick(index)}
                  >
                    <span className="day-number">{d.num}</span>
                    <span className="day-label">{d.label}</span>
                    <span className="event-indicator" />
                  </button>
                ))}
              </div>

              {/* Selected day detail */}
              {selectedDay !== null && (
                <div className="selected-day-events">
                  <h4>📌 {schedule[selectedDay].day}</h4>

                  <div className="semana-items">
                    {schedule[selectedDay].items.map((item, i) => (
                      <div key={i} className="event-card-details">
                        {item}
                      </div>
                    ))}
                  </div>

                  {schedule[selectedDay].extra && (
                    <div className="event-card-details" style={{ marginTop: "0.75rem", fontStyle: "italic", opacity: 0.85 }}>
                      {schedule[selectedDay].extra}
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "rgba(220, 53, 69, 0.08)", borderRadius: "8px", fontSize: "0.85rem", color: "var(--text)" }}>
                ⚠️ <strong>Aviso:</strong> É expressamente proibido o comércio de bebidas alcoólicas na barraquinha e local próximo da mesma sem alvará expedido.
              </div>

              <p className="semana-footer-note">
                Festeiros: Neusa e José Calixto — Apoio: Pe. Rafael Lucas e Pe. Roberto Vicente.
              </p>
            </div>
          )}

          {/* WhatsApp CTA */}
          <a
            href="https://wa.me/553137141018"
            target="_blank"
            rel="noreferrer"
            className="event-cta"
          >
            <span>📱 Mais informações</span>
          </a>
        </div>
      </div>
    </section>
  );
}
