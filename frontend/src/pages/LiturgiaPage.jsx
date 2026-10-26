// src/pages/LiturgiaPage.jsx
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import LiturgiaDiaria from "../components/home/LiturgiaDiaria";
import SantoDoDia from "../components/home/SantoDoDia";
import { getSantoDoDia } from "../api/santoService";
import "./LiturgiaPage.css";

const formatLocalDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

function parseInitialDate(searchParams) {
  // 1. Suporte ao formato Canção Nova: ?sDia=29&sMes=10&sAno=2026
  const sDia = searchParams.get("sDia");
  const sMes = searchParams.get("sMes");
  const sAno = searchParams.get("sAno");
  if (sDia && sMes) {
    const y = sAno ? parseInt(sAno, 10) : new Date().getFullYear();
    const m = parseInt(sMes, 10) - 1;
    const d = parseInt(sDia, 10);
    return new Date(y, m, d);
  }

  // 2. Suporte ao formato ?date=YYYY-MM-DD ou ?date=DD/MM/YYYY
  const paramDate = searchParams.get("date");
  if (paramDate) {
    if (paramDate.includes("-")) {
      const parts = paramDate.split("-");
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      }
    } else if (paramDate.includes("/")) {
      const parts = paramDate.split("/");
      if (parts.length >= 2) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parts[2] ? parseInt(parts[2], 10) : new Date().getFullYear();
        return new Date(y, m, d);
      }
    }
  }

  return new Date();
}

function parseInitialTab(searchParams) {
  const tab = searchParams.get("tab");
  if (tab === "santo" || tab === "liturgia" || tab === "ambos") {
    return tab;
  }
  // Se veio com sDia na URL, prioriza a aba do Santo do Dia
  if (searchParams.get("sDia")) {
    return "santo";
  }
  return "liturgia";
}

export default function LiturgiaPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [date, setDate] = useState(() => parseInitialDate(searchParams));
  const [activeTab, setActiveTab] = useState(() => parseInitialTab(searchParams));
  const [santoNome, setSantoNome] = useState("");

  // Mantém a URL sincronizada com a data e a aba selecionadas
  const updateUrlParams = (newDate, newTab) => {
    const params = new URLSearchParams();
    params.set("date", formatLocalDate(newDate));
    if (newTab && newTab !== "liturgia") {
      params.set("tab", newTab);
    }
    setSearchParams(params, { replace: true });
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    updateUrlParams(date, newTab);
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    updateUrlParams(newDate, activeTab);
  };

  // Busca o nome do santo para exibir na prévia da Liturgia
  useEffect(() => {
    let isCancelled = false;
    getSantoDoDia(date)
      .then((res) => {
        if (isCancelled) return;
        const list = Array.isArray(res) ? res : res?.results ? res.results : [res];
        const primeiro = list.filter(Boolean)[0];
        setSantoNome(primeiro?.nome || "");
      })
      .catch(() => {
        if (!isCancelled) setSantoNome("");
      });

    return () => {
      isCancelled = true;
    };
  }, [date]);

  const changeDate = (offset) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + offset);
    handleDateChange(newDate);
  };

  const onToday = () => handleDateChange(new Date());

  const onInputChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const parts = val.split("-");
    if (parts.length === 3) {
      const newD = new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10)
      );
      handleDateChange(newD);
    }
  };

  return (
    <div className="liturgia-page-container">
      {/* Barra de Abas e Seletor de Data Centralizado */}
      <div className="liturgia-unified-header">
        <div className="liturgia-tabs-bar" role="tablist" aria-label="Navegação Litúrgica">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "liturgia"}
            className={`liturgia-tab-btn ${activeTab === "liturgia" ? "active" : ""}`}
            onClick={() => handleTabChange("liturgia")}
          >
            📖 Liturgia Diária
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "santo"}
            className={`liturgia-tab-btn ${activeTab === "santo" ? "active" : ""}`}
            onClick={() => handleTabChange("santo")}
          >
            ✝️ Santo do Dia
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "ambos"}
            className={`liturgia-tab-btn ${activeTab === "ambos" ? "active" : ""}`}
            onClick={() => handleTabChange("ambos")}
          >
            📑 Ver Ambos Juntos
          </button>
        </div>

        <div className="liturgia-unified-nav">
          <div className="date-controls">
            <button
              type="button"
              className="date-btn"
              onClick={() => changeDate(-1)}
              aria-label="Dia anterior"
            >
              ← Anterior
            </button>
            <button
              type="button"
              className="date-btn"
              onClick={onToday}
              aria-label="Ir para Hoje"
            >
              📅 Hoje
            </button>
            <button
              type="button"
              className="date-btn"
              onClick={() => changeDate(1)}
              aria-label="Próximo dia"
            >
              Próximo →
            </button>
          </div>

          <div className="date-picker-group">
            <label className="date-picker-label" htmlFor="unified-date-input">
              Data:
            </label>
            <input
              type="date"
              id="unified-date-input"
              className="date-input"
              value={formatLocalDate(date)}
              onChange={onInputChange}
              aria-label="Escolher data"
            />
          </div>
        </div>
      </div>

      {/* Conteúdo Conforme a Aba Ativa */}
      <div className="liturgia-content-area">
        {(activeTab === "liturgia" || activeTab === "ambos") && (
          <LiturgiaDiaria
            date={date}
            setDate={handleDateChange}
            hideNavBar={true}
            onOpenSanto={() => handleTabChange("santo")}
            santoName={santoNome}
          />
        )}

        {(activeTab === "santo" || activeTab === "ambos") && (
          <SantoDoDia
            date={date}
            setDate={handleDateChange}
            hideNavBar={true}
            onOpenLiturgia={() => handleTabChange("liturgia")}
          />
        )}
      </div>
    </div>
  );
}
