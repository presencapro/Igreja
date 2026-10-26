// src/components/home/SantoDoDia.jsx
import { useState, useEffect } from "react";
import { getSantoDoDia, formatCacheKey } from "../../api/santoService";
import SaintImage from "./SaintImage";
import "./SantoDoDia.css";

export default function SantoDoDia({
  date: propDate,
  setDate: propSetDate,
  hideNavBar = false,
  onOpenLiturgia = null
}) {
  const [internalDate, setInternalDate] = useState(() => new Date());
  const date = propDate ?? internalDate;
  const setDate = propSetDate ?? setInternalDate;

  const [santos, setSantos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSanto, setSelectedSanto] = useState(null);
  const [shareLabel, setShareLabel] = useState("📲 Compartilhar");

  const fetchSanto = async (targetDate) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSantoDoDia(targetDate);
      const list = Array.isArray(res) ? res : res?.results ? res.results : [res];
      setSantos(list.filter(Boolean));
    } catch (e) {
      console.error("Erro ao carregar Santo do Dia:", e);
      setError("Não foi possível carregar o Santo do Dia.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSanto(date);
  }, [date]);

  const openModal = (santo) => {
    setSelectedSanto(santo);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedSanto(null);
  };

  const changeDate = (offset) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + offset);
    setDate(newDate);
  };

  const onToday = () => setDate(new Date());

  const onInputChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const parts = val.split("-");
    if (parts.length === 3) {
      const newD = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      setDate(newD);
    }
  };

  const handleShare = async (santo) => {
    const shareData = {
      title: `✝️ Santo do Dia — ${santo.nome || ""}`,
      text: "✝️ Santo do Dia\nConheça o Santo do Dia e a Liturgia Diária da nossa igreja.",
      url: `${window.location.origin}/liturgia`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      // Fallback: copia o link para a área de transferência
      const link = `${shareData.text}\n${shareData.url}`;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
        setShareLabel("✅ Link copiado!");
        setTimeout(() => setShareLabel("📲 Compartilhar"), 2000);
      } else {
        setShareLabel("✝️ Santo do Dia");
        setTimeout(() => setShareLabel("📲 Compartilhar"), 2000);
      }
    } catch (e) {
      // Usuário cancelou o compartilhamento — sem erro visível
    }
  };

  return (
    <section className="santo-section-card" id="santo">
      <div className="santo-header">
        <h2>✝️ Santo do Dia</h2>
        <p className="santo-subtitle">
          Exemplos de santidade, oração e intercessores para a nossa vida cristã
        </p>
      </div>

      {!hideNavBar && (
        <div className="liturgia-nav-bar">
          <div className="date-controls">
            <button className="date-btn" onClick={() => changeDate(-1)} aria-label="Dia anterior">
              ← Dia anterior
            </button>
            <button className="date-btn" onClick={onToday} aria-label="Ver Santo de Hoje">
              📅 Hoje
            </button>
            <button className="date-btn" onClick={() => changeDate(1)} aria-label="Dia seguinte">
              Dia seguinte →
            </button>
          </div>
          <input
            type="date"
            className="date-input"
            value={formatCacheKey(date)}
            onChange={onInputChange}
            aria-label="Escolher data do Santo"
          />
        </div>
      )}

      {onOpenLiturgia && (
        <div
          className="santo-switch-banner"
          onClick={onOpenLiturgia}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onOpenLiturgia()}
        >
          <span>📖 Ver leituras e o Evangelho da Liturgia Diária</span>
          <span className="santo-switch-arrow">→</span>
        </div>
      )}

      {loading && (
        <div className="santo-grid" aria-live="polite">
          <article className="santo-card-item santo-skeleton-card">
            <div className="santo-card-header-layout">
              <div className="santo-img-wrapper santo-skeleton santo-skeleton-img" />
              <div className="santo-card-info">
                <span className="santo-skeleton santo-skeleton-badge" />
                <span className="santo-skeleton santo-skeleton-title" />
                <span className="santo-skeleton santo-skeleton-line" />
                <span className="santo-skeleton santo-skeleton-line santo-skeleton-line-short" />
              </div>
            </div>
            <p className="santo-loading-text">Carregando o Santo do Dia...</p>
          </article>
        </div>
      )}

      {error && (
        <div className="state-container error">
          <p>{error}</p>
          <button className="date-btn" style={{ marginTop: "1rem" }} onClick={() => fetchSanto(date)}>
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && santos.length > 0 && (
        <div className="santo-grid">
          {santos.map((santo, idx) => {
            return (
              <article key={idx} className="santo-card-item">
                <div className="santo-card-header-layout">
                  <div className="santo-img-wrapper">
                    <SaintImage
                      src={santo.imagem}
                      alt={santo.nome || "Santo do Dia"}
                      className="santo-card-img"
                    />
                  </div>

                  <div className="santo-card-info">
                    <span className="santo-badge-tag">{santo.tipo || "Memória Litúrgica"}</span>
                    <h3 className="santo-title-main">{santo.nome}</h3>
                    {(santo.resumo || santo.historia) && (
                      <p className="santo-summary-text">{santo.resumo || santo.historia}</p>
                    )}
                  </div>
                </div>

                {/* Reflexão Direta */}
                {santo.reflexao && (
                  <div className="santo-reflection-card">
                    <h4>💡 Reflexão do Dia</h4>
                    <p>{santo.reflexao}</p>
                  </div>
                )}

                {/* Oração Direta */}
                {santo.oracao && (
                  <div className="santo-prayer-card">
                    <h4>🙏 Oração a {santo.nome}</h4>
                    <p>{santo.oracao}</p>
                  </div>
                )}

                <div className="santo-card-footer">
                  <button
                    type="button"
                    className="santo-btn-secondary"
                    onClick={() => handleShare(santo)}
                  >
                    {shareLabel}
                  </button>
                  <button
                    type="button"
                    className="santo-btn-action"
                    onClick={() => openModal(santo)}
                  >
                    📖 Conheça a história
                  </button>
                </div>

                {santo.fonte && (
                  <p className="santo-source-credit">
                    Fonte:{" "}
                    {santo.url ? (
                      <a href={santo.url} target="_blank" rel="noopener noreferrer">
                        {santo.fonte}
                      </a>
                    ) : (
                      santo.fonte
                    )}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}

      {!loading && !error && santos.length === 0 && (
        <div className="state-container empty-state">
          <p>Nenhuma memória ou comemoração de santo registrada para esta data.</p>
        </div>
      )}

      {modalOpen && selectedSanto && (
        <div className="modal-overlay" onClick={closeModal} role="dialog" aria-modal="true">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal} aria-label="Fechar">
              ✕
            </button>

            <div className="santo-modal-img-wrapper">
              <SaintImage
                src={selectedSanto.imagem}
                alt={selectedSanto.nome || "Santo do Dia"}
                className="santo-modal-img"
              />
            </div>

            <h3 className="modal-santo-title">{selectedSanto.nome}</h3>

            {selectedSanto.historia && (
              <div className="modal-body-section">
                <h4>📖 História</h4>
                <div className="modal-paragraphs">
                  {selectedSanto.historia.split("\n\n").map((paragrafo, pIdx) => (
                    <p key={pIdx} style={{ marginBottom: "0.85rem", lineHeight: "1.65" }}>
                      {paragrafo}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {selectedSanto.reflexao && (
              <div className="modal-body-section">
                <h4>💡 Reflexão</h4>
                <p>{selectedSanto.reflexao}</p>
              </div>
            )}

            {selectedSanto.oracao && (
              <div className="modal-prayer-box">
                <h4>🙏 Oração</h4>
                <p>{selectedSanto.oracao}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
