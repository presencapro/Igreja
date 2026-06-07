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
  addAnnouncement,
  updateAnnouncement,
  removeAnnouncement
}) {
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
    const newMassTimes = [...(editor.massTimes || []), { id: Date.now().toString(), day: "", time: "", location: "" }];
    setEditor({ ...editor, massTimes: newMassTimes });
  };

  return (
    <section id="admin" className="card full admin-card reveal">
      <h2>Administrador</h2>
      {!isAuthenticated ? (
        <form className="admin-grid" onSubmit={handleLogin}>
          <input
            name="user"
            value={loginForm.user}
            onChange={handleLoginChange}
            placeholder="Usuário"
          />
          <input
            name="password"
            type="password"
            value={loginForm.password}
            onChange={handleLoginChange}
            placeholder="Senha"
          />
          {authError && <p className="auth-error">{authError}</p>}
          <div className="admin-actions">
            <button className="btn-primary" type="submit">
              Entrar
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="admin-actions admin-top-actions">
            <button
              className="btn-secondary admin-toggle"
              type="button"
              onClick={() => setShowAdmin((prev) => !prev)}
            >
              {showAdmin
                ? "Fechar painel de edição"
                : "Abrir painel de edição"}
            </button>
            <button className="btn-secondary" type="button" onClick={handleLogout}>
              Sair
            </button>
          </div>

          {showAdmin && (
            <div className="admin-grid">
              <div className="admin-tabs">
                <button
                  type="button"
                  className={`admin-tab ${adminTab === "geral" ? "active" : ""}`}
                  onClick={() => setAdminTab("geral")}
                >
                  Geral
                </button>
                <button
                  type="button"
                  className={`admin-tab ${adminTab === "contato" ? "active" : ""}`}
                  onClick={() => setAdminTab("contato")}
                >
                  Contato
                </button>
                <button
                  type="button"
                  className={`admin-tab ${adminTab === "celebracoes" ? "active" : ""}`}
                  onClick={() => setAdminTab("celebracoes")}
                >
                  Celebrações
                </button>
                <button
                  type="button"
                  className={`admin-tab ${adminTab === "comunidade" ? "active" : ""}`}
                  onClick={() => setAdminTab("comunidade")}
                >
                  Clero e Comunidades
                </button>
                <button
                  type="button"
                  className={`admin-tab ${adminTab === "links" ? "active" : ""}`}
                  onClick={() => setAdminTab("links")}
                >
                  Links
                </button>
                <button
                  type="button"
                  className={`admin-tab ${adminTab === "comunicados" ? "active" : ""}`}
                  onClick={() => setAdminTab("comunicados")}
                >
                  Comunicados
                </button>
                <button
                  type="button"
                  className={`admin-tab ${adminTab === "avisos" ? "active" : ""}`}
                  onClick={() => setAdminTab("avisos")}
                >
                  Avisos
                </button>
              </div>

              {adminTab === "geral" && (
                <>
                  <input
                    name="name"
                    value={editor.name}
                    onChange={handleEditorChange}
                    placeholder="Nome da paróquia"
                  />
                  <input
                    name="heroTitle"
                    value={editor.heroTitle}
                    onChange={handleEditorChange}
                    placeholder="Título principal"
                  />
                  <textarea
                    name="heroText"
                    value={editor.heroText}
                    onChange={handleEditorChange}
                    placeholder="Texto principal"
                    rows="2"
                  />
                </>
              )}

              {adminTab === "contato" && (
                <>
                  <input
                    name="officeHours"
                    value={editor.officeHours}
                    onChange={handleEditorChange}
                    placeholder="Horário da secretaria"
                  />
                  <input
                    name="phone"
                    value={editor.phone}
                    onChange={handleEditorChange}
                    placeholder="Telefone"
                  />
                  <input
                    name="email"
                    value={editor.email}
                    onChange={handleEditorChange}
                    placeholder="E-mail"
                  />
                  <input
                    name="address"
                    value={editor.address}
                    onChange={handleEditorChange}
                    placeholder="Endereço"
                  />
                  <input
                    name="secretary"
                    value={editor.secretary}
                    onChange={handleEditorChange}
                    placeholder="Responsável da secretaria"
                  />
                </>
              )}

              {adminTab === "celebracoes" && (
                <>
                  <input
                    name="celebrationsNote"
                    value={editor.celebrationsNote}
                    onChange={handleEditorChange}
                    placeholder="Texto principal das celebrações"
                  />
                  <textarea
                    name="calendarNotice"
                    value={editor.calendarNotice}
                    onChange={handleEditorChange}
                    placeholder="⚠️ Aviso acima do calendário (ex: Missas suspensas no feriado de 15/06. Deixe em branco para ocultar.)"
                    rows="3"
                    style={{ resize: "vertical" }}
                  />
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '10px' }}>
                    <h4 style={{ marginBottom: '10px' }}>Grade de Horários Base</h4>
                    {(editor.massTimes || []).map((mt, index) => (
                      <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: '5px', marginBottom: '8px' }}>
                        <input value={mt.day} onChange={(e) => updateMassTime(index, 'day', e.target.value)} placeholder="Dia" />
                        <input value={mt.time} onChange={(e) => updateMassTime(index, 'time', e.target.value)} placeholder="08h00" />
                        <input value={mt.location} onChange={(e) => updateMassTime(index, 'location', e.target.value)} placeholder="Local/Igreja" />
                        <button type="button" onClick={() => removeMassTime(index)} style={{ background: '#d24747', color: 'white', border: 'none', borderRadius: '5px', padding: '0 10px', cursor: 'pointer' }}>X</button>
                      </div>
                    ))}
                    <button type="button" onClick={addMassTime} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>+ Adicionar</button>
                  </div>
                  <input
                    name="forania"
                    value={editor.forania}
                    onChange={handleEditorChange}
                    placeholder="Forania"
                  />
                  <input
                    name="foundedYear"
                    value={editor.foundedYear}
                    onChange={handleEditorChange}
                    placeholder="Ano de criação"
                  />
                </>
              )}

              {adminTab === "comunidade" && (
                <>
                  <textarea
                    name="clergyText"
                    value={editor.clergyText}
                    onChange={handleEditorChange}
                    placeholder="Clero (um por linha)"
                    rows="4"
                  />
                  <textarea
                    name="communitiesShort"
                    value={editor.communitiesShort}
                    onChange={handleEditorChange}
                    placeholder="Resumo das comunidades"
                    rows="3"
                  />
                </>
              )}

              {adminTab === "links" && (
                <>
                  <input
                    name="diocesePage"
                    value={editor.diocesePage}
                    onChange={handleEditorChange}
                    placeholder="Link da diocese"
                  />
                  <input
                    name="instagramProfile"
                    value={editor.instagramProfile}
                    onChange={handleEditorChange}
                    placeholder="Link do perfil do Instagram"
                  />
                  <input
                    name="instagramPost"
                    value={editor.instagramPost}
                    onChange={handleEditorChange}
                    placeholder="Link do post (embed)"
                  />
                  <textarea
                    name="mapEmbed"
                    value={editor.mapEmbed}
                    onChange={handleEditorChange}
                    placeholder="Link embed do Google Maps"
                    rows="2"
                  />
                </>
              )}

              {adminTab === "comunicados" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                  <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
                    Cards exibidos <strong>acima do calendário</strong>. Defina título, mensagem, tipo e (opcionalmente) uma data. Deixe título e mensagem vazios para ocultar um card.
                  </p>

                  {(editor.announcements || []).map((a, index) => (
                    <div
                      key={a.id}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid var(--border)",
                        borderRadius: "10px",
                        padding: "0.9rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.55rem",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: "0.85rem", color: "var(--primary)" }}>
                          Comunicado #{index + 1}
                        </strong>
                        <button
                          type="button"
                          onClick={() => removeAnnouncement(a.id)}
                          style={{
                            background: "#d24747",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            padding: "0.3rem 0.7rem",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontWeight: "700",
                          }}
                        >
                          Remover
                        </button>
                      </div>

                      <input
                        value={a.title}
                        onChange={(e) => updateAnnouncement(a.id, "title", e.target.value)}
                        placeholder="Título (ex: Missa em honra a São Sebastião)"
                      />

                      <textarea
                        value={a.message}
                        onChange={(e) => updateAnnouncement(a.id, "message", e.target.value)}
                        placeholder="Mensagem do comunicado"
                        rows="3"
                        style={{ resize: "vertical" }}
                      />

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                        <select
                          value={a.type}
                          onChange={(e) => updateAnnouncement(a.id, "type", e.target.value)}
                          style={{
                            width: "100%",
                            border: "1px solid var(--border)",
                            borderRadius: "10px",
                            padding: "0.7rem 0.75rem",
                            font: "inherit",
                            color: "var(--text)",
                            background: "var(--surface)",
                          }}
                        >
                          <option value="info">Informativo (azul)</option>
                          <option value="warning">Atenção (amarelo)</option>
                          <option value="urgent">Urgente (vermelho)</option>
                        </select>

                        <input
                          type="date"
                          value={a.date || ""}
                          onChange={(e) => updateAnnouncement(a.id, "date", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addAnnouncement}
                    className="btn-secondary"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.88rem", alignSelf: "flex-start" }}
                  >
                    + Adicionar comunicado
                  </button>
                </div>
              )}

              {adminTab === "avisos" && (
                <textarea
                  name="noticesText"
                  value={editor.noticesText}
                  onChange={handleEditorChange}
                  placeholder="Um aviso por linha"
                  rows="6"
                />
              )}

              <div className="admin-actions">
                <button className="btn-primary" type="button" onClick={saveEditor}>
                  Salvar alterações
                </button>
                <button className="btn-secondary" type="button" onClick={resetEditor}>
                  Restaurar padrão
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
