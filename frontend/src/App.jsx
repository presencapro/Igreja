import { Routes, Route, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import { SiteContext } from "./context/SiteContext";
import { PastoraisProvider } from "./context/PastoraisContext";
import "./App.css";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import FloatingButtons from "./components/layout/FloatingButtons";
import StickyCard from "./components/layout/StickyCard";

import Hero from "./components/home/Hero";
import RosarioBanner from "./components/home/RosarioBanner";

import Celebracoes from "./components/home/Celebracoes";
import Secretaria from "./components/home/Secretaria";
import Mapa from "./components/home/Mapa";
import Instagram from "./components/home/Instagram";
import Destaques from "./components/home/Destaques";
import PixSection from "./components/home/PixSection";

import AdminPanel from "./components/admin/AdminPanel";
import SEOMeta from "./components/layout/SEOMeta";

import Pastorais from "./pages/Pastorais";
import PastoralDetail from "./pages/PastoralDetail";
import PastoralAccess from "./pages/PastoralAccess";


function PublicSite() {
  const { siteData, theme, setTheme, phoneLinks, whatsappMessage } = useContext(SiteContext);
  const location = useLocation();

  useEffect(() => {
    const sectionMap = {
      "/celebracoes": "celebracoes",
      "/secretaria": "secretaria",
      "/mapa": "mapa",
      "/instagram": "instagram",
      "/destaques": "destaques",
    };

    const sectionId = sectionMap[location.pathname];

    if (sectionId) {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname]);

  return (
    <div className="app-shell" id="top">
      <SEOMeta siteData={siteData} />
      <Header siteData={siteData} theme={theme} setTheme={setTheme} />
      <StickyCard siteData={siteData} />
      <Hero siteData={siteData} />
      <RosarioBanner siteData={siteData} />


      <main className="container main-grid">
        <Celebracoes siteData={siteData} />
        <Secretaria siteData={siteData} phoneLinks={phoneLinks} />
        <Mapa siteData={siteData} />
        <Instagram siteData={siteData} />
        <Destaques siteData={siteData} phoneLinks={phoneLinks} />
        <PixSection siteData={siteData} />

      </main>

      <Footer siteData={siteData} />
      <FloatingButtons phoneLinks={phoneLinks} whatsappMessage={whatsappMessage} />
    </div>
  );
}

function AdminRoute() {
  const ctx = useContext(SiteContext);

  return (
    <div className="app-shell" id="top">
       <Header siteData={ctx.siteData} theme={ctx.theme} setTheme={ctx.setTheme} />
       <main className="container" style={{ margin: "2rem auto", minHeight: "60vh" }}>
          <AdminPanel
             isAuthenticated={ctx.isAuthenticated}
             handleLogin={ctx.handleLogin}
             loginForm={ctx.loginForm}
             handleLoginChange={ctx.handleLoginChange}
             authError={ctx.authError}
             showAdmin={ctx.showAdmin}
             setShowAdmin={ctx.setShowAdmin}
             handleLogout={ctx.handleLogout}
             adminTab={ctx.adminTab}
             setAdminTab={ctx.setAdminTab}
             editor={ctx.editor}
             handleEditorChange={ctx.handleEditorChange}
             setEditor={ctx.setEditor}
             saveEditor={ctx.saveEditor}
             resetEditor={ctx.resetEditor}
             saveStatus={ctx.saveStatus}
             saveMessage={ctx.saveMessage}
          />
       </main>
       <Footer siteData={ctx.siteData} />
       <FloatingButtons phoneLinks={ctx.phoneLinks} whatsappMessage={ctx.whatsappMessage} />
    </div>
  );
}

function App() {
  return (
    <PastoraisProvider>
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/celebracoes" element={<PublicSite />} />
        <Route path="/secretaria" element={<PublicSite />} />
        <Route path="/mapa" element={<PublicSite />} />
        <Route path="/instagram" element={<PublicSite />} />
        <Route path="/acesso-secretaria" element={<AdminRoute />} />
        <Route path="/pastorais" element={<PublicPageWrapper><Pastorais /></PublicPageWrapper>} />
        <Route path="/pastorais/acesso" element={<PublicPageWrapper><PastoralAccess /></PublicPageWrapper>} />
        <Route path="/pastorais/:id" element={<PublicPageWrapper><PastoralDetail /></PublicPageWrapper>} />
      </Routes>
    </PastoraisProvider>
  );
}

function PublicPageWrapper({ children }) {
  const { siteData, theme, setTheme, phoneLinks, whatsappMessage } = useContext(SiteContext);

  return (
    <div className="app-shell" id="top">
      <SEOMeta siteData={siteData} />
      <Header siteData={siteData} theme={theme} setTheme={setTheme} />
      <main style={{ marginBottom: "3rem", minHeight: "60vh" }}>{children}</main>
      <Footer siteData={siteData} />
      <FloatingButtons phoneLinks={phoneLinks} whatsappMessage={whatsappMessage} />
    </div>
  );
}

export default App;
