// src/components/home/SaoJudasBanner.jsx
import { useState } from "react";
import styles from "./SaoJudasBanner.module.css";

const scheduleData = [
  {
    dayId: "25",
    dayLabel: "Dia 25 (domingo)",
    dateNum: "25",
    month: "OUT",
    weekDay: "Domingo",
    badge: "Abertura",
    events: [
      {
        time: "08h30",
        type: "terco",
        icon: "📿",
        title: "Terço Mariano",
        desc: "Oração e meditação dos mistérios em comunidade",
      },
      {
        time: "09h00",
        type: "missa",
        icon: "🍷",
        title: "Santa Missa",
        desc: "Celebração Eucarística dominical",
      },
      {
        time: "Após a Missa",
        type: "social",
        icon: "🍲",
        special: true,
        title: "Venda de comidas típicas",
        desc: "Delícias preparadas com carinho pelas equipes da comunidade",
      },
    ],
  },
  {
    dayId: "26",
    dayLabel: "Dia 26 (segunda-feira)",
    dateNum: "26",
    month: "OUT",
    weekDay: "Segunda",
    badge: "2º Dia do Tríduo",
    events: [
      {
        time: "19h00",
        type: "terco",
        icon: "📿",
        title: "Terço Mariano",
        desc: "Oração comunitária do Santo Terço",
      },
      {
        time: "19h30",
        type: "missa",
        icon: "🍷",
        title: "Santa Missa",
        desc: "Celebração do Tríduo oracional",
      },
      {
        time: "20h30",
        type: "social",
        icon: "🍲",
        special: true,
        title: "Tradicional Cumbucão",
        desc: "Noite gastronômica e confraternização no espaço comunitário",
      },
    ],
  },
  {
    dayId: "27",
    dayLabel: "Dia 27 (terça-feira)",
    dateNum: "27",
    month: "OUT",
    weekDay: "Terça",
    badge: "3º Dia do Tríduo",
    events: [
      {
        time: "19h00",
        type: "terco",
        icon: "📿",
        title: "Terço Mariano",
        desc: "Oração do Santo Terço com as famílias",
      },
      {
        time: "19h30",
        type: "missa",
        icon: "🍷",
        title: "Santa Missa",
        desc: "Último dia do Tríduo oracional preparatório",
      },
      {
        time: "20h30",
        type: "social",
        icon: "🎲",
        special: true,
        title: "Bingo relâmpago (valendo prendas)",
        desc: "Momento descontraído de lazer e prêmios para toda a família",
      },
    ],
  },
  {
    dayId: "28",
    dayLabel: "Dia 28 (quarta-feira)",
    dateNum: "28",
    month: "OUT",
    weekDay: "Quarta",
    badge: "Dia do Padroeiro",
    highlight: true,
    events: [
      {
        time: "19h00",
        type: "terco",
        icon: "📿",
        title: "Terço Mariano",
        desc: "Abertura oracional da Solenidade do Padroeiro",
      },
      {
        time: "19h30",
        type: "missa",
        icon: "🍷",
        title: "Santa Missa, seguida de procissão",
        desc: "Solene Celebração em Honra a São Judas Tadeu, seguida de cortejo e bênção",
      },
    ],
  },
];

