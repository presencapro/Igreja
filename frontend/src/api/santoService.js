// src/api/santoService.js
// Serviço centralizado para obter o Santo do Dia.
// FONTE PRINCIPAL: Fonte Divina (https://www.ftdv.app/santos), consultada via
// rota intermediária do backend (/site/santo-do-dia) para evitar CORS.
// FALLBACK: Catholic Readings API + calendário canônico local +
// Wikipedia (mantidos para quando a Fonte Divina estiver indisponível/sem dados).

import { NOMES_SANTOS } from "./calendarioSantos.js";
import { preloadImageUrl } from "../utils/imageValidation.js";

export const DEFAULT_SANTO_IMAGE = "/images/santo-default.jpg";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";

/**
 * FONTE PRINCIPAL: rota intermediária do backend (/site/santo-do-dia) que
 * consulta a Fonte Divina (https://www.ftdv.app/santos). O fetch é feito no
 * servidor para evitar CORS e já vem com cache de 24h.
 * Retorna lista normalizada ou null quando a fonte falha / não tem conteúdo.
 */
async function fetchFonteDivina(date) {
  try {
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(
      `${BACKEND_URL}/site/santo-do-dia?date=${dia}/${mes}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!resp.ok) return null;
    const json = await resp.json();
    if (!json?.success || !Array.isArray(json.saints) || json.saints.length === 0) {
      return null;
    }

    return json.saints
      .filter((santo) => santo && santo.name)
      .map((santo) => ({
        nome: String(santo.name).trim(),
        imagem:
          santo.image && /^https?:\/\//i.test(String(santo.image))
            ? String(santo.image)
            : null,
        historia: (santo.description || "").trim(),
        reflexao: (santo.reflexao || "").trim(),
        oracao: (santo.oracao || "").trim(),
        url: santo.url || null,
        fonte: "Fonte Divina",
        tipo: "",
        data: formatCacheKey(date)
      }));
  } catch (_) {
    return null;
  }
}

/** Converte URLs de thumbnail do Wikimedia para a imagem ORIGINAL.
 * Thumbs pedidos acima do tamanho do original retornam HTTP 400, o que
 * quebra imagens curadas. Ex.: /thumb/a/ab/File.jpg/600px-File.jpg
 *   → /a/ab/File.jpg (original, sempre carrega). */
function wikimediaThumbParaOriginal(url) {
  try {
    const m = url.match(/\/wikipedia\/commons\/thumb\/([0-9a-f])\/([0-9a-f]{2})\/([^/]+)\/\d+px-[^/]+$/i);
    if (m && /^https?:\/\//i.test(url)) {
      return `https://upload.wikimedia.org/wikipedia/commons/${m[1]}/${m[2]}/${m[3]}`;
    }
    return url;
  } catch (_) {
    return url;
  }
}

/** Fonte primária do Santo do Dia: Catholic Readings API (calendário litúrgico).
 * Fornece nome/tipo/quote/descrição e, para memórias do ano corrente, a IMAGEM
 * oficial em celebration.image. */
const CATHOLIC_READINGS_BASE =
  "https://cpbjr.github.io/catholic-readings-api/liturgical-calendar/";

/** Busca a celebração do dia na Catholic Readings API.
 * Retorna { name, type, quote, description, image } ou null em caso de falha.
 * Nunca lança exceção. */
async function fetchCatholicReadingsCelebration(date) {
  try {
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const ano = date.getFullYear();
    const url = `${CATHOLIC_READINGS_BASE}${ano}/${mes}-${dia}.json`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!resp.ok) return null;
    const json = await resp.json();
    const c = json?.celebration;
    if (!c || !c.name) return null;

    const type = c.type ? String(c.type).trim().toUpperCase() : "";
    // FERIA (dia de féria) e demais tipos sem celebração própria NÃO são santos.
    // Nesses casos retornamos null para que a data fique em branco.
    if (type && !(type in TIPOS_LITURGICOS_PT)) {
      return null;
    }

    return {
      name: String(c.name).trim(),
      type,
      quote: c.quote ? String(c.quote).trim() : "",
      description: c.description ? String(c.description).trim() : "",
      // Campo principal da imagem (especificação: celebration.image)
      image: c.image && /^https?:\/\//i.test(String(c.image)) ? String(c.image) : null
    };
  } catch (_) {
    return null;
  }
}

