import { useMemo, useState } from "react";
import QRCode from "qrcode";
import { generatePixPayload } from "../../utils/pix";

const DONATION_STORAGE_KEY = "paroquia-doacoes-v1";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";

export default function PixSection({ siteData }) {
  const [selectedValue, setSelectedValue] = useState("10");
  const [customValue, setCustomValue] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [payload, setPayload] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [statusMessage, setStatusMessage] = useState("Escolha um valor para gerar o PIX.");
  const [isLoading, setIsLoading] = useState(false);

  const recebedorName = useMemo(() => siteData?.name || "PAROQUIA", [siteData?.name]);
  const pixConfig = useMemo(
    () => ({
      key: siteData?.pix?.key || "",
      city: siteData?.pix?.city || "PARAOPEBA",
    }),
    [siteData?.pix?.city, siteData?.pix?.key],
  );

  async function requestPixPayload(rawValue) {
    try {
      const response = await fetch(`${BACKEND_URL}/site/pix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor: rawValue }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.payload) {
          return data.payload;
        }
      }
    } catch {
      // Fallback local quando o backend estiver indisponível.
    }

    if (!pixConfig.key) {
      throw new Error("Chave PIX não configurada.");
    }

    return generatePixPayload({
      chave: pixConfig.key,
      nome: recebedorName,
      cidade: pixConfig.city,
      valor: rawValue,
    });
  }

  function formatarTelefone(value) {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 2) {
      return digits ? `(${digits}` : "";
    }

    if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }

  async function gerarPix() {
    const rawValue = customValue.trim() || selectedValue;

    if (!rawValue) {
      setStatusMessage("Informe um valor para gerar o PIX.");
      return;
    }

    if (!donorName.trim() || !donorPhone.trim()) {
      setStatusMessage("Informe seu nome e telefone para registrar a doação.");
      return;
    }

    setIsLoading(true);
    setStatusMessage("Gerando código PIX...");

    try {
      const generatedPayload = await requestPixPayload(rawValue);

      const qrCodeUrl = await QRCode.toDataURL(generatedPayload, {
        width: 240,
        margin: 1,
        color: {
          dark: "#0b2545",
          light: "#ffffff",
        },
      });

      setPayload(generatedPayload);
      setQrCodeDataUrl(qrCodeUrl);

      const donations = JSON.parse(localStorage.getItem(DONATION_STORAGE_KEY) || "[]");
      donations.unshift({
        id: Date.now(),
        name: donorName.trim(),
        phone: donorPhone.trim(),
        value: `R$ ${Number(rawValue).toFixed(2).replace('.', ',')}`,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(DONATION_STORAGE_KEY, JSON.stringify(donations.slice(0, 50)));

      setStatusMessage("PIX pronto para pagamento. Sua doação foi registrada para a secretaria.");
    } catch (error) {
      setPayload("");
      setQrCodeDataUrl("");
      setStatusMessage(error.message || "Não foi possível gerar o PIX.");
    } finally {
      setIsLoading(false);
    }
  }

  async function copiarPix() {
    if (!payload) {
      setStatusMessage("Gere o PIX antes de copiar o texto.");
      return;
    }

    try {
      await navigator.clipboard.writeText(payload);
      setStatusMessage("Texto PIX copiado para a área de transferência.");
    } catch {
      setStatusMessage("Não foi possível copiar automaticamente. Copie o conteúdo manualmente.");
    }
  }

  return (
    <section className="pix-section card">
      <div className="pix-section-header">
        <div className="pix-section-title-wrap">
          <p className="section-tag">Doação</p>
          <h2>Contribua com a paróquia</h2>
        </div>
        <p className="pix-section-text">
          Escolha o valor da sua doação e gere o pagamento via PIX de forma rápida, segura e prática.
        </p>
      </div>

      <div className="pix-highlight">
        <div className="pix-controls">
          <label className="pix-field">
            <span>Valor da doação</span>
            <select value={selectedValue} onChange={(event) => setSelectedValue(event.target.value)}>
              <option value="10">R$ 10,00</option>
              <option value="20">R$ 20,00</option>
              <option value="50">R$ 50,00</option>
              <option value="100">R$ 100,00</option>
            </select>
          </label>

          <label className="pix-field">
            <span>Ou informe outro valor</span>
            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="Ex.: 15"
              value={customValue}
              onChange={(event) => setCustomValue(event.target.value)}
            />
          </label>

          <label className="pix-field">
            <span>Seu nome</span>
            <input
              type="text"
              placeholder="Ex.: Maria Silva"
              value={donorName}
              onChange={(event) => setDonorName(event.target.value)}
            />
          </label>

          <label className="pix-field">
            <span>Número de telefone</span>
            <input
              type="tel"
              id="donorPhone"
              value={donorPhone}
              placeholder="(31) 99999-9999"
              onChange={(e) => setDonorPhone(formatarTelefone(e.target.value))}
              required
            />
          </label>

          <button type="button" className="btn-primary pix-button" onClick={gerarPix} disabled={isLoading}>
            {isLoading ? "Gerando..." : "Gerar PIX"}
          </button>
        </div>
      </div>

      <div className="pix-result" role="status">
        <div className="pix-qr-wrapper">
          {qrCodeDataUrl ? (
            <img src={qrCodeDataUrl} alt="QR Code PIX" className="pix-qr" />
          ) : (
            <div className="pix-qr-placeholder">QR Code</div>
          )}
        </div>

        <div className="pix-copy-area">
          <p className="pix-copy-title">Seu pagamento está pronto</p>
          <p className="pix-copy-description">
            Clique no botão abaixo para copiar o código PIX automaticamente e realizar o pagamento.
          </p>
          <button type="button" className="btn-secondary pix-copy-button" onClick={copiarPix}>
            Copiar código PIX
          </button>
        </div>
      </div>

      <p className="pix-status">{statusMessage}</p>
    </section>
  );
}
