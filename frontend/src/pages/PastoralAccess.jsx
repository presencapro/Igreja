import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  LogOut,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  UserPlus,
  ArrowLeft,
} from "lucide-react";
import { PastoraisContext } from "../context/PastoraisContext";
import styles from "./Pastorais.module.css";

function PostForm({ initial, onSave, saving, onCancel }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    content: initial?.content || "",
    eventDate: initial?.eventDate || "",
    images: (initial?.images || []).join("\n"),
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const images = form.images
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean);
    onSave({
      title: form.title,
      content: form.content,
      eventDate: form.eventDate,
      images,
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "16px", padding: "1.25rem", marginBottom: "1.5rem" }}>
      <div className={styles.formGroup}>
        <label htmlFor="post-title">Título *</label>
        <input
          id="post-title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Ex: Encontro de formação"
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="post-eventDate">Data do evento</label>
        <input
          id="post-eventDate"
          name="eventDate"
          type="date"
          value={form.eventDate}
          onChange={handleChange}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="post-content">Descrição</label>
        <textarea
          id="post-content"
          name="content"
          rows="4"
          value={form.content}
          onChange={handleChange}
          placeholder="Conte o que aconteceu, horários, local..."
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="post-images">
          <ImageIcon size={14} style={{ verticalAlign: "-2px", marginRight: "0.3rem" }} />
          Links das fotos (uma URL por linha)
        </label>
        <textarea
          id="post-images"
          name="images"
          rows="3"
          value={form.images}
          onChange={handleChange}
          placeholder={"https://exemplo.com/foto1.jpg\nhttps://exemplo.com/foto2.jpg"}
        />
      </div>
      <div className={styles.postActions}>
        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
          <Save size={16} />
          {saving ? "Salvando..." : initial ? "Salvar alterações" : "Publicar"}
        </button>
        {onCancel && (
          <button type="button" className={`${styles.btn} ${styles.btnOutline}`} onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default function PastoralAccess() {
  const {
    currentPastoral,
    loginForm,
    handleLoginChange,
    handleLogin,
    handleLogout,
    authError,
    addPost,
    updatePost,
    deletePost,
    deleteInscricao,
    refreshMe,
    saveStatus,
    saveMessage,
    setSave,
  } = useContext(PastoraisContext);

  const [editingPost, setEditingPost] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSavePost(payload) {
    setSaving(true);
    try {
      if (editingPost) {
        await updatePost(editingPost.id, payload);
        setSave("success", "Post atualizado com sucesso!");
      } else {
        await addPost(payload);
        setSave("success", "Post publicado com sucesso!");
      }
      setEditingPost(null);
      await refreshMe();
    } catch (error) {
      setSave("error", error.message || "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePost(postId) {
    if (!window.confirm("Excluir esta publicação?")) return;
    try {
      await deletePost(postId);
      setSave("success", "Publicação excluída.");
      await refreshMe();
    } catch (error) {
      setSave("error", error.message || "Não foi possível excluir.");
    }
  }

  async function handleDeleteInscricao(inscricaoId) {
    if (!window.confirm("Excluir esta inscrição?")) return;
    try {
      await deleteInscricao(inscricaoId);
      setSave("success", "Inscrição excluída.");
      await refreshMe();
    } catch (error) {
      setSave("error", error.message || "Não foi possível excluir.");
    }
  }

  if (!currentPastoral) {
    return (
      <div className="container">
        <Link to="/pastorais" className={styles.backLink}>
          <ArrowLeft size={16} /> Voltar para Pastorais
        </Link>
        <div className={styles.accessWrap}>
          <div className={styles.loginCard}>
            <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  margin: "0 auto 1rem",
                  background: "var(--bg)",
                  color: "var(--primary)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid var(--border)",
                }}
              >
                <Lock size={28} />
              </div>
              <h2>Acesso da Pastoral</h2>
              <p className={styles.loginSubtitle}>
                Identifique-se com o e-mail e senha da sua pastoral para gerenciar
                o blog e as inscrições.
              </p>
            </div>
            <form onSubmit={handleLogin}>
              <div className={styles.formGroup}>
                <label htmlFor="pemail">E-mail</label>
                <input
                  id="pemail"
                  name="email"
                  type="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  placeholder="pastoral@exemplo.com"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="ppassword">Senha</label>
                <input
                  id="ppassword"
                  name="password"
                  type="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  placeholder="Digite sua senha"
                  required
                />
              </div>
              {authError && <p className={styles.authError}>{authError}</p>}
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: "100%", justifyContent: "center" }}>
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const posts = currentPastoral.posts || [];
  const inscricoes = currentPastoral.inscricoes || [];

  return (
    <div className="container">
      <Link to="/pastorais" className={styles.backLink}>
        <ArrowLeft size={16} /> Voltar para Pastorais
      </Link>

      <div className={styles.accessWrap}>
        <div className={styles.dashHeader}>
          <div>
            <h2>{currentPastoral.name}</h2>
            <p className={styles.loginSubtitle} style={{ marginBottom: 0, textAlign: "left" }}>
              Painel de gerenciamento da pastoral
            </p>
          </div>
          <button className={`${styles.btn} ${styles.btnOutline}`} onClick={handleLogout}>
            <LogOut size={16} /> Sair
          </button>
        </div>

        {saveMessage && (
          <div className={`${styles.saveMsg} ${saveStatus === "success" ? styles.alertSuccess : styles.alertError}`}>
            {saveMessage}
          </div>
        )}

        <div className={styles.sectionCard}>
          <h2>
            <Plus size={18} style={{ verticalAlign: "-2px", marginRight: "0.35rem" }} />
            {editingPost ? "Editar publicação" : "Nova publicação"}
          </h2>
          {!editingPost && posts.length === 0 && (
            <p className={styles.emptyList}>Nenhuma publicação ainda. Crie a primeira abaixo.</p>
          )}
          <PostForm
            key={editingPost?.id || "new"}
            initial={editingPost}
            onSave={handleSavePost}
            saving={saving}
            onCancel={editingPost ? () => setEditingPost(null) : undefined}
          />
        </div>

        {posts.length > 0 && (
          <div className={styles.sectionCard}>
            <h2>Publicações ({posts.length})</h2>
            {posts.map((post) => (
              <article key={post.id} className={styles.post}>
                <div className={styles.postHeader}>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                  {post.eventDate && <span className={styles.postDate}>{post.eventDate}</span>}
                </div>
                {post.content && <div className={styles.postContent}>{post.content}</div>}
                {post.images && post.images.length > 0 && (
                  <div className={styles.postImages}>
                    {post.images.map((img, idx) => (
                      <img key={idx} src={img} alt={`${post.title} - foto ${idx + 1}`} />
                    ))}
                  </div>
                )}
                <div className={styles.postActions}>
                  <button
                    className={`${styles.btn} ${styles.btnOutline}`}
                    onClick={() => setEditingPost(post)}
                  >
                    Editar
                  </button>
                  <button
                    className={`${styles.btn} ${styles.danger}`}
                    onClick={() => handleDeletePost(post.id)}
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className={styles.sectionCard}>
          <h2>
            <UserPlus size={18} style={{ verticalAlign: "-2px", marginRight: "0.35rem" }} />
            Inscrições recebidas ({inscricoes.length})
          </h2>
          {inscricoes.length === 0 ? (
            <p className={styles.emptyList}>Nenhuma inscrição recebida ainda.</p>
          ) : (
            <div className={styles.inscricaoList}>
              {inscricoes.map((insc) => (
                <div key={insc.id} className={styles.inscricaoItem}>
                  <div>
                    <strong>{insc.name}</strong>
                    {insc.email && <p>{insc.email}</p>}
                    {insc.phone && <p>{insc.phone}</p>}
                    {insc.message && <p>{insc.message}</p>}
                  </div>
                  <button
                    className={`${styles.btn} ${styles.danger}`}
                    onClick={() => handleDeleteInscricao(insc.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
