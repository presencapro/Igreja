import { useState } from "react";
import { parishData } from "../../data";

export default function EventBanner({ siteData }) {
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  // Use local data as fallback
  const schedule = siteData.carmoFestivalSchedule || parishData.carmoFestivalSchedule || [];

  // Group events by day
  const groupedSchedule = schedule.reduce((acc, item) => {
    if (!acc[item.day]) {
      acc[item.day] = [];
    }
    acc[item.day].push(item);
    return acc;
  }, {});

  // Create calendar days (5 to 16 of July)
  const calendarDays = Array.from({ length: 12 }, (_, i) => i + 5);

  const handleDayClick = (day) => {
    setSelectedDay(day === selectedDay ? null : day);
  };

  const selectedDayEvents = selectedDay
    ? groupedSchedule[`${String(selectedDay).padStart(2, '0')} de julho`] || []
    : [];

  return (
    <section className="event-banner">
      <div className="event-banner-content">
        <div className="event-visual">
          <div className="event-placeholder">
            <div className="event-icon">🕊️</div>
            <div className="event-number">186ª</div>
          </div>
        </div>
        <div className="event-details">
          <div className="event-badge">🎉 EVENTO ESPECIAL</div>
          <h2>186ª FESTA EM HONRA A NOSSA SENHORA DO CARMO</h2>
          <p className="event-motto">"SOB TEU ESCAPULÁRIO, FLOR DO CARMELO, ESTÁ MEU REFÚGIO"</p>
          
          <div className="event-schedule">
            <div className="event-item">
              <div className="event-icon-wrapper">📅</div>
              <div className="event-info">
                <span className="event-time">05 a 16 de julho</span>
                <span className="event-desc">Novenário e Festa da Padroeira</span>
              </div>
            </div>
            <div className="event-item highlight">
              <div className="event-icon-wrapper">🎵</div>
              <div className="event-info">
                <span className="event-time">Shows todos os dias às 20h30</span>
                <span className="event-desc">Marcone, Armando & Eduardo, Túlio & Willian, Banda Amor de Forró, Banda Tarq, Rafaela Pontes, Zé Henrique & Adriano e mais!</span>
              </div>
            </div>
          </div>

          <button 
            className="event-toggle-btn" 
            onClick={() => setShowSchedule(!showSchedule)}
          >
            {showSchedule ? "▲ Ocultar calendário" : "▼ Ver calendário"}
          </button>

          {showSchedule && (
            <div className="full-schedule">
              <h3>📅 Calendário do Novenário</h3>
              
              <div className="calendar-grid">
                {calendarDays.map((day) => {
                  const dayKey = `${String(day).padStart(2, '0')} de julho`;
                  const hasEvents = groupedSchedule[dayKey] && groupedSchedule[dayKey].length > 0;
                  const isSelected = selectedDay === day;
                  
                  return (
                    <button
                      key={day}
                      className={`calendar-day ${hasEvents ? 'has-events' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleDayClick(day)}
                    >
                      <span className="day-number">{day}</span>
                      <span className="day-label">JUL</span>
                      {hasEvents && <span className="event-indicator">•</span>}
                    </button>
                  );
                })}
              </div>

              {selectedDay && selectedDayEvents.length > 0 && (
                <div className="selected-day-events">
                  <h4>📌 {selectedDay} de julho — {selectedDayEvents.length} evento(s)</h4>
                  {selectedDayEvents.map((item, index) => (
                    <div key={index} className={`event-card${item.isShow ? ' event-card--show' : ''}`}>
                      <div className="event-card-time">{item.time}</div>
                      <div className="event-card-content">
                        <div className="event-card-title">
                          {item.isShow && <span className="event-card-show-badge">🎵 SHOW</span>}
                          {item.event}
                        </div>
                        {!item.isShow && (
                          <div className="event-card-location">📍 {item.location}</div>
                        )}
                        {item.communities && (
                          <div className="event-card-details">
                            <strong>Participação das comunidades:</strong> {item.communities}
                          </div>
                        )}
                        {item.schools && (
                          <div className="event-card-details">
                            <strong>Escolas convidadas:</strong> {item.schools}
                          </div>
                        )}
                        {item.details && (
                          <div className="event-card-details">{item.details}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedDay && selectedDayEvents.length === 0 && (
                <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                  Nenhum evento programado para este dia.
                </p>
              )}
            </div>
          )}

          <a href="https://wa.me/553137141018" target="_blank" rel="noreferrer" className="event-cta">
            <span>📱 Mais informações</span>
          </a>
        </div>
      </div>
    </section>
  );
}
