import { useState } from "react";

const schedule = [
  {
    day: "Dia 04 de Agosto",
    theme: "Toda vocação tem como berço uma família — Celebração do dia do Padre",
    items: [
      "19h00 – Santo Terço com a participação do Terço dos Homens, Movimento Mães que oram pelos filhos e Movimento Serra, em seguida a Santa Missa e Bênção especial para as mães.",
    ],
  },
  {
    day: "Dia 05 de Agosto",
    theme: "Na adolescência e na juventude, as vocações florescem.",
    items: [
      "19h00 – Santo Terço com a participação do EJC e EAC em seguida a Santa Missa e Bênção especial para os casais, jovens e adolescentes.",
    ],
  },
  {
    day: "Dia 06 de Agosto",
    theme: "Em Jesus Sacramentado, reconhecemos o amor.",
    items: [
      "13h30 às 16h30 – Atendimentos de confissões.",
      "15h00 – Exposição do Santíssimo Sacramento.",
      "19h00 – Bênção do Santíssimo Sacramento com a participação da catequese Eucarística, em seguida, a Santa Missa com a Bênção especial para as crianças.",
    ],
  },
  {
    day: "Dia 07 de Agosto",
    theme: "O Coração de Jesus nos recorda que o amor jamais acabará.",
    items: [
      "19h00 – Bênção do Santíssimo Sacramento com a participação do Apostolado da Oração, Pastoral da Saúde, Vicentinos, em seguida, a Santa Missa com a Bênção especial para todos os idosos.",
    ],
  },
  {
    day: "Dia 08 de Agosto",
    theme: "A família é o sinal luminoso em meio às trevas do mundo.",
    items: [
      "19h00 – Bênção do Santíssimo Sacramento com a participação do ECC, em seguida, a Santa Missa com a Bênção especial para todas as famílias e lares da nossa amada comunidade.",
      "20h30 – Baile das Famílias, no espaço social da Matriz (faça a reserva da sua mesa com os casais do ECC e no escritório paroquial).",
    ],
  },
  {
    day: "Dia 09 de Agosto",
    theme: "O Domingo é a fonte inesgotável da graça que ilumina cada semana.",
    items: [
      "07h30 – Santa Missa com a Bênção especial para todos os pais, homens que assumiram a missão de amar e educar aqueles que Deus os confiou.",
      "08h30 – Café dos Padres em prol do III EJC, na porta da Igreja Matriz.",
    ],
  },
];

export default function SemanaBanner() {
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const handleDayClick = (index) => {
    setSelectedDay(index === selectedDay ? null : index);
  };

  // Days 04–09 of August
  const calendarDays = [
    { num: "04", label: "AGO" },
    { num: "05", label: "AGO" },
    { num: "06", label: "AGO" },
    { num: "07", label: "AGO" },
    { num: "08", label: "AGO" },
    { num: "09", label: "AGO" },
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
          <div className="event-badge">🎉 EVENTO ESPECIAL</div>
          <h2>SEMANA PAROQUIAL DA FAMÍLIA 2026</h2>
          <p className="event-motto">
            "Família, torna-te aquilo que és! O amor jamais acabará (1Cor 13, 8)"
          </p>

          <div className="event-schedule">

            <div className="event-item highlight">
              <div className="event-icon-wrapper">⛪</div>
              <div className="event-info">
                <span className="event-time">Missas diárias às 19h00</span>
                <span className="event-desc">
                  CPP, CAEP e Padres Rafael Lucas e Roberto Vicente
                </span>
              </div>
            </div>

            <div className="event-item">
              <div className="event-icon-wrapper">💃</div>
              <div className="event-info">
                <span className="event-time">Baile das Famílias — 08/08 às 20h30</span>
                <span className="event-desc">
                  Reservas com os casais do ECC ou no escritório paroquial
                </span>
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
              <h3>📅 Programação da Semana</h3>

              {/* Calendar grid — 6 days */}
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

                  <div className="semana-day-theme">
                    <em>{schedule[selectedDay].theme}</em>
                  </div>

                  <div className="semana-items">
                    {schedule[selectedDay].items.map((item, i) => (
                      <div key={i} className="event-card-details">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="semana-footer-note">
                Em Cristo, O Bom Pastor: CPP, CAEP e Padres Rafael Lucas e Roberto Vicente.
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