/** Tipos litúrgicos da Catholic Readings API em português */
const TIPOS_LITURGICOS_PT = {
  SOLEMNITY: "Solenidade",
  FEAST: "Festa",
  MEMORIAL: "Memória",
  OPT_MEMORIAL: "Memória Opcional"
};

/** Formata data para a chave de cache "YYYY-MM-DD" */
export function formatCacheKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Calendário Litúrgico Canônico dos Santos para garantir nome, história, reflexão e oração */
const CALENDARIO_SANTOS = {
  "10-21": {
    nome: "Santa Úrsula e Companheiras Mártires",
    imagemPadrao: "https://img.cancaonova.com/cnimages/canais/uploads/sites/2/2022/10/Santa-%C3%9Arsula.jpg",
    historia: "Santa Úrsula viveu no século IV e era filha de reis na Inglaterra. Conhecida por sua profunda fé cristã e beleza, consagrou secretamente sua pureza a Deus. Ao recusar casar-se com um chefe pagão para não renunciar a Cristo, preferiu enfrentar o martírio junto de suas jovens companheiras virgens em Colônia, Alemanha. Seu túmulo é venerado há séculos e ela se tornou padroeira das escolas e dos educadores católicos.",
    reflexao: "Santa Úrsula e suas companheiras nos ensinam que a fidelidade a Cristo e a pureza de coração têm valor infinito diante de Deus. Seu testemunho corajoso convida cada cristão a não se curvar diante das pressões do mundo presente.",
    oracao: "Ó Deus Todo-Poderoso, concedei-nos, pela intercessão de Santa Úrsula e suas santas companheiras mártires, a graça da perseverança na fé, a firmeza nos bons costumes e a pureza de coração para testemunhar o Vosso Evangelho em todas as circunstâncias de nossas vidas. Por Nosso Senhor Jesus Cristo, vosso Filho, que vive e reina convosco na unidade do Espírito Santo. Amém."
  },
  "10-22": {
    nome: "São João Paulo II, Papa",
    imagemPadrao: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Oscar_Luigi_Scalfaro_con_Giovanni_Paolo_II_%28cropped%29.jpg",
    historia: "Karol Józef Wojtyła nasceu na Polônia em 1920 e foi eleito bispo de Roma em 1978, tornando-se São João Paulo II. Seu pontificado de 26 anos foi marcado por viagens apostólicas aos quatro cantos do mundo, a defesa inabalável da família, a queda do comunismo na Europa e a proclamação da Divina Misericórdia.",
    reflexao: "O santo pontífice repetiu incansavelmente à humanidade: 'Não tenhais medo! Abri, melhor, escancarai as portas a Cristo!'. Que sua confiança filial na Virgem Maria nos conduza ao encontro pessoal com Jesus.",
    oracao: "Ó Deus, rico de misericórdia, que escolhestes São João Paulo II para governar a Vossa Igreja em todo o mundo, concedei-nos que, instruídos por seus ensinamentos, abramos confiantes os nossos corações à graça salvadora de Cristo. Amém."
  },
  "10-23": {
    nome: "São João de Capistrano",
    imagemPadrao: "https://upload.wikimedia.org/wikipedia/commons/3/36/San_Giovanni_da_Capistrano_cropped.jpg",
    historia: "Nascido em Capistrano, na Itália, no século XIV, tornou-se frade franciscano e destacou-se pela austeridade de vida, eloqüência na pregação e dedicação total à renovação espiritual da Igreja.",
    reflexao: "São João de Capistrano nos lembra que a verdadeira força de um homem de Deus está na oração, na penitência e no zelo ardente pela salvação das almas.",
    oracao: "Deus eterno e misericordioso, que suscitastes São João de Capistrano para confortar o vosso povo nas provações, fazei que, sob vossa proteção, guardemos a paz e a santidade. Por Cristo, nosso Senhor. Amém."
  },
  "10-24": {
    nome: "Santo Antônio Maria Claret",
    imagemPadrao: "",
    historia: "Arcebispo e fundador da Congregação dos Missionários Filhos do Imaculado Coração de Maria (Claretianos), dedicou sua vida a evangelizar pelos sermões e pela difusão de bons livros católicos.",
    reflexao: "O amor de Cristo nos impele a evangelizar em todos os meios e a propagar a verdade com humildade e vigor apostólico.",
    oracao: "Ó Deus, que enriquecestes Santo Antônio Maria Claret com admirável caridade e fortaleza para proclamar o Evangelho aos povos, concedei-nos, por sua intercessão, buscar sempre as vossas coisas e trabalhar pelo bem da Igreja. Amém."
  },
  "10-25": {
    nome: "Santo Antônio de Sant'Anna Galvão (Frei Galvão)",
    imagemPadrao: "",
    historia: "Primeiro santo nascido no Brasil, nascido em Guaratinguetá-SP em 1739. Foi franciscano exemplar, homem de profunda paz e caridade incansável para com os doentes, aflitos e necessitados.",
    reflexao: "Frei Galvão fez de sua vida um hino de amor e consolação a quem sofria. Que sejamos promotores da paz e da reconciliação onde quer que estejamos.",
    oracao: "Deus de amor e Pai de misericórdia, que fizestes de Santo Antônio de Sant'Anna Galvão um instrumento de Vossa caridade e alívio para os que sofrem, concedei-nos a graça de imitar a sua bondade. Por Cristo, nosso Senhor. Amém."
  },
  "10-28": {
    nome: "São Simão e São Judas Tadeu, Apóstolos",
    imagemPadrao: "",
    historia: "Dois dos doze apóstolos escolhidos pelo Senhor Jesus. São Judas Tadeu, irmão de Tiago e parente do Senhor, é invocado pela tradição católica como poderoso padroeiro das causas difíceis e desesperadas.",
    reflexao: "Os apóstolos foram os alicerces da Igreja, dando a vida pelo testemunho da Ressurreição de Jesus. Nossa fé repousa sobre a fidelidade deles.",
    oracao: "São Judas Tadeu, glorioso apóstolo e servo fiel de Jesus, rogai por nós nas nossas angústias e causas mais difíceis, para que alcancemos o socorro e a paz do Senhor. Amém."
  }
};

