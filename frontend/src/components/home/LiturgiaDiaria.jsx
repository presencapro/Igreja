// src/components/home/LiturgiaDiaria.jsx
import { useState, useEffect } from "react";
import { getLiturgia } from "../../api/liturgiaService";
import "./LiturgiaDiaria.css";

// Formata data local como "YYYY-MM-DD" sem converter para UTC (evita dia anterior no Brasil)
const formatLocalDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function LiturgiaDiaria() {
  const [date, setDate] = useState(() => new Date());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLiturgia = async (targetDate) => {
    setLoading(true);
    setError(null);
    try {
      const lit = await getLiturgia(targetDate);
      setData(lit);
    } catch (e) {
      console.error("Erro ao carregar liturgia:", e);
      setError("Não foi possível carregar a Liturgia Diária neste momento. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiturgia(date);
  }, [date]);

  const formatDisplayDate = (d) => {
    return d.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
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

  // Normalização de leituras (compatível com arrays ou objetos)
  const primeiraLeitura = Array.isArray(data?.leituras?.primeiraLeitura)
    ? data.leituras.primeiraLeitura[0]
    : data?.primeira_leitura;

  const salmo = Array.isArray(data?.leituras?.salmo)
    ? data.leituras.salmo[0]
    : data?.salmo_responsorial;

  const segundaLeitura = Array.isArray(data?.leituras?.segundaLeitura) && data.leituras.segundaLeitura.length > 0
    ? data.leituras.segundaLeitura[0]
    : data?.segunda_leitura;

  const evangelho = Array.isArray(data?.leituras?.evangelho)
    ? data.leituras.evangelho[0]
    : data?.evangelho;

  const corLiturgica = data?.cor || "Verde";
  const corClass = `cor-${corLiturgica.replace(/\s+/g, '')}`;

  return (
    <section className="liturgia-card" id="liturgia">
      <div className="liturgia-header">
        <div className="liturgia-title-group">
          <h2>📖 Liturgia Diária</h2>
          <p className="liturgia-celebracao">
            {data?.liturgia || data?.nome || "Celebração do Dia"}
          </p>
          <p className="liturgia-date-display">{formatDisplayDate(date)}</p>
        </div>
        <div className="liturgia-badges">
          <span className={`cor-liturgica-badge ${corClass}`}>
            ● Cor: {corLiturgica}
          </span>
        </div>
      </div>

      <div className="liturgia-nav-bar">
        <div className="date-controls">
          <button className="date-btn" onClick={() => changeDate(-1)} aria-label="Dia anterior">
            ← Anterior
          </button>
          <button className="date-btn" onClick={onToday}>
            Hoje
          </button>
          <button className="date-btn" onClick={() => changeDate(1)} aria-label="Próximo dia">
            Próximo →
          </button>
        </div>
        <div className="date-picker-group">
          <label className="date-picker-label" htmlFor="liturgia-date-input">
            📅 Escolher data
          </label>
          <input
            type="date"
            id="liturgia-date-input"
            className="date-input"
            value={formatLocalDate(date)}
            onChange={onInputChange}
            aria-label="Escolher data"
          />
        </div>
      </div>

      {loading && (
        <div className="liturgia-skeleton" aria-live="polite">
          <div className="liturgia-skeleton-block liturgia-skeleton-h1" />
          <p className="liturgia-loading-text">Carregando a Liturgia do Dia...</p>
          <div className="liturgia-skeleton-block liturgia-skeleton-card" />
          <div className="liturgia-skeleton-block liturgia-skeleton-card liturgia-skeleton-short" />
        </div>
      )}

      {error && (
        <div className="state-container error">
          <p>{error}</p>
          <button className="date-btn" style={{ marginTop: "1rem" }} onClick={() => fetchLiturgia(date)}>
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <div className="liturgia-body">
          {/* Antífona de Entrada se houver */}
          {data?.antifonas?.entrada && (
            <div className="reading-card" style={{ borderLeftColor: "var(--muted, #5e6b7a)" }}>
              <h3>Antífona de Entrada</h3>
              <p className="reading-text">{data.antifonas.entrada}</p>
            </div>
          )}

          {/* Primeira Leitura */}
          {primeiraLeitura && (
            <article className="reading-card">
              <h3>
                <span>Primeira Leitura</span>
                {primeiraLeitura.referencia && (
                  <span className="reading-ref">{primeiraLeitura.referencia}</span>
                )}
              </h3>
              {primeiraLeitura.titulo && (
                <p className="reading-title">{primeiraLeitura.titulo}</p>
              )}
              <p className="reading-text">{primeiraLeitura.texto}</p>
            </article>
          )}

          {/* Salmo Responsorial */}
          {salmo && (
            <article className="reading-card">
              <h3>
                <span>Salmo Responsorial</span>
                {salmo.referencia && (
                  <span className="reading-ref">{salmo.referencia}</span>
                )}
              </h3>
              {salmo.refrao && (
                <div className="reading-refrao">
                  <strong>Refrão:</strong> {salmo.refrao}
                </div>
              )}
              <p className="reading-text">{salmo.texto}</p>
            </article>
          )}

          {/* Segunda Leitura (se houver, como em Domingos e Solenidades) */}
          {segundaLeitura && (
            <article className="reading-card">
              <h3>
                <span>Segunda Leitura</span>
                {segundaLeitura.referencia && (
                  <span className="reading-ref">{segundaLeitura.referencia}</span>
                )}
              </h3>
              {segundaLeitura.titulo && (
                <p className="reading-title">{segundaLeitura.titulo}</p>
              )}
              <p className="reading-text">{segundaLeitura.texto}</p>
            </article>
          )}

          {/* Evangelho */}
          {evangelho && (
            <article className="reading-card evangelho-card">
              <h3>
                <span>✝️ Evangelho</span>
                {evangelho.referencia && (
                  <span className="reading-ref">{evangelho.referencia}</span>
                )}
              </h3>
              {evangelho.titulo && (
                <p className="reading-title">{evangelho.titulo}</p>
              )}
              <p className="reading-text">{evangelho.texto}</p>
            </article>
          )}

          {/* Orações */}
          {(data?.oracoes?.coleta || data?.oracoes?.oferendas || data?.oracoes?.comunhao) && (
            <div className="prayers-section" style={{ marginTop: "2rem" }}>
              <h3 style={{ color: "var(--primary, #0b2545)", marginBottom: "0.75rem" }}>
                Orações da Celebração
              </h3>
              <div className="prayers-grid">
                {data.oracoes.coleta && (
                  <div className="prayer-box">
                    <h4>Oração da Coleta</h4>
                    <p>{data.oracoes.coleta}</p>
                  </div>
                )}
                {data.oracoes.oferendas && (
                  <div className="prayer-box">
                    <h4>Sobre as Oferendas</h4>
                    <p>{data.oracoes.oferendas}</p>
                  </div>
                )}
                {data.oracoes.comunhao && (
                  <div className="prayer-box">
                    <h4>Depois da Comunhão</h4>
                    <p>{data.oracoes.comunhao}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
