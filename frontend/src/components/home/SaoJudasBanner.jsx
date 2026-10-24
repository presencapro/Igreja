// src/components/home/SaoJudasBanner.jsx
import { useState } from "react";
import styles from "./SaoJudasBanner.module.css";

const scheduleData = [
  {
    dayLabel: "25/10 — Domingo",
    dateNum: "25",
    month: "OUT",
    weekDay: "Domingo",
    events: [
      { time: "08h30", title: "Terço Mariano" },
      { time: "09h00", title: "Santa Missa" },
      { time: "Após a Missa", special: true, title: "Venda de comidas típicas" },
    ],
  },
  {
    dayLabel: "26/10 — Segunda-Feira",
    dateNum: "26",
    month: "OUT",
    weekDay: "Segunda",
    events: [
      { time: "19h00", title: "Terço Mariano" },
      { time: "19h30", title: "Santa Missa" },
      { time: "20h30", special: true, title: "Tradicional Cumbucão" },
    ],
  },
  {
    dayLabel: "27/10 — Terça-Feira",
    dateNum: "27",
    month: "OUT",
    weekDay: "Terça",
    events: [
      { time: "19h00", title: "Terço Mariano" },
      { time: "19h30", title: "Santa Missa" },
      { time: "20h30", special: true, title: "Bingo relâmpago (valendo prendas)" },
    ],
  },
  {
    dayLabel: "28/10 — Quarta-Feira (Dia do Padroeiro)",
    dateNum: "28",
    month: "OUT",
    weekDay: "Quarta",
    events: [
      { time: "19h00", title: "Terço Mariano" },
      { time: "19h30", title: "Santa Missa Solene" },
      { time: "Após a Missa", special: true, title: "Procissão luminosa com a imagem de São Judas Tadeu" },
    ],
  },
];

export default function SaoJudasBanner() {
  const [showSchedule, setShowSchedule] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Período de exibição do próximo evento (20 a 29 de outubro)
  const now = new Date();
  const start = new Date(now.getFullYear(), 9, 20); // 20 de outubro (mês 9 = outubro)
  const end = new Date(now.getFullYear(), 9, 29);   // expira após o dia 28/10
  if (now < start || now >= end) return null;

  return (
    <section className={styles.bannerContainer} id="proximo-evento">
      <div className={styles.contentWrapper}>

        {/* Badge Superior */}
        <div className={styles.badge}>
          ✝️ PRÓXIMO EVENTO PAROQUIAL
        </div>

        {/* Cabeçalho */}
        <div className={styles.headerGroup}>
          <span className={styles.communityTag}>
            Comunidade São Judas Tadeu • Paróquia N. Sra. do Carmo
          </span>
          <p className={styles.triduoLabel}>Tríduo em Honra a</p>
          <h2 className={styles.mainTitleBig}>São Judas Tadeu</h2>
          
          {/* Badge em cápsula verde com borda dourada idêntico à arte */}
          <div className={styles.dateBadgeCapsule}>
            25 a 28 de outubro de 2026
          </div>
          <hr className={styles.divider} />
        </div>

        {/* Tema Oficial */}
        <div className={styles.themeCard}>
          <span className={styles.themeLabel}>Tema</span>
          <p className={styles.themeText}>
            “São Judas: fazei-nos propagadores da Palavra de Deus!”
          </p>
        </div>


        {/* Botão para Exibir/Ocultar Programação */}
        <button
          className={styles.toggleBtn}
          onClick={() => setShowSchedule(!showSchedule)}
          aria-expanded={showSchedule}
        >
          {showSchedule ? "▲ Ocultar programação completa" : "▼ Ver programação completa dos dias"}
        </button>

        {/* Programação Completa com Abas */}
        {showSchedule && (
          <div className={styles.scheduleSection}>
            <h3 className={styles.scheduleTitle}>📅 Programação do Tríduo e Festa</h3>

            {/* Abas dos Dias */}
            <div className={styles.daysContainer}>
              {scheduleData.map((item, index) => (
                <button
                  key={index}
                  className={`${styles.dayTab} ${activeTab === index ? styles.activeDayTab : ""}`}
                  onClick={() => setActiveTab(index)}
                  aria-selected={activeTab === index}
                >
                  <span className={styles.tabDate}>{item.dateNum} {item.month}</span>
                  <span className={styles.tabWeek}>{item.weekDay}</span>
                </button>
              ))}
            </div>

            {/* Detalhes do Dia Selecionado */}
            <div className={styles.dayCard}>
              <div className={styles.dayHeader}>
                📌 {scheduleData[activeTab].dayLabel}
              </div>

              <div className={styles.eventsList}>
                {scheduleData[activeTab].events.map((evt, idx) => (
                  <div key={idx} className={styles.eventRow}>
                    {evt.special ? (
                      <span className={styles.specialBadge}>✨ {evt.time}</span>
                    ) : (
                      <span className={styles.eventTimeBadge}>{evt.time}</span>
                    )}
                    <span className={styles.eventDetailText}>{evt.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Espaço Social */}
            <div className={styles.socialCard}>
              <p className={styles.socialTitle}>🍲 Movimento Social &amp; Barraquinhas</p>
              <p className={styles.socialText}>
                Todas as noites haverá venda de comidas típicas, refrigerantes e doces.
                Participe com sua família e fortaleça nossa comunidade!
              </p>
            </div>

            {/* Rodapé e Padres */}
            <div className={styles.footerInfo}>
              <p className={styles.clergyNames}>
                Pe. Rafael Lucas e Pe. Roberto Vicente
              </p>
              <p className={styles.dioceseText}>
                Comunidade São Judas Tadeu • Diocese de Sete Lagoas - MG
              </p>
            </div>
          </div>
        )}

        {/* WhatsApp CTA */}
        <a
          href="https://wa.me/553137141018?text=Olá!%20Gostaria%20de%20mais%20informações%20sobre%20a%20Festa%20de%20São%20Judas%20Tadeu."
          target="_blank"
          rel="noreferrer"
          className={styles.whatsappCta}
        >
          <span>📱 Mais informações pelo WhatsApp</span>
        </a>

      </div>
    </section>
  );
}