/** Cache expira em 24h, como o da liturgia (evita imagem/erro antigo preso no localStorage) */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Chave de cache local no formato exigido: santo_DD-MM (ex.: santo_27-10) */
function formatSantoCacheKey(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `santo_${d}-${m}`;
}

/** Obtém itens do cache local caso existam e estejam frescos (≤ 24h) */
function getFromCache(date) {
  try {
    const key = formatSantoCacheKey(date);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Formato: { v, createdAt, items }. Entradas antigas são ignoradas.
    if (parsed && parsed.v === 3 && parsed.createdAt && Array.isArray(parsed.items)) {
      const isFresh = Date.now() - parsed.createdAt < CACHE_TTL_MS;
      const isValid = parsed.items.length > 0 && parsed.items[0].nome;
      if (isFresh && isValid) {
        return parsed.items;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

/** Salva os dados completos no cache com marcação de tempo */
function setCache(date, data) {
  try {
    const key = formatSantoCacheKey(date);
    localStorage.setItem(
      key,
      JSON.stringify({ v: 3, createdAt: Date.now(), items: data })
    );
  } catch (e) {}
}

/** Tenta obter imagem real da Canção Nova para o dia de hoje */
async function fetchTodayCancaonovaImage() {
  try {
    const res = await fetch("https://santo.cancaonova.com/");
    if (res.ok) {
      const html = await res.text();
      const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
      if (ogMatch && ogMatch[1] && !ogMatch[1].includes("compartilhamento_padrao") && !ogMatch[1].endsWith(".svg")) {
        return ogMatch[1];
      }
      const imgMatch = html.match(/https:\/\/img\.cancaonova\.com\/cnimages\/canais\/uploads\/sites\/2\/[0-9]{4}\/[0-9]{2}\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/i);
      if (imgMatch && imgMatch[0]) {
        return imgMatch[0];
      }
    }
  } catch (_) {}
  return null;
}

/** Normaliza o nome do santo para busca na Wikipedia */
function cleanWikiName(nome) {
  return nome
    .replace(/ e companheiras mártires/gi, "")
    .replace(/, Papa/gi, "")
    .replace(/, Bispo/gi, "")
    .replace(/, Doutor da Igreja/gi, "")
    .replace(/, Mártir/gi, "")
    .trim();
}

/** Termos de páginas irrelevantes (cidades, batalhas, bandeiras, partidos etc.) */
const WIKI_TERMOS_EXCLUIDOS = [
  "universidade",
  "município",
  "cidade",
  "bandeira",
  "freguesia",
  "bagre",
  "futebol",
  "clube",
  "batalha",
  "eleição",
  "partido",
];

function wikiResultadoValido(texto) {
  if (!texto) return false;
  const t = texto.toLowerCase();
  return !WIKI_TERMOS_EXCLUIDOS.some((termo) => t.includes(termo));
}

/** Busca imagem na Wikipédia pelo nome do santo */
async function fetchWikiImage(nome) {
  try {
    const cleanName = cleanWikiName(nome);

    const searchUrl = `https://pt.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(cleanName)}&gsrlimit=3&prop=pageimages&pithumbsize=600&origin=*`;
    const res = await fetch(searchUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.query?.pages) {
        for (const pid of Object.keys(data.query.pages)) {
          const page = data.query.pages[pid];
          const tituloValido = wikiResultadoValido(page.title);
          const thumbValido = page.thumbnail?.source && wikiResultadoValido(page.thumbnail.source);
          if (thumbValido && tituloValido) {
            return page.thumbnail.source;
          }
        }
      }
    }
  } catch (_) {}
  return null;
}

/** Busca uma biografia resumida (introdução) na Wikipédia pelo nome do santo */
async function fetchWikiHistoria(nome) {
  try {
    const cleanName = cleanWikiName(nome);
    const searchUrl = `https://pt.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(cleanName)}&gsrlimit=1&prop=extracts&explaintext=1&exintro=1&origin=*`;
    const res = await fetch(searchUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.query?.pages) {
        for (const pid of Object.keys(data.query.pages)) {
          const page = data.query.pages[pid];
          const extract = (page.extract || "").trim();
          // Ignora páginas de desambiguação / conteúdo genérico
          if (
            extract &&
            wikiResultadoValido(extract.slice(0, 200)) &&
            extract.length > 60 &&
            !extract.startsWith("Para outros significados") &&
            !extract.includes("pode referir-se a")
          ) {
            return extract;
          }
        }
      }
    }
  } catch (_) {}
  return null;
}

/**
 * Busca o Santo do Dia pela data especificada.
 * Cadeia de fontes: Fonte Divina (backend) → Catholic Readings API
 * (celebration.image) → APIs auxiliares → calendário canônico local →
 * cache → imagem padrão.
 * @param {Date|string} targetDate
 * @returns {Promise<Array>} Lista de santos com { nome, tipo, imagem, historia, reflexao, oracao, data }
 */
export async function getSantoDoDia(targetDate = new Date()) {
  const date = targetDate instanceof Date ? targetDate : new Date(targetDate);
  const dateKey = formatCacheKey(date);
  const dia = date.getDate();
  const mes = date.getMonth() + 1;
  const keyMMDD = `${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  const todayKey = formatCacheKey(new Date());
  const isToday = dateKey === todayKey;

  // 1. Verificar cache local válido
  const cached = getFromCache(date);
  if (cached) {
    return cached;
  }

  // 2. FONTE PRINCIPAL: Fonte Divina via backend (/site/santo-do-dia).
  //    Se indisponível ou sem conteúdo, segue para as fontes de fallback.
  const fonteDivina = await fetchFonteDivina(date);
  if (fonteDivina && fonteDivina.length > 0) {
    setCache(date, fonteDivina);
    return fonteDivina;
  }

  // 3. Fonte externa: Catholic Readings API (santo + imagem em celebration.image)
  const catholic = await fetchCatholicReadingsCelebration(date);

  if (catholic) {
    const detalhado = CALENDARIO_SANTOS[keyMMDD] || null;
    const nomeCanonico =
      NOMES_SANTOS[keyMMDD] || detalhado?.nome || null;

    const nome = (nomeCanonico || catholic?.name) || "";

    // ---- História (somente dados reais; nunca inventar) ----
    let historia = detalhado?.historia || "";
    if (!historia && nome) {
      historia = (await fetchWikiHistoria(nome)) || "";
    }
    if (!historia && catholic?.description) {
      // Última fonte disponível: breve descrição oficial (em inglês) da Catholic Readings
      historia = catholic.description;
    }

    // ---- Reflexão e Oração ----
    const reflexao =
      detalhado?.reflexao || catholic?.quote ||
      "A santidade consiste em fazer a vontade de Deus em todas as circunstâncias com amor e fidelidade.";
    const oracao =
      detalhado?.oracao ||
      "Rogai por nós, santos de Deus, para que sejamos dignos das promessas de Cristo.";

    // ---- Imagem: cadeia de fontes (especificação) ----
    //  celebration.image → imagem curada do calendário → Canção Nova (só hoje) → Wikipedia → padrão
    const nomeBuscaImagem = nome || "";
    const candidatosImagem = [
      catholic?.image || null,
      // Imagem curada do calendário canônico detalhado (equivalente a cache local)
      detalhado?.imagemPadrao ? wikimediaThumbParaOriginal(detalhado.imagemPadrao) : null,
      isToday ? (await fetchTodayCancaonovaImage()) : null,
      nomeBuscaImagem ? (await fetchWikiImage(nomeBuscaImagem)) : null,
      DEFAULT_SANTO_IMAGE
    ];
    let imagemPrincipal = DEFAULT_SANTO_IMAGE;
    for (const candidato of candidatosImagem) {
      if (!candidato) continue;
      if (candidato === DEFAULT_SANTO_IMAGE) {
        imagemPrincipal = candidato;
        break;
      }
      // Só aceita se a imagem realmente carrega no navegador (nunca mostra quebrada)
      if (await preloadImageUrl(candidato, 3000)) {
        imagemPrincipal = candidato;
        break;
      }
    }

    const principal = {
      nome,
      imagem: imagemPrincipal,
      tipo: catholic?.type ? (TIPOS_LITURGICOS_PT[catholic.type] || "") : "",
      historia,
      reflexao,
      oracao,
      data: dateKey
    };

    const result = [principal];
    setCache(date, result);
    return result;
  }

  // 3. Consulta Secundária: API Liturgia Diária / Canção Nova (quando data for hoje)
  if (isToday) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const resp = await fetch("https://api-liturgia-diaria.vercel.app/santo-do-dia", { signal: controller.signal });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const json = await resp.json();
        if (json && json.today && json.today.title) {
          // Validação de fuso: a API secundária usa o "hoje" do servidor dela
          // (normalmente UTC). Perto da meia-noite isso difere do dia brasileiro
          // e casaria nome/imagem de um santo com o dia errado. Se o dia dela
          // não for o mesmo que o pedido, ignoramos e vamos para o canônico.
          const apiDia = parseInt(json.today.day ?? json.today.dia, 10);
          if (Number.isFinite(apiDia) && apiDia !== date.getDate()) {
            // Fuso divergente — pular para o calendário canônico local
          } else {
          const nomeSanto = json.today.title;
          const imagemSanto = (await fetchTodayCancaonovaImage()) || (await fetchWikiImage(nomeSanto)) || DEFAULT_SANTO_IMAGE;
          const infoCanonica = CALENDARIO_SANTOS[keyMMDD];

          const item = {
            nome: nomeSanto,
            imagem: imagemSanto,
            historia: (json.today.full_text || infoCanonica?.historia || "").trim(),
            reflexao: infoCanonica?.reflexao || (json.today.outros_santos ? `Outros santos celebrados hoje: ${json.today.outros_santos}` : "A vida dos santos é para nós luz e inspiração no seguimento do Evangelho."),
            oracao: infoCanonica?.oracao || "Ó Deus Todo-Poderoso, pela intercessão dos vossos santos e mártires, concedei-nos a fidelidade à vossa vontade e a perseverança no amor a Cristo. Amém.",
            data: dateKey
          };

          const result = [item];
          setCache(date, result);
          return result;
          }
        }
      }
    } catch (_) {}
  }

  // 4. Calendário canônico: detalhes completos (ricos) → nome do ano inteiro.
  //    Se a data não tiver celebração real conhecida, deixa em branco (sem santo),
  //    em vez de inventar um santo genérico.
  const detalhado = CALENDARIO_SANTOS[keyMMDD];
  const hasDetalhado = !!detalhado;
  const nomeDoCalendario = NOMES_SANTOS[keyMMDD];

  if (!hasDetalhado && !nomeDoCalendario) {
    return [];
  }

  const canonico = detalhado || {
    nome: nomeDoCalendario,
    imagemPadrao: DEFAULT_SANTO_IMAGE,
    historia: "",
    reflexao: "A santidade consiste em fazer a vontade de Deus em todas as circunstâncias com amor e fidelidade.",
    oracao: "Todos os santos e santas de Deus, intercedei por nós junto ao Pai Celeste para que caminhemos sempre na justiça e na paz. Amém."
  };

  let imgCanonica = canonico.imagemPadrao
    ? wikimediaThumbParaOriginal(canonico.imagemPadrao)
    : DEFAULT_SANTO_IMAGE;
  // Busca na Wikipedia para celebrações nomeadas do calendário anual.
  if (!imgCanonica || imgCanonica === DEFAULT_SANTO_IMAGE) {
    imgCanonica = (await fetchWikiImage(canonico.nome)) || DEFAULT_SANTO_IMAGE;
  }

  // Para celebrações do calendário anual (sem história rica), buscar na Wikipedia
  let historiaFinal = canonico.historia;
  if (!hasDetalhado && !historiaFinal) {
    historiaFinal = (await fetchWikiHistoria(canonico.nome)) || canonico.historia;
  }

  const fallbackList = [
    {
      nome: canonico.nome,
      imagem: imgCanonica,
      historia: historiaFinal,
      reflexao: canonico.reflexao,
      oracao: canonico.oracao,
      data: dateKey
    }
  ];

  // Só cacheia quando há dados relevantes: entrada com detalhes completos OU celebração
  // nomeada do calendário com biografia obtida. O fallback genérico não é cacheado —
  // a próxima visita tenta novamente as APIs.
  if (hasDetalhado || (nomeDoCalendario && historiaFinal)) {
    setCache(date, fallbackList);
  }
  return fallbackList;
}

/** Limpa todo o cache de Santo do Dia (formatos antigos e novos) */
export function clearSantoCache() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("santo"))
      .forEach((k) => localStorage.removeItem(k));
  } catch (e) {}
}