export default function SaoJudasBanner() {
  const [selectedDay, setSelectedDay] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Período de exibição do evento (Outubro 2026 - dias 20 a 31)
  const now = new Date();
  const isOctober2026 =
    now.getFullYear() === 2026 && now.getMonth() === 9 && now.getDate() <= 31;
  // Permite renderizar em ambiente de desenvolvimento ou durante o período festivo
  const shouldRender = isOctober2026 || process.env.NODE_ENV !== "production";
  if (!shouldRender) return null;

  const daysToDisplay =
    selectedDay === "all"
      ? scheduleData
      : scheduleData.filter((d) => d.dayId === selectedDay);

  return (
    <section className={styles.bannerContainer} id="sao-judas-triduo">
      <div className={styles.contentWrapper}>
        {/* Top Badge */}
        <div className={styles.badge}>
          <span>✝️</span>
          <span>FESTA E TRÍDUO DA COMUNIDADE</span>
        </div>

        {/* Header Group */}
        <div className={styles.headerGroup}>
          <span className={styles.communityTag}>
            Comunidade São Judas Tadeu • Paróquia N. Sra. do Carmo
          </span>

          <p className={styles.triduoLabel}>Tríduo em Honra a</p>

          <h2 className={styles.mainTitleBig}>São Judas Tadeu</h2>

          {/* Golden Filigree SVG Divider */}
          <div className={styles.goldFlourish}>
            <svg
              viewBox="0 0 200 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.flourishSvg}
              aria-hidden="true"
            >
              <path
                d="M100 3C88 3 78 12 60 12C45 12 30 5 10 12M100 3C112 3 122 12 140 12C155 12 170 5 190 12"
                stroke="#c59b46"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <circle cx="100" cy="12" r="3.5" fill="#c59b46" />
              <circle cx="86" cy="12" r="2" fill="#c59b46" />
              <circle cx="114" cy="12" r="2" fill="#c59b46" />
            </svg>
          </div>

          {/* Capsule Date Badge */}
          <div className={styles.dateBadgeCapsule}>
            <span className={styles.capsuleInner}>
              25 a 28 de outubro de 2026
            </span>
          </div>

          {/* Theme Card */}
          <div className={styles.themeCard}>
            <span className={styles.themeLabel}>Tema:</span>
            <p className={styles.themeText}>
              “São Judas: fazei-nos propagadores da Palavra de Deus!”
            </p>
          </div>
        </div>

        {/* Schedule & Highlights Section */}
        <div className={styles.scheduleWrapper}>
          <div className={styles.scheduleColumn}>
            {/* Filter Tabs */}
            <div className={styles.tabsNav} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={selectedDay === "all"}
                className={`${styles.tabBtn} ${
                  selectedDay === "all" ? styles.activeTabBtn : ""
                }`}
                onClick={() => setSelectedDay("all")}
              >
                <span>Programação Completa</span>
              </button>
              {scheduleData.map((d) => (
                <button
                  key={d.dayId}
                  type="button"
                  role="tab"
                  aria-selected={selectedDay === d.dayId}
                  className={`${styles.tabBtn} ${
                    selectedDay === d.dayId ? styles.activeTabBtn : ""
                  }`}
                  onClick={() => setSelectedDay(d.dayId)}
                >
                  <span className={styles.tabDateBadge}>{d.dateNum}/10</span>
                  <span className={styles.tabWeekName}>{d.weekDay}</span>
                </button>
              ))}
            </div>

            {/* Schedule Cards */}
            <div className={styles.daysList}>
              {daysToDisplay.map((dayItem) => (
                <div
                  key={dayItem.dayId}
                  className={`${styles.dayCard} ${
                    dayItem.highlight ? styles.padroeiroCard : ""
                  }`}
                >
                  <div className={styles.dayCardHeader}>
                    <div className={styles.dayTitleGroup}>
                      <span className={styles.dayIconCalendar}>📅</span>
                      <h3 className={styles.dayTitleText}>{dayItem.dayLabel}</h3>
                    </div>
                    <span className={styles.dayStatusBadge}>{dayItem.badge}</span>
                  </div>

                  <div className={styles.eventsStack}>
                    {dayItem.events.map((evt, idx) => (
                      <div
                        key={idx}
                        className={`${styles.eventItem} ${
                          evt.special ? styles.specialEventItem : ""
                        }`}
                      >
                        <div className={styles.eventTimeCol}>
                          <span className={styles.eventEmoji}>{evt.icon}</span>
                          <span
                            className={
                              evt.special
                                ? styles.specialTimeBadge
                                : styles.standardTimeBadge
                            }
                          >
                            {evt.time}
                          </span>
                        </div>
                        <div className={styles.eventTextCol}>
                          <strong className={styles.eventTitle}>
                            {evt.title}
                          </strong>
                          {evt.desc && (
                            <p className={styles.eventDesc}>{evt.desc}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Food Notice Banner */}
            <div className={styles.foodNoticeCard}>
              <span className={styles.foodNoticeIcon}>🍲</span>
              <div className={styles.foodNoticeContent}>
                <p className={styles.foodNoticeTitle}>
                  Todas as noites haverá venda de comidas típicas
                </p>
                <p className={styles.foodNoticeSub}>
                  Comidas saborosas, caldos, doces e refrigerantes no espaço
                  social para confraternização de toda a comunidade.
                </p>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className={styles.clergySignature}>
              <div className={styles.communityName}>
                Comunidade São Judas Tadeu
              </div>
              <div className={styles.priestsNames}>
                Pe. Rafael Lucas e Pe. Roberto Vicente
              </div>
              <div className={styles.dioceseLine}>
                Diocese de Sete Lagoas • Minas Gerais
              </div>
            </div>

            {/* Actions: WhatsApp & Location */}
            <div className={styles.actionsBar}>
              <a
                href="https://wa.me/553137141018?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20Tr%C3%ADduo%20e%20Festa%20de%20S%C3%A3o%20Judas%20Tadeu."
                target="_blank"
                rel="noreferrer"
                className={styles.whatsappBtn}
              >
                <span>📱 Fale com a Paróquia no WhatsApp</span>
              </a>
              <button
                type="button"
                className={styles.viewPosterBtn}
                onClick={() => setIsModalOpen(true)}
              >
                <span>🖼️ Ver Cartaz Completo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal for Official Poster */}
      {isModalOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>
                Cartaz Oficial • Tríduo de São Judas Tadeu (2026)
              </span>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsModalOpen(false)}
                aria-label="Fechar visualizador"
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <img
                src="/images/sao-judas-cartaz.jpg"
                alt="Cartaz Oficial Completo de São Judas Tadeu"
                className={styles.modalImg}
              />
            </div>
            <div className={styles.modalFooter}>
              <a
                href="/images/sao-judas-cartaz.jpg"
                download="triduo-sao-judas-tadeu-2026.jpg"
                className={styles.downloadLink}
              >
                ⬇ Baixar Imagem do Cartaz
              </a>
              <button
                type="button"
                className={styles.modalCloseLink}
                onClick={() => setIsModalOpen(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
