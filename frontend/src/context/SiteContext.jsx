import { createContext, useState, useEffect, useMemo, useCallback } from "react";
import { parishData as initialParishData } from "../data";

export const SiteContext = createContext();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";
const STORAGE_KEY = "paroquia-site-data-v1";

function toEditorState(data) {
  return {
    name: data.name,
    heroTitle: data.heroTitle,
    heroText: data.heroText,
    celebrationsNote: data.celebrationsNote || "",
    massTimes: data.massTimes || [],
    forania: data.forania || "",
    foundedYear: data.foundedYear || "",
    officeHours: data.officeHours,
    secretary: data.secretary || "",
    phone: data.phone,
    email: data.email,
    address: data.address,
    zipCode: data.zipCode || "",
    clergyText: Array.isArray(data.clergy) ? data.clergy.join("\n") : "",
    communitiesShort: data.communitiesShort || "",
    noticesText: data.notices?.join("\n") || "",
    diocesePage: data.links?.diocesePage || "",
    instagramProfile: data.links?.instagramProfile || "",
    instagramPost: data.links?.instagramPost || "",
    mapEmbed: data.links?.mapEmbed || "",
  };
}

function formatPhoneLinks(phone) {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) {
    return { phoneHref: "#", whatsapp: "#" };
  }
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return {
    phoneHref: `tel:+${withCountry}`,
    whatsapp: `https://wa.me/${withCountry}`,
  };
}

function buildSiteDataFromEditor(editor, currentSiteData) {
  const notices = editor.noticesText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const clergy = editor.clergyText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const links = {
    ...currentSiteData.links,
    diocesePage: editor.diocesePage,
    instagramProfile: editor.instagramProfile,
    instagramPost: editor.instagramPost,
    mapEmbed: editor.mapEmbed,
    ...formatPhoneLinks(editor.phone),
  };

  return {
    ...currentSiteData,
    name: editor.name,
    heroTitle: editor.heroTitle,
    heroText: editor.heroText,
    celebrationsNote: editor.celebrationsNote,
    massTimes: editor.massTimes,
    forania: editor.forania,
    foundedYear: editor.foundedYear,
    officeHours: editor.officeHours,
    secretary: editor.secretary,
    phone: editor.phone,
    email: editor.email,
    address: editor.address,
    zipCode: editor.zipCode,
    clergy,
    communitiesShort: editor.communitiesShort,
    notices,
    links,
  };
}

export function SiteProvider({ children }) {
  const [siteData, setSiteData] = useState(initialParishData);
  const [editor, setEditor] = useState(toEditorState(initialParishData));
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState("geral");
  const [theme, setTheme] = useState("light");
  const [siteLoading, setSiteLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState("");

  const applySiteData = useCallback((data) => {
    setSiteData(data);
    setEditor(toEditorState(data));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSiteData() {
      try {
        const response = await fetch(`${BACKEND_URL}/site`);
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) {
            applySiteData(data);
          }
          return;
        }
      } catch {
        // Backend indisponível: usa cache local abaixo.
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && !cancelled) {
        try {
          applySiteData(JSON.parse(saved));
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      if (!cancelled) {
        setSiteLoading(false);
      }
    }

    loadSiteData().finally(() => {
      if (!cancelled) {
        setSiteLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [applySiteData]);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/auth/me`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Não autenticado");
        return res.json();
      })
      .then((data) => {
        if (data.authenticated && data.role === "admin") {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setShowAdmin(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        setShowAdmin(false);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  const phoneLinks = useMemo(
    () => formatPhoneLinks(siteData.phone),
    [siteData.phone]
  );

  const whatsappMessage = encodeURIComponent(
    "Olá! Gostaria de mais informações da paróquia."
  );

  function handleEditorChange(event) {
    const { name, value } = event.target;
    setEditor((prev) => ({ ...prev, [name]: value }));
    setSaveStatus("");
    setSaveMessage("");
  }

  function handleLoginChange(event) {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleLogin(event) {
    event.preventDefault();
    setAuthError("");

    const email = loginForm.email.trim().toLowerCase();
    if (!email || !loginForm.password) {
      setAuthError("Preencha o email e a senha.");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: loginForm.password }),
        credentials: "include",
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setAuthError(err.message ?? "Login ou senha inválidos.");
        return;
      }

      setIsAuthenticated(true);
      setShowAdmin(true);
      setAuthError("");
      setLoginForm({ email: "", password: "" });
    } catch {
      setAuthError("Erro ao conectar com o servidor.");
    }
  }

  async function handleLogout() {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Erro ao fazer logout", e);
    }

    setIsAuthenticated(false);
    setShowAdmin(false);
    setAdminTab("geral");
    setUser(null);
  }

  async function saveEditor() {
    const updated = buildSiteDataFromEditor(editor, siteData);

    try {
      const response = await fetch(`${BACKEND_URL}/site`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updated),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message ?? "Não foi possível salvar no servidor.");
      }

      const saved = await response.json();
      applySiteData(saved);
      setSaveStatus("success");
      setSaveMessage("Alterações salvas. A página principal já está atualizada.");
    } catch (error) {
      applySiteData(updated);
      setSaveStatus("warning");
      setSaveMessage(
        error.message?.includes("fetch")
          ? "Salvo apenas neste navegador. Inicie o backend para publicar para todos."
          : error.message || "Salvo apenas neste navegador."
      );
    }
  }

  async function resetEditor() {
    try {
      if (isAuthenticated) {
        await fetch(`${BACKEND_URL}/site`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(initialParishData),
        });
      }
    } catch {
      // Mantém restauração local mesmo se o backend falhar.
    }

    setSiteData(initialParishData);
    setEditor(toEditorState(initialParishData));
    localStorage.removeItem(STORAGE_KEY);
    setSaveStatus("success");
    setSaveMessage("Conteúdo restaurado para o padrão original.");
  }

  const contextValue = {
    siteData,
    editor,
    siteLoading,
    saveStatus,
    saveMessage,
    showAdmin,
    setShowAdmin,
    adminTab,
    setAdminTab,
    theme,
    setTheme,
    user,
    isAuthenticated,
    setIsAuthenticated,
    authLoading,
    loginForm,
    setLoginForm,
    authError,
    setAuthError,
    phoneLinks,
    whatsappMessage,
    handleEditorChange,
    setEditor,
    handleLoginChange,
    handleLogin,
    handleLogout,
    saveEditor,
    resetEditor,
  };

  return (
    <SiteContext.Provider value={contextValue}>{children}</SiteContext.Provider>
  );
}
