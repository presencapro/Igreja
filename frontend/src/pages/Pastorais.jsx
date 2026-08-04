import { useContext } from "react";
import { Link } from "react-router-dom";
import { Users, MapPin, Contact } from "lucide-react";
import { PastoraisContext } from "../context/PastoraisContext";
import styles from "./Pastorais.module.css";

export default function Pastorais() {
  const { pastorais, loading } = useContext(PastoraisContext);

  return (
    <div className="container">
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Pastorais e Movimentos</h1>
        <p className={styles.pageSubtitle}>
          Conheça as pastorais e movimentos da nossa paróquia. Saiba como
          participar, inscreva-se e acompanhe os eventos e novidades de cada
          grupo.
        </p>
      </header>

      {loading ? (
        <div className={styles.loading}>Carregando pastorais...</div>
      ) : pastorais.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhuma pastoral cadastrada ainda.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {pastorais.map((pastoral) => (
            <Link
              key={pastoral.id}
              to={`/pastorais/${pastoral.slug || pastoral.id}`}
              className={styles.card}
            >
              {pastoral.imageUrl ? (
                <img
                  className={styles.image}
                  src={pastoral.imageUrl}
                  alt={pastoral.name}
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  {pastoral.name.charAt(0)}
                </div>
              )}
              <h2 className={styles.cardName}>{pastoral.name}</h2>
              <p className={styles.cardDescription}>
                {pastoral.description || "Em breve mais informações."}
              </p>
              <div className={styles.cardMeta}>
                {pastoral.coordinator && (
                  <span>
                    <Contact size={14} />
                    {pastoral.coordinator}
                  </span>
                )}
                <span>
                  <Users size={14} />
                  {pastoral.postsCount ?? 0} publicação(ões)
                </span>
              </div>
              <div className={styles.cardFooter}>
                <span className={`${styles.btn} ${styles.btnPrimary}`}>
                  Conhecer e participar
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
