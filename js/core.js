/* Paralelo Zero — utilidades compartilhadas (sem dependências). */
(function () {
  "use strict";

  const WHATSAPP = "5596999990000"; // fictício
  const DADOS = window.IMOVEIS || [];
  const COMERCIAIS = ["Sala comercial", "Loja", "Andar corporativo"];

  /* ---------- formatação ---------- */
  const nf = new Intl.NumberFormat("pt-BR");
  const nf2 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const nf1 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
  const fmt = {
    brl: (n) => "R$ " + nf.format(n),
    curto: (n) => n >= 1e6 ? "R$ " + nf1.format(n / 1e6) + " mi" : n >= 1e4 ? "R$ " + nf.format(Math.round(n / 1e3)) + " mil" : "R$ " + nf.format(n),
    m: (n) => nf2.format(n),
    m2: (n) => nf1.format(n) + " m²",
    n: (n) => nf.format(n),
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- imagens (Unsplash) ---------- */
  const foto = (id, w, h) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? "&h=" + h : ""}&q=70`;
  const srcset = (id, ratio, larguras) => larguras.map((w) => `${foto(id, w, Math.round(w / ratio))} ${w}w`).join(", ");

  /* ---------- armazenamento local (favoritos / comparar) ---------- */
  const store = {
    ler(chave) { try { return JSON.parse(localStorage.getItem(chave)) || []; } catch (e) { return []; } },
    gravar(chave, lista) { try { localStorage.setItem(chave, JSON.stringify(lista)); } catch (e) { /* modo privado */ } document.dispatchEvent(new CustomEvent("pz:mudou")); },
  };
  const FAV = "pz:favoritos", CMP = "pz:comparar", MAX_CMP = 3;
  const favoritos = () => store.ler(FAV);
  const comparar = () => store.ler(CMP);

  /* ---------- ícones (traço 1.5, desenhados aqui) ---------- */
  const s = (d, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
  const ICO = {
    area: s('<path d="M4 4h16v16H4z"/><path d="M4 9h3M4 14h3M9 4v3M14 4v3"/>'),
    quarto: s('<path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 15h18M3 18v2M21 18v2M7 9V6h10v3"/>'),
    banho: s('<path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2zM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2"/>'),
    vaga: s('<path d="M5 16V11l2-5h10l2 5v5M5 16h14M5 16v2M19 16v2M5 11h14"/><circle cx="8" cy="13.5" r=".6"/><circle cx="16" cy="13.5" r=".6"/>'),
    coracao: s('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>', 'class="ico-coracao"'),
    comparar: s('<path d="M4 5h7v14H4zM13 5h7v14h-7z"/>'),
    compartilhar: s('<path d="M12 4v11M8 8l4-4 4 4M5 13v6h14v-6"/>'),
    seta: s('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    buscar: s('<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>'),
    menu: s('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    fechar: s('<path d="M6 6l12 12M18 6L6 18"/>'),
    whatsapp: s('<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.4-1.9-.9-.8.8c-1-.4-2-1.4-2.4-2.4l.8-.8-.9-1.9z"/>'),
    calendario: s('<path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/>'),
  };

  /* ---------- imóveis ---------- */
  const porCodigo = (cod) => DADOS.find((i) => i.codigo === cod);
  const link = (i) => `imovel.html?cod=${encodeURIComponent(i.codigo)}`;
  const ehComercial = (i) => COMERCIAIS.includes(i.tipo);
  const precoHTML = (i, classe = "") => {
    const pre = i.lancamento ? '<small>a partir de </small>' : "";
    const suf = i.negociacao === "aluguel" ? '<small> /mês</small>' : "";
    return `<span class="${classe}">${pre}${fmt.brl(i.preco)}${suf}</span>`;
  };
  const negRotulo = (i) => i.lancamento ? "Lançamento" : i.negociacao === "venda" ? "Venda" : "Aluguel";
  const specs = (i) => {
    const itens = [`${ICO.area}<span>${fmt.m2(i.area)}</span>`];
    if (i.quartos) itens.push(`${ICO.quarto}<span>${i.quartos} ${i.quartos > 1 ? "quartos" : "quarto"}</span>`);
    if (i.banheiros) itens.push(`${ICO.banho}<span>${i.banheiros} ${i.banheiros > 1 ? "banheiros" : "banheiro"}</span>`);
    if (i.vagas) itens.push(`${ICO.vaga}<span>${i.vagas} ${i.vagas > 1 ? "vagas" : "vaga"}</span>`);
    return `<ul class="specs">${itens.map((t) => `<li>${t}</li>`).join("")}</ul>`;
  };
  const botoesCard = (i) => {
    const fav = favoritos().includes(i.codigo), cmp = comparar().includes(i.codigo);
    return `<div class="card__acoes">
      <button class="icone-btn" type="button" data-fav="${i.codigo}" aria-pressed="${fav}" aria-label="Favoritar ${esc(i.titulo)}">${ICO.coracao}</button>
      <button class="icone-btn" type="button" data-cmp="${i.codigo}" aria-pressed="${cmp}" aria-label="Comparar ${esc(i.titulo)}">${ICO.comparar}</button>
    </div>`;
  };
  const card = (i, opt = {}) => {
    const r = opt.grande ? 5 / 4 : 4 / 3;
    const f = i.fotos[0];
    return `<article class="card${opt.grande ? " card--grande" : ""}">
      <div class="card__foto">
        ${i.lancamento ? '<span class="selo">Lançamento</span>' : ""}
        <img src="${foto(f.id, 800, Math.round(800 / r))}" srcset="${srcset(f.id, r, [480, 800, 1200])}"
             sizes="${opt.grande ? "(max-width: 900px) 100vw, 700px" : "(max-width: 600px) 100vw, (max-width: 900px) 50vw, 400px"}"
             width="800" height="${Math.round(800 / r)}" alt="${esc(i.titulo)}" loading="lazy" decoding="async">
      </div>
      ${botoesCard(i)}
      <div class="card__corpo">
        <p class="card__tipo">${negRotulo(i)} · ${esc(i.tipo)} · ${esc(i.bairro)}</p>
        <h3 class="card__titulo"><a href="${link(i)}">${esc(i.titulo)}</a></h3>
        ${precoHTML(i, "card__preco")}
        <span class="card__cod">${i.codigo}</span>
        ${opt.nota ? `<p class="card__nota">${esc(opt.nota)}</p>` : ""}
        ${specs(i)}
      </div>
    </article>`;
  };
  const linhaImovel = (i) => `<li class="linha-imovel">
      <img src="${foto(i.fotos[0].id, 240, 180)}" width="240" height="180" alt="" loading="lazy" decoding="async">
      <div><p class="linha-imovel__tipo">${negRotulo(i)} · ${esc(i.tipo)} · ${esc(i.bairro)} · ${fmt.m2(i.area)}</p>
      <p class="linha-imovel__tit"><a href="${link(i)}">${esc(i.titulo)}</a></p></div>
      <p class="linha-imovel__preco">${i.lancamento ? "<small>a partir de</small>" : ""}${fmt.brl(i.preco)}${i.negociacao === "aluguel" ? "<small>por mês</small>" : ""}</p>
    </li>`;

  /* ---------- planta em escala (SVG gerado dos dados, em metros) ---------- */
  function medirK(el) {
    const p = document.createElement("div");
    p.style.cssText = "position:absolute;visibility:hidden;width:var(--k);height:0";
    el.appendChild(p);
    const k = p.getBoundingClientRect().width;
    p.remove();
    return k || 16;
  }
  function planta(pl, opt = {}) {
    const k = opt.k || 16;
    const W = pl.w, H = pl.h;
    const fs = (px) => (px / k).toFixed(3);
    const sw = (1 / k).toFixed(3), swc = (2 / k).toFixed(3);
    let out = `<svg class="planta" viewBox="0 0 ${W} ${H}" width="${(W * k).toFixed(1)}" height="${(H * k).toFixed(1)}" style="--sw:${sw};--swc:${swc}" role="img" aria-label="${esc(opt.rotulo || "Planta")}">`;
    if (pl.lote) {
      out += `<g class="comodo" data-i="0"><rect class="lote" x="0" y="0" width="${W}" height="${H}"/></g>`;
      if (opt.rotulos) {
        out += `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" font-size="${fs(14)}" font-weight="600">Lote</text>`;
        out += `<text class="rot-area" x="${W / 2}" y="${H / 2 + 18 / k}" text-anchor="middle" font-size="${fs(12)}">${fmt.n(W * H)} m²</text>`;
        out += `<text class="rot-area" x="${W / 2}" y="${H + 16 / k}" text-anchor="middle" font-size="${fs(11)}">frente para a rua</text>`;
      }
    } else {
      pl.comodos.forEach((c, n) => {
        out += `<g class="comodo" data-i="${n}"><rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" pathLength="1" style="--i:${n}"/>`;
        const largo = c.w * k >= c.n.length * 7 + 12;
        if (opt.rotulos && largo && c.h * k >= 36) {
          const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
          out += `<text x="${cx}" y="${cy - 2 / k}" text-anchor="middle" font-size="${fs(12)}" font-weight="600">${esc(c.n)}</text>`;
          out += `<text class="rot-area" x="${cx}" y="${cy + 13 / k}" text-anchor="middle" font-size="${fs(11)}">${fmt.m(c.w * c.h)} m²</text>`;
        } else if (opt.rotulos && largo && c.h * k >= 18) {
          out += `<text x="${c.x + c.w / 2}" y="${c.y + c.h / 2 + 4 / k}" text-anchor="middle" font-size="${fs(12)}" font-weight="600">${esc(c.n)}</text>`;
        }
        out += `</g>`;
      });
      out += `<rect class="contorno" x="0" y="0" width="${W}" height="${H}" pathLength="1" style="--i:${pl.comodos.length}"/>`;
    }
    if (opt.cotas) {
      const o = 20 / k, t = 4 / k;
      out += `<g class="cota" stroke-width="${sw}">
        <line x1="0" y1="${-o}" x2="${W}" y2="${-o}"/><line x1="0" y1="${-o - t}" x2="0" y2="${-o + t}"/><line x1="${W}" y1="${-o - t}" x2="${W}" y2="${-o + t}"/>
        <text x="${W / 2}" y="${-o - 6 / k}" text-anchor="middle" font-size="${fs(11)}" stroke="none">${fmt.m(W)}</text>
        <line x1="${-o}" y1="0" x2="${-o}" y2="${H}"/><line x1="${-o - t}" y1="0" x2="${-o + t}" y2="0"/><line x1="${-o - t}" y1="${H}" x2="${-o + t}" y2="${H}"/>
        <text x="${-o - 6 / k}" y="${H / 2}" text-anchor="middle" font-size="${fs(11)}" stroke="none" transform="rotate(-90 ${-o - 6 / k} ${H / 2})">${fmt.m(H)}</text>
      </g>`;
    }
    return out + `</svg>`;
  }
  // a planta se desenha uma vez quando entra na tela (único movimento autoral do site)
  const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function desenharAoVer(svgs) {
    if (reduz || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((ents) => ents.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("desenhando"); io.unobserve(e.target); }
    }), { threshold: 0.35 });
    svgs.forEach((svg) => {
      const r = svg.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.9) io.observe(svg); // só anima o que ainda não foi visto
    });
  }

  /* ---------- aviso (toast) ---------- */
  let avisoEl, avisoT;
  function aviso(msg) {
    if (!avisoEl) { avisoEl = document.createElement("div"); avisoEl.className = "aviso"; avisoEl.setAttribute("role", "status"); avisoEl.setAttribute("aria-live", "polite"); document.body.appendChild(avisoEl); }
    avisoEl.textContent = msg;
    avisoEl.classList.add("visivel");
    clearTimeout(avisoT); avisoT = setTimeout(() => avisoEl.classList.remove("visivel"), 2600);
  }

  /* ---------- favoritos / comparar (delegação) ---------- */
  function alternar(chave, cod) {
    const lista = store.ler(chave);
    const i = lista.indexOf(cod);
    if (i >= 0) { lista.splice(i, 1); store.gravar(chave, lista); return false; }
    if (chave === CMP && lista.length >= MAX_CMP) { aviso(`Você pode comparar até ${MAX_CMP} imóveis. Remova um para incluir este.`); return null; }
    lista.push(cod); store.gravar(chave, lista); return true;
  }
  document.addEventListener("click", (ev) => {
    const f = ev.target.closest("[data-fav]"), c = ev.target.closest("[data-cmp]");
    if (f) { const r = alternar(FAV, f.dataset.fav); aviso(r ? "Salvo nos favoritos." : "Removido dos favoritos."); }
    if (c) {
      const r = alternar(CMP, c.dataset.cmp);
      if (r === true) aviso(`Incluído na comparação (${comparar().length} de ${MAX_CMP}).`);
      if (r === false) aviso("Removido da comparação.");
    }
  });
  document.addEventListener("pz:mudou", () => {
    const fv = favoritos(), cp = comparar();
    document.querySelectorAll("[data-fav]").forEach((b) => b.setAttribute("aria-pressed", fv.includes(b.dataset.fav)));
    document.querySelectorAll("[data-cmp]").forEach((b) => b.setAttribute("aria-pressed", cp.includes(b.dataset.cmp)));
    contadores();
  });
  window.addEventListener("storage", () => document.dispatchEvent(new CustomEvent("pz:mudou")));
  function contadores() {
    const nf_ = favoritos().length, nc = comparar().length;
    document.querySelectorAll("[data-contador=fav]").forEach((e) => { e.textContent = nf_; e.dataset.n = nf_; });
    document.querySelectorAll("[data-contador=cmp]").forEach((e) => { e.textContent = nc; e.dataset.n = nc; });
  }

  /* ---------- WhatsApp ---------- */
  const whats = (texto) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;

  /* ---------- cabeçalho e rodapé ---------- */
  function cabecalho(atual) {
    const a = (href, txt, id) => `<a href="${href}"${atual === id ? ' aria-current="page"' : ""}>${txt}</a>`;
    return `<a class="pular" href="#conteudo">Pular para o conteúdo</a>
    <div class="container topo__in">
      <a class="marca" href="index.html" aria-label="Paralelo Zero Imóveis, início">Paralelo<span class="marca__linha" aria-hidden="true"></span>Zero</a>
      <nav class="nav" id="nav" aria-label="Principal">
        ${a("busca.html?neg=venda", "Comprar", "comprar")}
        ${a("busca.html?neg=aluguel", "Alugar", "alugar")}
        ${a("busca.html?tipo=comercial", "Comercial", "comercial")}
        ${a("busca.html?lanc=1", "Lançamentos", "lancamentos")}
        ${a("anunciar.html", "Anunciar imóvel", "anunciar")}
        <span class="nav__sep" aria-hidden="true"></span>
        <a href="favoritos.html"${atual === "favoritos" ? ' aria-current="page"' : ""}>Favoritos<span class="contador" data-contador="fav" data-n="0">0</span></a>
        <a href="comparar.html"${atual === "comparar" ? ' aria-current="page"' : ""}>Comparar<span class="contador" data-contador="cmp" data-n="0">0</span></a>
      </nav>
      <a class="btn topo__buscar" href="busca.html">${ICO.buscar}<span>Buscar</span></a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="Abrir menu">${ICO.menu}</button>
    </div>`;
  }
  function rodape() {
    return `<div class="container">
      <div class="rodape__carimbo">
        <div><a class="marca" href="index.html">Paralelo<span class="marca__linha" aria-hidden="true"></span>Zero</a>
          <p style="margin-top:10px">Imóveis para comprar e alugar em Macapá, do kitnet à casa com piscina. Toda planta desenhada na mesma escala.</p></div>
        <div><h4>Imóveis</h4><ul>
          <li><a href="busca.html?neg=venda">Comprar</a></li><li><a href="busca.html?neg=aluguel">Alugar</a></li>
          <li><a href="busca.html?tipo=comercial">Comercial</a></li><li><a href="busca.html?lanc=1">Lançamentos</a></li></ul></div>
        <div><h4>Para você</h4><ul>
          <li><a href="anunciar.html">Anunciar imóvel</a></li><li><a href="favoritos.html">Favoritos</a></li><li><a href="comparar.html">Comparar</a></li></ul></div>
        <div><h4>Atendimento</h4><ul>
          <li><a href="${whats("Olá! Vim pelo site da Paralelo Zero.")}" target="_blank" rel="noopener">WhatsApp (96) 99999-0000</a></li>
          <li>Seg. a sex., 8h às 18h · sáb., 8h às 12h</li><li>Central, Macapá/AP</li><li class="num">CRECI-AP 0000-J</li></ul></div>
      </div>
      <p class="rodape__aviso">Projeto de portfólio. Imobiliária, imóveis, preços, telefone e CRECI são fictícios. Fotos: Unsplash (créditos na página de cada imóvel). Mapa: © colaboradores do OpenStreetMap.</p>
    </div>`;
  }
  function montarPagina(atual) {
    const topo = document.querySelector("[data-topo]"), pe = document.querySelector("[data-rodape]");
    if (topo) topo.innerHTML = cabecalho(atual);
    if (pe) pe.innerHTML = rodape();
    const btn = document.querySelector(".menu-btn"), nav = document.getElementById("nav");
    if (btn && nav) {
      const fechar = () => { nav.classList.remove("aberto"); btn.setAttribute("aria-expanded", "false"); btn.innerHTML = ICO.menu; btn.setAttribute("aria-label", "Abrir menu"); };
      btn.addEventListener("click", () => {
        const abrir = !nav.classList.contains("aberto");
        if (!abrir) return fechar();
        nav.classList.add("aberto"); btn.setAttribute("aria-expanded", "true"); btn.innerHTML = ICO.fechar; btn.setAttribute("aria-label", "Fechar menu");
      });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("aberto")) { fechar(); btn.focus(); } });
      window.matchMedia("(min-width: 1021px)").addEventListener("change", fechar);
    }
    contadores();
  }

  window.PZ = { DADOS, COMERCIAIS, fmt, esc, foto, srcset, ICO, porCodigo, link, ehComercial, precoHTML, negRotulo, specs, card, linhaImovel,
    planta, medirK, desenharAoVer, aviso, whats, montarPagina, favoritos, comparar, alternar, FAV, CMP, MAX_CMP };
})();
