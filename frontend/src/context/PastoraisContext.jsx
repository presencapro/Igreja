import { createContext, useState, useEffect, useCallback } from "react";

export const PastoraisContext = createContext();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";
const TOKEN_KEY = "paroquia-pastoral-token-v1";
const ADMIN_TOKEN_KEY = "paroquia-admin-token-v1";

export function PastoraisProvider({ children }) {
  const [pastorais, setPastorais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pastoralToken, setPastoralToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [currentPastoral, setCurrentPastoral] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const loadPastorais = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/pastorais`);
      if (res.ok) {
        setPastorais(await res.json());
      }
    } catch {
      // backend indisponível
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPastorais();
  }, [loadPastorais]);

  const getAuthHeaders = () =>
    pastoralToken ? { Authorization: `Bearer ${pastoralToken}` } : {};

  const getAdminHeaders = () => {
    const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    return adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
  };

  const loadMe = useCallback(async () => {
    if (!pastoralToken) {
      setCurrentPastoral(null);
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/pastorais/me`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setCurrentPastoral(await res.json());
        return;
      }
    } catch {
      // mantém deslogado
    }
    setPastoralToken(null);
    localStorage.removeItem(TOKEN_KEY);
    setCurrentPastoral(null);
  }, [pastoralToken]);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
    setAuthError("");
  };

  async function handleLogin(event) {
    event.preventDefault();
    setAuthError("");
    if (!loginForm.email.trim() || !loginForm.password) {
      setAuthError("Preencha o email e a senha.");
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/pastorais/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setAuthError(err.message ?? "Email ou senha inválidos.");
        return;
      }
      const data = await res.json();
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setPastoralToken(data.token);
      }
      setCurrentPastoral(data.pastoral);
      setLoginForm({ email: "", password: "" });
      setAuthError("");
    } catch {
      setAuthError("Erro ao conectar com o servidor.");
    }
  }

  async function handleLogout() {
    try {
      await fetch(`${BACKEND_URL}/pastorais/logout`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
      });
    } catch {
      // ignora
    }
    setPastoralToken(null);
    localStorage.removeItem(TOKEN_KEY);
    setCurrentPastoral(null);
  }

  async function refreshMe() {
    const res = await fetch(`${BACKEND_URL}/pastorais/me`, {
      credentials: "include",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      setCurrentPastoral(await res.json());
    }
  }

  async function fetchPastoral(idOrSlug) {
    const res = await fetch(`${BACKEND_URL}/pastorais/${idOrSlug}`);
    if (!res.ok) throw new Error("Pastoral não encontrada.");
    return res.json();
  }

  async function createInscricao(idOrSlug, payload) {
    const res = await fetch(`${BACKEND_URL}/pastorais/${idOrSlug}/inscricoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Não foi possível enviar sua inscrição.");
    }
    return res.json();
  }

  async function addPost(payload) {
    const res = await fetch(`${BACKEND_URL}/pastorais/${currentPastoral.id}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Não foi possível publicar o post.");
    }
    return res.json();
  }

  async function updatePost(postId, payload) {
    const res = await fetch(`${BACKEND_URL}/pastorais/${currentPastoral.id}/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Não foi possível atualizar o post.");
    }
    return res.json();
  }

  async function deletePost(postId) {
    const res = await fetch(`${BACKEND_URL}/pastorais/${currentPastoral.id}/posts/${postId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Não foi possível excluir o post.");
  }

  async function deleteInscricao(inscricaoId) {
    const res = await fetch(
      `${BACKEND_URL}/pastorais/${currentPastoral.id}/inscricoes/${inscricaoId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      },
    );
    if (!res.ok) throw new Error("Não foi possível excluir a inscrição.");
  }

  // ============= Admin (secretaria) =============

  async function adminCreatePastoral(payload) {
    const res = await fetch(`${BACKEND_URL}/pastorais`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAdminHeaders() },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Não foi possível criar a pastoral.");
    }
    await loadPastorais();
    return res.json();
  }

  async function adminUpdatePastoral(id, payload) {
    const res = await fetch(`${BACKEND_URL}/pastorais/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAdminHeaders() },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Não foi possível atualizar a pastoral.");
    }
    await loadPastorais();
    return res.json();
  }

  async function adminDeletePastoral(id) {
    const res = await fetch(`${BACKEND_URL}/pastorais/${id}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Não foi possível excluir a pastoral.");
    await loadPastorais();
  }

  async function adminListInscricoes(id) {
    const res = await fetch(`${BACKEND_URL}/pastorais/${id}/inscricoes`, {
      headers: getAdminHeaders(),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Não foi possível carregar as inscrições.");
    return res.json();
  }

  function setSave(status, message) {
    setSaveStatus(status);
    setSaveMessage(message);
  }

  const contextValue = {
    pastorais,
    loading,
    pastoralToken,
    currentPastoral,
    loginForm,
    handleLoginChange,
    handleLogin,
    handleLogout,
    authError,
    saveStatus,
    saveMessage,
    setSave,
    loadPastorais,
    fetchPastoral,
    createInscricao,
    addPost,
    updatePost,
    deletePost,
    deleteInscricao,
    refreshMe,
    adminCreatePastoral,
    adminUpdatePastoral,
    adminDeletePastoral,
    adminListInscricoes,
  };

  return <PastoraisContext.Provider value={contextValue}>{children}</PastoraisContext.Provider>;
}
