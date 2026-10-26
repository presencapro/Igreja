// Cloudflare Workers / Cloudflare Pages proxy handler
// Permite que a aplicação no Cloudflare (ex.: igreja.ashyy.workers.dev)
// acerte requisições da Canção Nova, Fonte Divina e API Liturgia sem erro de CORS.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Proxy Canção Nova Santo do Dia
    if (url.pathname.startsWith("/api-cancaonova")) {
      const targetPath = url.pathname.replace(/^\/api-cancaonova/, "");
      const targetUrl = `https://santo.cancaonova.com${targetPath}${url.search}`;
      try {
        const resp = await fetch(targetUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Referer: "https://santo.cancaonova.com/",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
        });
        const headers = new Headers(resp.headers);
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
        return new Response(resp.body, {
          status: resp.status,
          statusText: resp.statusText,
          headers,
        });
      } catch (err) {
        return new Response(err.message, { status: 500 });
      }
    }

    // 2. Proxy Fonte Divina (RSC)
    if (url.pathname.startsWith("/api-ftdv")) {
      const targetPath = url.pathname.replace(/^\/api-ftdv/, "");
      const targetUrl = `https://www.ftdv.app${targetPath}${url.search}`;
      try {
        const resp = await fetch(targetUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            RSC: "1",
            Accept: "text/x-component",
          },
        });
        const headers = new Headers(resp.headers);
        headers.set("Access-Control-Allow-Origin", "*");
        return new Response(resp.body, {
          status: resp.status,
          statusText: resp.statusText,
          headers,
        });
      } catch (err) {
        return new Response(err.message, { status: 500 });
      }
    }

    // 3. Proxy API Liturgia Diária / Santo (Vercel)
    if (url.pathname.startsWith("/api-santo")) {
      const targetPath = url.pathname.replace(/^\/api-santo/, "");
      const targetUrl = `https://api-liturgia-diaria.vercel.app${targetPath}${url.search}`;
      try {
        const resp = await fetch(targetUrl);
        const headers = new Headers(resp.headers);
        headers.set("Access-Control-Allow-Origin", "*");
        return new Response(resp.body, {
          status: resp.status,
          statusText: resp.statusText,
          headers,
        });
      } catch (err) {
        return new Response(err.message, { status: 500 });
      }
    }

    // Pass-through padrão para assets estáticos do Cloudflare
    return env.ASSETS ? env.ASSETS.fetch(request) : fetch(request);
  },
};
