import { useState, useContext } from "react";
import {
  Settings,
  Phone,
  Calendar,
  Users,
  Link as LinkIcon,
  Megaphone,
  Save,
  RotateCcw,
  LogOut,
  Lock,
  Plus,
  Trash2,
  HandCoins,
  HandHeart,
} from "lucide-react";
import { PastoraisContext } from "../../context/PastoraisContext";

export default function AdminPanel({
  isAuthenticated,
  handleLogin,
  loginForm,
  handleLoginChange,
  authError,
  showAdmin,
  setShowAdmin,
  handleLogout,
  adminTab,
  setAdminTab,
  editor,
  handleEditorChange,
  setEditor,
  saveEditor,
  resetEditor,
  saveStatus,
  saveMessage,
}) {
  const donationStorageKey = "paroquia-doacoes-v1";
  const [donations, setDonations] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      return JSON.parse(localStorage.getItem(donationStorageKey) || "[]");
    } catch {
      return [];
    }
  });

  const pastoraisCtx = useContext(PastoraisContext);
  const [pastoralForm, setPastoralForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    coordinator: "",
    contact: "",
    email: "",
    password: "",
  });
  const [editingPastoral, setEditingPastoral] = useState(null);
  const [pastoralError, setPastoralError] = useState("");
  const [pastoralSuccess, setPastoralSuccess] = useState("");
  const [inscricoesMap, setInscricoesMap] = useState({});
  const [loadingInscricoes, setLoadingInscricoes] = useState(false);

  function handlePastoralFormChange(event) {
    const { name, value } = event.target;
    setPastoralForm((prev) => ({ ...prev, [name]: value }));
    setPastoralError("");
    setPastoralSuccess("");
  }

  function startEditPastoral(p) {
    setEditingPastoral(p);
    setPastoralForm({
      name: p.name || "",
      description: p.description || "",
      imageUrl: p.imageUrl || "",
      coordinator: p.coordinator || "",
      contact: p.contact || "",
      email: p.email || "",
      password: "",
    });
    setPastoralError("");
    setPastoralSuccess("");
  }

  async function submitPastoral(event) {
    event.preventDefault();
    setPastoralError("");
    setPastoralSuccess("");
    if (!pastoralForm.name.trim()) {
      setPastoralError("O nome da pastoral é obrigatório.");
      return;
    }
    try {
      if (editingPastoral) {
        const payload = { ...pastoralForm };
        if (!payload.password) delete payload.password;
        await pastoraisCtx.adminUpdatePastoral(editingPastoral.id, payload);
        setPastoralSuccess("Pastoral atualizada com sucesso!");
      } else {
        if (!pastoralForm.email.trim() || !pastoralForm.password) {
          setPastoralError("Informe e-mail e senha para a pastoral acessar seu painel.");
          return;
        }
        await pastoraisCtx.adminCreatePastoral(pastoralForm);
        setPastoralSuccess("Pastoral criada com sucesso!");
      }
      setEditingPastoral(null);
      setPastoralForm({
        name: "",
        description: "",
        imageUrl: "",
        coordinator: "",
        contact: "",
        email: "",
        password: "",
      });
    } catch (error) {
      setPastoralError(error.message || "Não foi possível salvar a pastoral.");
    }
  }

  function cancelEditPastoral() {
    setEditingPastoral(null);
    setPastoralForm({
      name: "",
      description: "",
      imageUrl: "",
      coordinator: "",
      contact: "",
      email: "",
      password: "",
    });
    setPastoralError("");
    setPastoralSuccess("");
  }

  async function deletePastoral(p) {
    if (!window.confirm(`Excluir a pastoral "${p.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    try {
      await pastoraisCtx.adminDeletePastoral(p.id);
      setPastoralSuccess("Pastoral excluída.");
    } catch (error) {
      setPastoralError(error.message || "Não foi possível excluir.");
    }
  }

  async function toggleInscricoes(p) {
    setLoadingInscricoes(true);
    try {
      const data = await pastoraisCtx.adminListInscricoes(p.id);
      setInscricoesMap((prev) => ({ ...prev, [p.id]: data }));
    } catch (error) {
      setPastoralError(error.message || "Não foi possível carregar as inscrições.");
    } finally {
      setLoadingInscricoes(false);
    }
  }

  const updateMassTime = (index, field, value) => {
    const newMassTimes = [...(editor.massTimes || [])];
    newMassTimes[index] = { ...newMassTimes[index], [field]: value };
    setEditor({ ...editor, massTimes: newMassTimes });
  };
  const removeMassTime = (index) => {
    const newMassTimes = [...(editor.massTimes || [])];
    newMassTimes.splice(index, 1);
    setEditor({ ...editor, massTimes: newMassTimes });
  };
  const addMassTime = () => {
    const newMassTimes = [
      ...(editor.massTimes || []),
      { id: Date.now().toString(), day: "", time: "", location: "" },
    ];
    setEditor({ ...editor, massTimes: newMassTimes });
  };

  const removeDonation = (donationId) => {
    if (typeof window === "undefined") {
      return;
    }

    const updatedDonations = donations.filter((donation) => donation.id !== donationId);
    localStorage.setItem(donationStorageKey, JSON.stringify(updatedDonations));
    setDonations(updatedDonations);
  };

  return (
    <section id="admin" className="admin-panel-section reveal">
      {!isAuthenticated ? (
        <div className="login-card-container">
          <div className="login-card">
            <div className="login-icon-header">
              <Lock size={28} />
            </div>
            <h2>Painel da Secretaria</h2>
            <p className="login-subtitle">
              Identifique-se para gerenciar o conteúdo do site
            </p>
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  placeholder="exemplo@diocesedesetelagoas.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Senha</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  placeholder="Digite sua senha secreta"
                  required
                />
              </div>
              {authError && <p className="auth-error-message">{authError}</p>}
              <button className="btn-login" type="submit">
                Entrar no Sistema
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="admin-dashboard">
          {/* Header Dashboard */}
          <div className="dashboard-header-bar">
            <div>
              <h2>Painel Administrativo</h2>
              <p className="dashboard-subtitle">
                Bem-vindo à secretaria da Paróquia
              </p>
            </div>
            <div className="dashboard-top-actions">
              <button
                className={`btn-toggle-editor ${showAdmin ? "active" : ""}`}
                type="button"
                onClick={() => setShowAdmin((prev) => !prev)}
              >
                {showAdmin ? "Ocultar Painel" : "Exibir Painel"}
              </button>
              <button
                className="btn-admin-logout"
                type="button"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Sair</span>
              </button>
            </div>
          </div>

          {showAdmin && (
            <div className="admin-layout-container">
              {/* Sidebar Navigation */}
              <aside className="admin-sidebar">
                <nav className="admin-sidebar-nav">
                  <button
                    type="button"
                    className={`sidebar-tab-btn ${adminTab === "geral" ? "active" : ""}`}
                    onClick={() => setAdminTab("geral")}
                  >
                    <Settings size={18} />
                    <span>Configurações Gerais</span>
                  </button>
                  <button
                    type="button"
                    className={`sidebar-tab-btn ${adminTab === "contato" ? "active" : ""}`}
                    onClick={() => setAdminTab("contato")}
                  >
                    <Phone size={18} />
                    <span>Secretaria & Contatos</span>
                  </button>
                  <button
                    type="button"
                    className={`sidebar-tab-btn ${adminTab === "celebracoes" ? "active" : ""}`}
                    onClick={() => setAdminTab("celebracoes")}
                  >
                    <Calendar size={18} />
                    <span>Horários & Missas</span>
                  </button>
                  <button
                    type="button"
                    className={`sidebar-tab-btn ${adminTab === "comunidade" ? "active" : ""}`}
                    onClick={() => setAdminTab("comunidade")}
                  >
                    <Users size={18} />
                    <span>Clero & Comunidades</span>
                  </button>
                  <button
                    type="button"
                    className={`sidebar-tab-btn ${adminTab === "links" ? "active" : ""}`}
                    onClick={() => setAdminTab("links")}
                  >
                    <LinkIcon size={18} />
                    <span>Links & Mapas</span>
                  </button>
                  <button
                    type="button"
                    className={`sidebar-tab-btn ${adminTab === "avisos" ? "active" : ""}`}
                    onClick={() => setAdminTab("avisos")}
                  >
                    <Megaphone size={18} />
                    <span>Avisos / Mural</span>
                  </button>
                  <button
                    type="button"
                    className={`sidebar-tab-btn ${adminTab === "doacoes" ? "active" : ""}`}
                    onClick={() => setAdminTab("doacoes")}
                  >
                    <HandCoins size={18} />
                    <span>Doações</span>
                  </button>
                  <button
                    type="button"
                    className={`sidebar-tab-btn ${adminTab === "pastorais" ? "active" : ""}`}
                    onClick={() => setAdminTab("pastorais")}
                  >
                    <HandHeart size={18} />
                    <span>Pastorais e Movimentos</span>
                  </button>
                </nav>
              </aside>

              {/* Main Content Form Card */}
              <div className="admin-content-card">
                <div className="admin-card-header">
                  <h3>
                    {adminTab === "geral" && "Geral"}
                    {adminTab === "contato" && "Secretaria & Contatos"}
                    {adminTab === "celebracoes" && "Horários & Celebrações"}
                    {adminTab === "comunidade" && "Clero & Comunidades"}
                    {adminTab === "links" && "Links & Mapas"}
                    {adminTab === "avisos" && "Avisos / Mural"}
                    {adminTab === "doacoes" && "Doações recebidas"}
                    {adminTab === "pastorais" && "Pastorais e Movimentos"}
                  </h3>
                  <p className="tab-explanation">
                    {adminTab === "geral" &&
                      "Configure o nome principal da paróquia e os textos de destaque da página inicial."}
                    {adminTab === "contato" &&
                      "Mantenha atualizado o telefone de contato, WhatsApp, e-mail, horários de atendimento da secretaria e endereço."}
                    {adminTab === "celebracoes" &&
                      "Organize os horários de missas regulares, forania e ano de criação."}
                    {adminTab === "comunidade" &&
                      "Edite a lista de sacerdotes e ministros responsáveis (um por linha) e a descrição rápida de comunidades."}
                    {adminTab === "links" &&
                      "Atualize os links oficiais de redes sociais da diocese, posts incorporados e o link do Google Maps."}
                    {adminTab === "avisos" &&
                      "Escreva avisos e comunicados (um por linha) que aparecerão em destaque dourado imediatamente acima do calendário de celebrações."}
                    {adminTab === "doacoes" &&
                      "Veja as doações registradas pelos fiéis com nome, telefone e valor."}
                    {adminTab === "pastorais" &&
                      "Crie e gerencie as pastorais e movimentos. Cada pastoral recebe e-mail e senha próprios para publicar seu blog e acompanhar as inscrições."}
                  </p>
                </div>

                <div className="admin-fields-grid">
                  {adminTab === "geral" && (
                    <div className="admin-fields-stack">
                      <div className="form-group-admin">
                        <label>Nome da Paróquia</label>
                        <input
                          name="name"
                          value={editor.name || ""}
                          onChange={handleEditorChange}
                          placeholder="Ex: Paróquia Nossa Senhora do Carmo"
                        />
                        <span className="field-hint">
                          Exibido no cabeçalho, rodapé e títulos principais.
                        </span>
                      </div>
                      <div className="form-group-admin">
                        <label>Título Principal do Site (Hero)</label>
                        <input
                          name="heroTitle"
                          value={editor.heroTitle || ""}
                          onChange={handleEditorChange}
                          placeholder="Ex: Paróquia Nossa Senhora do Carmo - Paraopeba"
                        />
                        <span className="field-hint">
                          O texto principal com letras garrafais no topo da página.
                        </span>
                      </div>
                      <div className="form-group-admin">
                        <label>Subtítulo de Introdução (Hero)</label>
                        <textarea
                          name="heroText"
                          value={editor.heroText || ""}
                          onChange={handleEditorChange}
                          placeholder="Escreva um breve resumo..."
                          rows="3"
                        />
                        <span className="field-hint">
                          Breve resumo explicativo logo abaixo do título do topo.
                        </span>
                      </div>
                    </div>
                  )}

                  {adminTab === "contato" && (
                    <div className="admin-fields-stack">
                      <div className="admin-fields-row">
                        <div className="form-group-admin">
                          <label>Telefone / Celular</label>
                          <input
                            name="phone"
                            value={editor.phone || ""}
                            onChange={handleEditorChange}
                            placeholder="(31) 3714-1018"
                          />
                          <span className="field-hint">
                            Usado nos links de clique para chamada e WhatsApp.
                          </span>
                        </div>
                        <div className="form-group-admin">
                          <label>E-mail</label>
                          <input
                            name="email"
                            value={editor.email || ""}
                            onChange={handleEditorChange}
                            placeholder="paroquia@diocesis.com"
                          />
                        </div>
                      </div>
                      <div className="admin-fields-row">
                        <div className="form-group-admin">
                          <label>Horário de Atendimento da Secretaria</label>
                          <input
                            name="officeHours"
                            value={editor.officeHours || ""}
                            onChange={handleEditorChange}
                            placeholder="Segunda a Sexta: 08h às 12h e 13h às 17h"
                          />
                        </div>
                        <div className="form-group-admin">
                          <label>Responsável / Secretária(o)</label>
                          <input
                            name="secretary"
                            value={editor.secretary || ""}
                            onChange={handleEditorChange}
                            placeholder="Nome do secretário(a) paroquial"
                          />
                        </div>
                      </div>
                      <div className="admin-fields-row">
                        <div className="form-group-admin" style={{ flex: 2 }}>
                          <label>Endereço Completo</label>
                          <input
                            name="address"
                            value={editor.address || ""}
                            onChange={handleEditorChange}
                            placeholder="Rua, Número, Bairro, Cidade"
                          />
                        </div>
                        <div className="form-group-admin" style={{ flex: 1 }}>
                          <label>CEP</label>
                          <input
                            name="zipCode"
                            value={editor.zipCode || ""}
                            onChange={handleEditorChange}
                            placeholder="35774-000"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {adminTab === "celebracoes" && (
                    <div className="admin-fields-stack">
                      <div className="form-group-admin">
                        <label>Subtítulo do Calendário</label>
                        <input
                          name="celebrationsNote"
                          value={editor.celebrationsNote || ""}
                          onChange={handleEditorChange}
                          placeholder="Texto que convida a interagir com o calendário"
                        />
                      </div>
                      <div className="mass-times-management-card">
                        <div className="mass-times-header">
                          <h4>Horários Regulares das Missas</h4>
                          <button
                            type="button"
                            onClick={addMassTime}
                            className="btn-add-regular-time"
                          >
                            <Plus size={16} />
                            <span>Adicionar Horário</span>
                          </button>
                        </div>
                        <div className="mass-times-table-container">
                          {(editor.massTimes || []).length === 0 ? (
                            <div className="empty-mass-times">
                              Nenhum horário cadastrado. Clique em Adicionar.
                            </div>
                          ) : (
                            <div className="mass-times-list">
                              {(editor.massTimes || []).map((mt, index) => (
                                <div key={index} className="mass-time-item">
                                  <div className="mass-time-field">
                                    <input
                                      value={mt.day || ""}
                                      onChange={(e) =>
                                        updateMassTime(index, "day", e.target.value)
                                      }
                                      placeholder="Ex: Domingo, 1° Sexta"
                                      className="inline-input"
                                    />
                                  </div>
                                  <div className="mass-time-field">
                                    <input
                                      value={mt.time || ""}
                                      onChange={(e) =>
                                        updateMassTime(index, "time", e.target.value)
                                      }
                                      placeholder="Ex: 19:30"
                                      className="inline-input"
                                    />
                                  </div>
                                  <div className="mass-time-field mass-time-field-wide">
                                    <input
                                      value={mt.location || ""}
                                      onChange={(e) =>
                                        updateMassTime(index, "location", e.target.value)
                                      }
                                      placeholder="Ex: Matriz"
                                      className="inline-input"
                                    />
                                  </div>
                                  <div className="mass-time-actions">
                                    <button
                                      type="button"
                                      onClick={() => removeMassTime(index)}
                                      className="btn-remove-time"
                                      title="Remover este horário"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="admin-fields-row">
                        <div className="form-group-admin">
                          <label>Forania</label>
                          <input
                            name="forania"
                            value={editor.forania || ""}
                            onChange={handleEditorChange}
                            placeholder="Nome da Forania da Diocese"
                          />
                        </div>
                        <div className="form-group-admin">
                          <label>Ano de Fundação / Criação</label>
                          <input
                            name="foundedYear"
                            value={editor.foundedYear || ""}
                            onChange={handleEditorChange}
                            placeholder="Ex: 1840"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {adminTab === "comunidade" && (
                    <div className="admin-fields-stack">
                      <div className="form-group-admin">
                        <label>Clero e Padres Responsáveis (um por linha)</label>
                        <textarea
                          name="clergyText"
                          value={editor.clergyText || ""}
                          onChange={handleEditorChange}
                          placeholder="Sacerdotes da paróquia..."
                          rows="5"
                        />
                        <span className="field-hint">
                          Insira o nome completo de cada sacerdote por linha. Use parênteses para especificar cargos como (Pe.), (Vigário), etc.
                        </span>
                      </div>
                      <div className="form-group-admin">
                        <label>Resumo/Lista de Comunidades Atendidas</label>
                        <textarea
                          name="communitiesShort"
                          value={editor.communitiesShort || ""}
                          onChange={handleEditorChange}
                          placeholder="Lista de igrejas capelas e comunidades atendidas..."
                          rows="4"
                        />
                        <span className="field-hint">
                          Breve texto sobre as comunidades e distritos pertencentes à paróquia.
                        </span>
                      </div>
                    </div>
                  )}

                  {adminTab === "links" && (
                    <div className="admin-fields-stack">
                      <div className="form-group-admin">
                        <label>Link da Página Oficial na Diocese</label>
                        <input
                          name="diocesePage"
                          value={editor.diocesePage || ""}
                          onChange={handleEditorChange}
                          placeholder="https://diocesedesetelagoas.com.br/..."
                        />
                      </div>
                      <div className="form-group-admin">
                        <label>Link do Perfil do Instagram</label>
                        <input
                          name="instagramProfile"
                          value={editor.instagramProfile || ""}
                          onChange={handleEditorChange}
                          placeholder="https://www.instagram.com/suaparquia"
                        />
                      </div>
                      <div className="form-group-admin">
                        <label>Link de Incorporação (Embed) do Post do Instagram</label>
                        <input
                          name="instagramPost"
                          value={editor.instagramPost || ""}
                          onChange={handleEditorChange}
                          placeholder="https://www.instagram.com/p/.../embed/"
                        />
                        <span className="field-hint">
                          Cole o link do post com o sufixo &quot;/embed/&quot; para exibir a pré-visualização.
                        </span>
                      </div>
                      <div className="form-group-admin">
                        <label>Link de Incorporação (Embed) do Mapa do Google Maps</label>
                        <textarea
                          name="mapEmbed"
                          value={editor.mapEmbed || ""}
                          onChange={handleEditorChange}
                          placeholder="Insira a URL 'src' da tag <iframe> de compartilhamento..."
                          rows="3"
                        />
                        <span className="field-hint">
                          Extraia apenas a URL que fica dentro do atributo src=&quot;...&quot; do código de incorporação do Google Maps.
                        </span>
                      </div>
                    </div>
                  )}

                  {adminTab === "avisos" && (
                    <div className="admin-fields-stack">
                      <div className="form-group-admin">
                        <label>Mural de Avisos Gerais (Um por linha)</label>
                        <textarea
                          name="noticesText"
                          value={editor.noticesText || ""}
                          onChange={handleEditorChange}
                          placeholder="Escreva um aviso por linha..."
                          rows="8"
                        />
                        <span className="field-hint">
                          Cada linha inserida criará um novo item com marcadores de aviso na página pública.
                        </span>
                      </div>
                    </div>
                  )}

                  {adminTab === "pastorais" && (
                    <div className="admin-fields-stack">
                      <div className="mass-times-management-card">
                        <div className="mass-times-header">
                          <h4>
                            {editingPastoral
                              ? `Editar: ${editingPastoral.name}`
                              : "Nova Pastoral / Movimento"}
                          </h4>
                          {editingPastoral && (
                            <button
                              type="button"
                              onClick={cancelEditPastoral}
                              className="btn-toggle-editor"
                            >
                              Cancelar edição
                            </button>
                          )}
                        </div>
                        <form onSubmit={submitPastoral}>
                          <div className="admin-fields-row">
                            <div className="form-group-admin">
                              <label>Nome *</label>
                              <input
                                name="name"
                                value={pastoralForm.name}
                                onChange={handlePastoralFormChange}
                                placeholder="Ex: Pastoral da Criança"
                              />
                            </div>
                            <div className="form-group-admin">
                              <label>Coordenador(a)</label>
                              <input
                                name="coordinator"
                                value={pastoralForm.coordinator}
                                onChange={handlePastoralFormChange}
                                placeholder="Nome do responsável"
                              />
                            </div>
                          </div>
                          <div className="admin-fields-row">
                            <div className="form-group-admin">
                              <label>E-mail de acesso</label>
                              <input
                                name="email"
                                type="email"
                                value={pastoralForm.email}
                                onChange={handlePastoralFormChange}
                                placeholder="pastoral@exemplo.com"
                                required={!editingPastoral}
                              />
                              <span className="field-hint">
                                Usado pela pastoral para entrar no painel.
                              </span>
                            </div>
                            <div className="form-group-admin">
                              <label>{editingPastoral ? "Nova senha (opcional)" : "Senha de acesso"}</label>
                              <input
                                name="password"
                                type="password"
                                value={pastoralForm.password}
                                onChange={handlePastoralFormChange}
                                placeholder={editingPastoral ? "Deixe em branco para manter" : "Senha da pastoral"}
                                required={!editingPastoral}
                              />
                            </div>
                          </div>
                          <div className="admin-fields-row">
                            <div className="form-group-admin">
                              <label>Foto / Imagem (URL)</label>
                              <input
                                name="imageUrl"
                                value={pastoralForm.imageUrl}
                                onChange={handlePastoralFormChange}
                                placeholder="https://exemplo.com/foto.jpg"
                              />
                            </div>
                            <div className="form-group-admin">
                              <label>Contato / WhatsApp</label>
                              <input
                                name="contact"
                                value={pastoralForm.contact}
                                onChange={handlePastoralFormChange}
                                placeholder="(31) 99999-9999"
                              />
                            </div>
                          </div>
                          <div className="form-group-admin">
                            <label>Descrição / Sobre a pastoral</label>
                            <textarea
                              name="description"
                              rows="3"
                              value={pastoralForm.description}
                              onChange={handlePastoralFormChange}
                              placeholder="Conte um pouco sobre a pastoral, encontros, horários..."
                            />
                          </div>
                          {pastoralError && (
                            <div className="save-message-alert alert-error">{pastoralError}</div>
                          )}
                          {pastoralSuccess && (
                            <div className="save-message-alert alert-success">{pastoralSuccess}</div>
                          )}
                          <div className="admin-card-actions" style={{ marginTop: "1rem" }}>
                            <button className="btn-admin-save" type="submit">
                              <Save size={18} />
                              <span>{editingPastoral ? "Salvar alterações" : "Criar pastoral"}</span>
                            </button>
                          </div>
                        </form>
                      </div>

                      <div className="mass-times-management-card">
                        <div className="mass-times-header">
                          <h4>Pastorais cadastradas</h4>
                        </div>
                        {pastoraisCtx.loading ? (
                          <p className="field-hint">Carregando...</p>
                        ) : pastoraisCtx.pastorais.length === 0 ? (
                          <p className="field-hint">Nenhuma pastoral cadastrada ainda.</p>
                        ) : (
                          <div className="mass-times-list">
                            {pastoraisCtx.pastorais.map((p) => (
                              <div key={p.id} className="mass-time-item" style={{ gridTemplateColumns: "minmax(0,1fr) auto auto" }}>
                                <div className="mass-time-field">
                                  <strong>{p.name}</strong>
                                  <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "0.2rem" }}>
                                    {p.coordinator && `Coordenador: ${p.coordinator}`}
                                    {p.contact && ` • ${p.contact}`}
                                    {p.email && ` • ${p.email}`}
                                  </div>
                                  <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                                    {p.postsCount ?? 0} publicação(ões) •{" "}
                                    {p.inscricoesCount ?? 0} inscrição(ões)
                                  </div>
                                </div>
                                <div className="mass-time-actions" style={{ flexDirection: "column", gap: "0.5rem" }}>
                                  <button
                                    type="button"
                                    className="btn-toggle-editor"
                                    onClick={() => toggleInscricoes(p)}
                                    disabled={loadingInscricoes}
                                  >
                                    Inscrições
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-toggle-editor"
                                    onClick={() => startEditPastoral(p)}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-remove-time"
                                    onClick={() => deletePastoral(p)}
                                    title="Excluir pastoral"
                                    style={{ margin: 0 }}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {Object.keys(inscricoesMap).length > 0 && (
                        <div className="mass-times-management-card">
                          <div className="mass-times-header">
                            <h4>Inscrições</h4>
                          </div>
                          {Object.entries(inscricoesMap).map(([pastoralId, list]) => {
                            const p = pastoraisCtx.pastorais.find((x) => x.id === pastoralId);
                            return (
                              <div key={pastoralId} style={{ marginBottom: "1.25rem" }}>
                                <strong style={{ color: "var(--primary)" }}>{p?.name ?? "Pastoral"}</strong>
                                {list.length === 0 ? (
                                  <p className="field-hint">Nenhuma inscrição.</p>
                                ) : (
                                  list.map((i) => (
                                    <div key={i.id} className="donation-item" style={{ marginTop: "0.5rem" }}>
                                      <div>
                                        <strong>{i.name}</strong>
                                        {i.email && <p>{i.email}</p>}
                                        {i.phone && <p>{i.phone}</p>}
                                        {i.message && <p>{i.message}</p>}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {adminTab === "doacoes" && (
                    <div className="admin-fields-stack">
                      <div className="form-group-admin">
                        <div className="donation-header-row">
                          <label>Doações recebidas</label>
                        </div>
                        {donations.length === 0 ? (
                          <p className="field-hint">Ainda não há doações registradas.</p>
                        ) : (
                          <div className="donation-list">
                            {donations.map((donation) => (
                              <div key={donation.id} className="donation-item">
                                <div>
                                  <strong>{donation.name}</strong>
                                  <p>{donation.phone}</p>
                                </div>
                                <div className="donation-item-actions">
                                  <div className="donation-value">{donation.value}</div>
                                  <button
                                    type="button"
                                    className="donation-clear-btn"
                                    onClick={() => removeDonation(donation.id)}
                                    title="Remover doação"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Save & Restore Actions */}
                <div className="admin-card-actions">
                  <button
                    className="btn-admin-save"
                    type="button"
                    onClick={saveEditor}
                  >
                    <Save size={18} />
                    <span>Salvar Alterações</span>
                  </button>
                  <button
                    className="btn-admin-reset"
                    type="button"
                    onClick={resetEditor}
                  >
                    <RotateCcw size={18} />
                    <span>Restaurar Padrão</span>
                  </button>
                </div>

                {saveMessage && (
                  <div
                    className={`save-message-alert ${saveStatus === "success" ? "alert-success" : "alert-error"}`}
                  >
                    {saveMessage}
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
