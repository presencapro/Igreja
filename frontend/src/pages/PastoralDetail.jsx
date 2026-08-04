import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, User, Phone, Calendar, UserPlus, CheckCircle2 } from "lucide-react";
import { PastoraisContext } from "../context/PastoraisContext";
import styles from "./Pastorais.module.css";

export default function PastoralDetail() {
  const { id } = useParams();
  const { pastorais, fetchPastoral, createInscricao } = useContext(PastoraisContext);

  const [pastoral, setPastoral] = useState(() => {
    // Usa a lista já carregada como cache imediato — sem tela de loading
    return pastorais.find((p) => p.id === id || p.slug === id) ?? null;
  });
  const [loading, setLoading] = useState(pastoral === null);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");

  useEffect(() => {
    let cancelled = false;

    // Se já temos dados do cache, faz o fetch completo em background
    // para obter posts e dados extras sem bloquear a renderização.
    fetchPastoral(id)
      .then((data) => {
        if (!cancelled) {
          setPastoral(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          // Só marca como não encontrado se nem o cache tinha dados
          if (!pastoral) setNotFound(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSubmitStatus("");
  }

  async function handleInscricao(event) {
    event.preventDefault();
    if (!form.name.trim()) {
      setSubmitStatus("Informe seu nome para se inscrever.");
      return;
    }
    setSubmitting(true);
    try {
      await createInscricao(id, form);
      setSubmitStatus("Inscrição enviada com sucesso! Em breve entraremos em contato.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      setSubmitStatus(error.message || "Não foi possível enviar a inscrição.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className={`container ${styles.loading}`}>Carregando...</div>;
  }

  if (notFound || !pastoral) {
    return (
      <div className={`container ${styles.emptyState}`}>
        <p>Pastoral não encontrada.</p>
        <Link to="/pastorais" className={styles.backLink}>
          <ArrowLeft size={16} /> Voltar para Pastorais
        </Link>
      </div>
    );
  }

  const isSuccess = submitStatus.startsWith("Inscrição enviada");
  const posts = pastoral.posts || [];

  return (
    <div className="container">
      <Link to="/pastorais" className={styles.backLink}>
        <ArrowLeft size={16} /> Todas as pastorais
      </Link>

      <div className={styles.detailHero}>
        {pastoral.imageUrl && (
          <div
            className={styles.detailHeroImage}
            style={{ backgroundImage: `url('${pastoral.imageUrl}')` }}
          />
        )}
        <div className={styles.detailHeroOverlay} />
        <div className={styles.detailHeroContent}>
          <h1 className={styles.detailTitle}>{pastoral.name}</h1>
          <div className={styles.detailMeta}>
            {pastoral.coordinator && (
              <span>
                <User size={16} /> Coordenador(a): {pastoral.coordinator}
              </span>
            )}
            {pastoral.contact && (
              <span>
                <Phone size={16} /> {pastoral.contact}
              </span>
            )}
            <span>
              <Calendar size={16} /> {posts.length} publicação(ões)
            </span>
          </div>
        </div>
      </div>

      <div className={styles.detailLayout}>
        <div className={styles.sectionCard}>
          <h2>Sobre a pastoral</h2>
          <p>{pastoral.description || "Em breve mais informações sobre esta pastoral."}</p>
        </div>

        <div className={styles.sectionCard}>
          <h2>
            <UserPlus size={18} style={{ verticalAlign: "-2px", marginRight: "0.35rem" }} />
            Inscrição
          </h2>
          <p>Quer participar? Preencha o formulário abaixo:</p>

          {submitStatus && (
            <div className={`${styles.alert} ${isSuccess ? styles.alertSuccess : styles.alertError}`}>
              {isSuccess && <CheckCircle2 size={16} style={{ verticalAlign: "-2px", marginRight: "0.3rem" }} />}
              {submitStatus}
            </div>
          )}

          <form onSubmit={handleInscricao}>
            <div className={styles.formGroup}>
              <label htmlFor="insc-name">Nome completo *</label>
              <input
                id="insc-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Seu nome"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="insc-email">E-mail</label>
              <input
                id="insc-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="seuemail@exemplo.com"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="insc-phone">Telefone / WhatsApp</label>
              <input
                id="insc-phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="(31) 99999-9999"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="insc-message">Mensagem (opcional)</label>
              <textarea
                id="insc-message"
                name="message"
                rows="3"
                value={form.message}
                onChange={handleChange}
                placeholder="Conte um pouco sobre você ou sua disponibilidade"
              />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={submitting}>
              {submitting ? "Enviando..." : "Enviar inscrição"}
            </button>
          </form>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <h2>Eventos e notícias</h2>
        {posts.length === 0 ? (
          <p className={styles.emptyList}>Ainda não há publicações desta pastoral.</p>
        ) : (
          posts.map((post) => (
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
            </article>
          ))
        )}
      </div>
    </div>
  );
}
