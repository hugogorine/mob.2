(function () {
  "use strict";
  const { DADOS, fmt, esc, ICO, porCodigo, link, ehComercial, planta, medirK, desenharAoVer, card, linhaImovel, whats, montarPagina } = window.PZ;
  montarPagina("inicio");

  /* hero: total real e linha do paralelo alinhada ao topo do carimbo */
  document.querySelector("[data-total]").textContent = `${DADOS.length} imóveis`;
  const carimbo = document.querySelector(".carimbo"), prancha = document.querySelector(".prancha");
  const alinharParalelo = () => prancha.style.setProperty("--carimbo-h", carimbo.offsetHeight + "px");
  alinharParalelo();
  new ResizeObserver(alinharParalelo).observe(carimbo);

  /* busca */
  const tipos = [...new Set(DADOS.map((i) => i.tipo))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const bairros = [...new Set(DADOS.map((i) => i.bairro))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  document.getElementById("f-tipo").insertAdjacentHTML("beforeend", tipos.map((t) => `<option>${esc(t)}</option>`).join(""));
  document.getElementById("f-bairro").insertAdjacentHTML("beforeend", bairros.map((b) => `<option>${esc(b)}</option>`).join(""));
  const FAIXAS = {
    venda: [200000, 300000, 500000, 1000000, 2000000],
    aluguel: [1000, 1500, 2500, 5000, 10000],
  };
  const selMax = document.getElementById("f-max");
  const preencherMax = () => {
    const neg = document.querySelector('input[name="neg"]:checked').value;
    selMax.innerHTML = `<option value="">Sem limite</option>` + FAIXAS[neg].map((v) => `<option value="${v}">${fmt.curto(v)}${neg === "aluguel" ? "/mês" : ""}</option>`).join("");
  };
  preencherMax();
  document.querySelectorAll('input[name="neg"]').forEach((r) => r.addEventListener("change", preencherMax));
  // não manda parâmetros vazios para a URL da busca
  document.getElementById("busca").addEventListener("submit", (e) => {
    e.preventDefault();
    const p = new URLSearchParams(new FormData(e.target));
    [...p.keys()].forEach((k) => { if (!p.get(k)) p.delete(k); });
    location.href = "busca.html?" + p.toString();
  });

  /* entradas por intenção — mini plantas na MESMA escala (k fixo) */
  const K_MINI = 10;
  const faixa = (lista) => {
    const v = lista.map((i) => i.preco), min = Math.min(...v), max = Math.max(...v);
    const mes = lista.every((i) => i.negociacao === "aluguel") ? "/mês" : "";
    return `de ${fmt.curto(min)}${mes} a ${fmt.curto(max)}${mes}`;
  };
  const menor = (lista) => lista.filter((i) => !i.planta.lote).sort((a, b) => a.area - b.area)[0];
  const grupos = [
    { t: "Comprar", href: "busca.html?neg=venda", lista: DADOS.filter((i) => i.negociacao === "venda" && !i.lancamento) },
    { t: "Alugar", href: "busca.html?neg=aluguel", lista: DADOS.filter((i) => i.negociacao === "aluguel") },
    { t: "Comercial", href: "busca.html?tipo=comercial", lista: DADOS.filter(ehComercial), mix: true },
    { t: "Lançamentos", href: "busca.html?lanc=1", lista: DADOS.filter((i) => i.lancamento) },
  ];
  let html = grupos.map((g) => {
    const m = menor(g.lista);
    const venda = g.lista.filter((i) => i.negociacao === "venda"), alug = g.lista.filter((i) => i.negociacao === "aluguel");
    const fx = g.mix ? `venda ${faixa(venda)} · aluguel ${faixa(alug)}` : faixa(g.lista);
    return `<a class="entrada" href="${g.href}">
      <div class="entrada__planta" aria-hidden="true">${planta(m.planta, { k: K_MINI })}</div>
      <h3>${g.t}${ICO.seta}</h3>
      <p class="entrada__n">${g.lista.length} imóveis</p>
      <p class="entrada__faixa">${fx}</p>
    </a>`;
  }).join("");
  html += `<a class="entrada" href="anunciar.html">
      <div class="entrada__planta" aria-hidden="true">${planta({ w: 6, h: 7, lote: true, comodos: [] }, { k: K_MINI })}</div>
      <h3>Anunciar${ICO.seta}</h3>
      <p class="entrada__n">Seu imóvel aqui</p>
      <p class="entrada__faixa">Visitamos, medimos e desenhamos a planta sem custo para anunciar.</p>
    </a>`;
  document.querySelector("[data-entradas]").innerHTML = html;

  /* faixa "mesma escala" */
  const ESCALA = ["PZ-0412", "PZ-0421", "PZ-0430", "PZ-0440"].map(porCodigo);
  const escalaEl = document.querySelector("[data-escala]"), legEl = document.querySelector("[data-escala-leg]");
  function desenharEscala(animar) {
    const k = medirK(escalaEl);
    escalaEl.innerHTML = ESCALA.map((i) => `<a class="escala__item" href="${link(i)}" data-cod="${i.codigo}" aria-label="${esc(i.titulo)}, ${fmt.m2(i.area)}">${planta(i.planta, { k, rotulo: `Planta de ${i.titulo}` })}</a>`).join("");
    legEl.innerHTML = ESCALA.map((i) => `<a class="escala__leg" href="${link(i)}" data-cod="${i.codigo}" style="width:${(i.planta.w * k).toFixed(1)}px">
        <b>${fmt.m2(i.area)}</b>${esc(i.tipo)} · ${esc(i.bairro)}<strong>${fmt.brl(i.preco)}</strong></a>`).join("");
    if (animar) desenharAoVer(escalaEl.querySelectorAll(".planta"));
  }
  desenharEscala(true);
  let kAtual = medirK(escalaEl), t;
  window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => { const k = medirK(escalaEl); if (k !== kAtual) { kAtual = k; desenharEscala(false); } }, 150); });
  // planta e legenda acendem juntas
  const acender = (cod, on) => document.querySelectorAll(`.escala [data-cod="${cod}"]`).forEach((e) => e.classList.toggle("ativo", on));
  ["mouseover", "focusin"].forEach((ev) => document.querySelector(".escala").addEventListener(ev, (e) => { const a = e.target.closest("[data-cod]"); if (a) acender(a.dataset.cod, true); }));
  ["mouseout", "focusout"].forEach((ev) => document.querySelector(".escala").addEventListener(ev, (e) => { const a = e.target.closest("[data-cod]"); if (a) acender(a.dataset.cod, false); }));

  /* seleção */
  const destaque = porCodigo("PZ-0421");
  document.querySelector("[data-destaque]").innerHTML = card(destaque, { grande: true, nota: destaque.descricao });
  document.querySelector("[data-lista]").innerHTML = ["PZ-0430", "PZ-0501", "PZ-0450", "PZ-0517", "PZ-0426", "PZ-0445"].map(porCodigo).map(linhaImovel).join("");

  /* bairros */
  const cont = {};
  DADOS.forEach((i) => { cont[i.bairro] = (cont[i.bairro] || 0) + 1; });
  document.querySelector("[data-bairros]").innerHTML = bairros.map((b) => `<li><a href="busca.html?bairro=${encodeURIComponent(b)}">${esc(b)}<span>${cont[b]}</span></a></li>`).join("");

  document.querySelector("[data-whats-geral]").href = whats("Olá! Quero anunciar meu imóvel com a Paralelo Zero.");
})();
