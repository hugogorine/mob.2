(function () {
  "use strict";
  const PZ = window.PZ;
  const { DADOS, fmt, esc, ICO, foto, srcset, porCodigo, link, precoHTML, negRotulo, card, planta, medirK, desenharAoVer, aviso, whats, montarPagina } = PZ;

  const main = document.querySelector("[data-imovel]");
  const cod = new URLSearchParams(location.search).get("cod") || "PZ-0412";
  const im = porCodigo(cod);
  montarPagina(im ? (im.lancamento ? "lancamentos" : im.negociacao === "venda" ? "comprar" : "alugar") : "");

  if (!im) {
    document.body.classList.remove("tem-barra");
    main.innerHTML = `<div style="padding:80px 0 40px;max-width:56ch"><h1 style="font-size:2rem">Não encontramos o imóvel ${esc(cod)}.</h1>
      <p style="margin-top:12px;color:var(--nanquim-2)">Ele pode ter sido vendido ou alugado. Veja os imóveis disponíveis agora.</p>
      <p style="margin-top:24px"><a class="btn" href="busca.html">Ver imóveis disponíveis</a></p></div>`;
    return;
  }

  const aluguel = im.negociacao === "aluguel";
  const urlAbs = location.href.split("#")[0];
  document.title = `${im.titulo} — ${im.codigo} · Paralelo Zero Imóveis`;
  document.querySelector('meta[name="description"]').content = `${im.tipo} ${aluguel ? "para alugar" : "à venda"} no bairro ${im.bairro}, Macapá. ${fmt.m2(im.area)}, ${fmt.brl(im.preco)}${aluguel ? " por mês" : ""}. ${im.descricao}`.slice(0, 158);

  const secaoNeg = im.lancamento ? ["Lançamentos", "busca.html?lanc=1"] : aluguel ? ["Alugar", "busca.html?neg=aluguel"] : ["Comprar", "busca.html?neg=venda"];
  const custos = aluguel
    ? (() => {
        const tot = im.preco + im.condominio + im.iptu;
        const partes = [im.condominio && `condomínio ${fmt.brl(im.condominio)}`, im.iptu && `IPTU ${fmt.brl(im.iptu)}`].filter(Boolean);
        return partes.length ? `+ ${partes.join(" + ")} = <b>${fmt.brl(tot)}/mês no total</b>` : "Sem condomínio.";
      })()
    : [im.condominio && `Condomínio ${fmt.brl(im.condominio)}/mês`, im.iptu && `IPTU ${fmt.brl(im.iptu)}/ano`].filter(Boolean).join(" · ") || "Sem condomínio.";
  const msgWhats = `Olá! Tenho interesse no imóvel ${im.codigo} — ${im.titulo} (${fmt.brl(im.preco)}${aluguel ? "/mês" : ""}). ${urlAbs}`;
  const fav = PZ.favoritos().includes(im.codigo), cmp = PZ.comparar().includes(im.codigo);
  const celulas = [["Área", fmt.m2(im.area)], ["Quartos", im.quartos || "—"], ["Banheiros", im.banheiros || "—"], ["Vagas", im.vagas || "—"]];
  const fotos = im.fotos;
  const creditos = [...new Set(fotos.map((f) => f.credito))].join(", ");

  main.innerHTML = `
  <nav class="trilha" aria-label="Você está em">
    <a href="index.html">Início</a><span aria-hidden="true">/</span><a href="${secaoNeg[1]}">${secaoNeg[0]}</a><span aria-hidden="true">/</span><a href="busca.html?bairro=${encodeURIComponent(im.bairro)}">${esc(im.bairro)}</a><span aria-hidden="true">/</span><span>${im.codigo}</span>
  </nav>

  <div class="imovel">
    <section class="galeria" aria-label="Fotos">
      <div class="galeria__principal">
        ${im.lancamento ? '<span class="selo">Lançamento</span>' : ""}
        <img data-foto-principal src="${foto(fotos[0].id, 1400, 933)}" srcset="${srcset(fotos[0].id, 1.5, [700, 1100, 1600])}" sizes="(max-width: 960px) 100vw, 800px"
             width="1400" height="933" alt="${esc(im.titulo)} — foto 1 de ${fotos.length}" fetchpriority="high">
      </div>
      ${fotos.length > 1 ? `<div class="galeria__miniaturas">${fotos.map((f, n) => `
        <button type="button" data-foto="${n}" aria-current="${n === 0}" aria-label="Ver foto ${n + 1} de ${fotos.length}">
          <img src="${foto(f.id, 240, 180)}" width="240" height="180" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
      <p class="galeria__credito">Fotos ilustrativas: ${esc(creditos)} / Unsplash.</p>
    </section>

    <aside class="ficha" aria-label="Ficha do imóvel">
      <p class="ficha__tipo">${negRotulo(im)} · ${esc(im.tipo)}</p>
      <div class="ficha__titulo"><h1>${esc(im.titulo)}</h1><p>${esc(im.bairro)}, Macapá</p></div>
      <div>${precoHTML(im, "ficha__preco")}<p class="ficha__custos">${custos}</p></div>
      <div class="ficha__tabela">${celulas.map(([r, v]) => `<div>${r}<b>${v}</b></div>`).join("")}</div>
      <div class="ficha__botoes">
        <a class="btn btn--bloco" href="${whats(msgWhats)}" target="_blank" rel="noopener">${ICO.whatsapp}Conversar no WhatsApp</a>
        <a class="btn btn--linha btn--bloco" href="#contato">${ICO.calendario}Agendar visita</a>
      </div>
      <div class="ficha__extras">
        <button class="acao" type="button" data-fav="${im.codigo}" aria-pressed="${fav}">${ICO.coracao}Favoritar</button>
        <button class="acao" type="button" data-cmp="${im.codigo}" aria-pressed="${cmp}">${ICO.comparar}Comparar</button>
        <button class="acao" type="button" data-compartilhar>${ICO.compartilhar}Compartilhar</button>
      </div>
      <p class="ficha__cod"><span>Código ${im.codigo}</span><span>Publicado em ${new Date(im.publicado + "T12:00").toLocaleDateString("pt-BR")}</span></p>
    </aside>
  </div>

  <div class="imovel-blocos">
    <section class="bloco" aria-labelledby="t-planta">
      <h2 id="t-planta">${im.planta.lote ? "O lote" : "Planta"}</h2>
      <div class="planta-imovel">
        <div>
          <div class="planta-imovel__desenho" data-planta></div>
          <p class="planta-imovel__nota">Cada quadrado da grade tem 1 metro. Todas as plantas do site estão nesta mesma escala; use <button class="acao" type="button" data-cmp="${im.codigo}" aria-pressed="${cmp}" style="min-height:0;padding:0">Comparar</button> para ver este imóvel lado a lado com outros. Planta esquemática, sem paredes internas em escala.</p>
        </div>
        <table class="comodos" data-comodos></table>
      </div>
    </section>

    <section class="bloco" aria-labelledby="t-sobre">
      <h2 id="t-sobre">Sobre o imóvel e o bairro</h2>
      <div class="sobre">
        <div class="sobre__txt">
          <p>${esc(im.descricao)}</p>
          <p class="detalhes">${esc(im.tipo)} ${aluguel ? "para alugar" : "à venda"} no bairro ${esc(im.bairro)}, Macapá. ${fmt.m2(im.area)}${im.suites ? `, ${im.suites} ${im.suites > 1 ? "suítes" : "suíte"}` : ""}.</p>
        </div>
        <div class="mapa" id="mapa" role="img" aria-label="Mapa com a região aproximada do imóvel no bairro ${esc(im.bairro)}"></div>
        <p class="mapa__nota">O círculo mostra a região aproximada. O endereço exato é informado na visita.</p>
      </div>
    </section>

    <section class="bloco" id="contato" aria-labelledby="t-contato">
      <h2 id="t-contato">Agendar visita ou tirar dúvidas</h2>
      <form class="form" novalidate data-form>
        <div class="campo campo--cheio">
          <fieldset><legend>O que você quer?</legend>
            <div class="opcoes">
              <label><input type="radio" name="motivo" value="visita" checked> Agendar uma visita</label>
              <label><input type="radio" name="motivo" value="duvida"> Tirar dúvidas</label>
              <label><input type="radio" name="motivo" value="proposta"> Fazer uma proposta</label>
            </div></fieldset>
        </div>
        <div class="campo"><label for="c-nome">Seu nome</label><input id="c-nome" name="nome" autocomplete="name" required><span class="campo__erro" aria-live="polite"></span></div>
        <div class="campo campo--d"><label for="c-tel">WhatsApp com DDD</label><input id="c-tel" name="tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="(96) 9 0000-0000" required><span class="campo__erro" aria-live="polite"></span></div>
        <div class="campo" data-so-visita><label for="c-dia">Melhor dia</label><input id="c-dia" name="dia" type="date"><span class="campo__erro" aria-live="polite"></span></div>
        <div class="campo campo--d" data-so-visita>
          <fieldset><legend>Período</legend><div class="opcoes">
            <label><input type="radio" name="periodo" value="manhã" checked> Manhã</label>
            <label><input type="radio" name="periodo" value="tarde"> Tarde</label></div></fieldset>
        </div>
        <div class="campo campo--cheio"><label for="c-msg">Mensagem (opcional)</label><textarea id="c-msg" name="msg" rows="3" placeholder="Ex.: aceita financiamento? Tem vaga coberta?"></textarea></div>
        <div class="form__rodape">
          <label class="consentimento"><input type="checkbox" name="lgpd" required> <span>Concordo que a Paralelo Zero use meu nome e telefone só para responder sobre este imóvel. Nada de lista de spam.</span></label>
          <button class="btn" type="submit">${ICO.whatsapp}Enviar pelo WhatsApp</button>
        </div>
      </form>
    </section>

    <section class="bloco" aria-labelledby="t-parecidos">
      <h2 id="t-parecidos">Imóveis parecidos</h2>
      <div class="cards3" data-parecidos></div>
    </section>
  </div>

  <div class="barra-movel">
    <a class="btn" href="${whats(msgWhats)}" target="_blank" rel="noopener">${ICO.whatsapp}WhatsApp</a>
    <a class="btn btn--linha" href="#contato">Agendar visita</a>
  </div>`;

  /* galeria */
  const principal = main.querySelector("[data-foto-principal]");
  main.querySelectorAll("[data-foto]").forEach((b) => b.addEventListener("click", () => {
    const n = +b.dataset.foto, f = fotos[n];
    principal.src = foto(f.id, 1400, 933);
    principal.srcset = srcset(f.id, 1.5, [700, 1100, 1600]);
    principal.alt = `${im.titulo} — foto ${n + 1} de ${fotos.length}`;
    main.querySelectorAll("[data-foto]").forEach((x) => x.setAttribute("aria-current", x === b));
  }));

  /* planta + tabela de cômodos */
  const desenho = main.querySelector("[data-planta]"), tabela = main.querySelector("[data-comodos]");
  let kAtual = 0;
  function desenhar(animar) {
    const k = medirK(desenho);
    if (k === kAtual) return;
    kAtual = k;
    desenho.innerHTML = planta(im.planta, { k, rotulos: true, cotas: true, rotulo: `Planta de ${im.titulo}, ${fmt.m(im.planta.w)} por ${fmt.m(im.planta.h)} metros` });
    if (animar) desenharAoVer(desenho.querySelectorAll(".planta"));
  }
  desenhar(true);
  let t; window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => desenhar(false), 150); });

  const linhas = im.planta.lote
    ? `<tr><td><button type="button" data-i="0">Lote</button></td><td>${fmt.m(im.planta.w)} × ${fmt.m(im.planta.h)}</td><td>${fmt.n(im.area)} m²</td></tr>`
    : im.planta.comodos.map((c, n) => `<tr data-i="${n}"><td><button type="button" data-i="${n}">${esc(c.n)}</button></td><td>${fmt.m(c.w)} × ${fmt.m(c.h)}</td><td>${fmt.m(c.w * c.h)} m²</td></tr>`).join("");
  tabela.innerHTML = `<caption class="sr-only">Cômodos e medidas</caption>
    <thead><tr><th scope="col">Cômodo</th><th scope="col">Medidas (m)</th><th scope="col">Área</th></tr></thead>
    <tbody>${linhas}</tbody>
    <tfoot><tr><td>Total</td><td></td><td>${fmt.m2(im.area)}</td></tr></tfoot>`;
  const realce = (i, on) => {
    desenho.querySelectorAll(`.comodo[data-i="${i}"]`).forEach((g) => g.classList.toggle("destaque", on));
    tabela.querySelectorAll(`tr[data-i="${i}"]`).forEach((r) => r.classList.toggle("destaque", on));
  };
  const ligar = (raiz, sel) => {
    ["mouseover", "focusin"].forEach((ev) => raiz.addEventListener(ev, (e) => { const el = e.target.closest(sel); if (el) realce(el.dataset.i, true); }));
    ["mouseout", "focusout"].forEach((ev) => raiz.addEventListener(ev, (e) => { const el = e.target.closest(sel); if (el) realce(el.dataset.i, false); }));
  };
  ligar(tabela, "[data-i]");
  ligar(desenho, ".comodo");

  /* compartilhar */
  main.querySelector("[data-compartilhar]").addEventListener("click", async () => {
    const dados = { title: im.titulo, text: `${im.titulo} — ${fmt.brl(im.preco)}${aluguel ? "/mês" : ""}`, url: urlAbs };
    try {
      if (navigator.share) { await navigator.share(dados); return; }
      await navigator.clipboard.writeText(urlAbs);
      aviso("Link do imóvel copiado.");
    } catch (e) { if (e && e.name !== "AbortError") aviso("Não deu para copiar. Copie o endereço da barra do navegador."); }
  });

  /* mapa (Leaflet + OpenStreetMap) */
  const mapaEl = document.getElementById("mapa");
  if (window.L) {
    const mapa = L.map(mapaEl, { scrollWheelZoom: false, attributionControl: true }).setView([im.lat, im.lng], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap" }).addTo(mapa);
    L.circle([im.lat, im.lng], { radius: 220, color: "#a8432a", weight: 1.5, fillColor: "#a8432a", fillOpacity: 0.12 }).addTo(mapa);
  } else {
    mapaEl.innerHTML = `<p style="padding:20px;color:var(--nanquim-2)">Mapa indisponível agora. Bairro: ${esc(im.bairro)}, Macapá.</p>`;
  }

  /* formulário → WhatsApp */
  const form = main.querySelector("[data-form]");
  const dia = form.querySelector("#c-dia");
  const hoje = new Date(); hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
  dia.min = hoje.toISOString().slice(0, 10);
  const mostrarVisita = () => {
    const v = form.motivo.value === "visita";
    form.querySelectorAll("[data-so-visita]").forEach((c) => { c.hidden = !v; });
  };
  form.querySelectorAll('input[name="motivo"]').forEach((r) => r.addEventListener("change", mostrarVisita));
  const erro = (campo, msg) => {
    const c = campo.closest(".campo"), s = c.querySelector(".campo__erro");
    if (msg) { c.dataset.erro = ""; s.textContent = msg; campo.setAttribute("aria-invalid", "true"); }
    else { delete c.dataset.erro; s.textContent = ""; campo.removeAttribute("aria-invalid"); }
    return !msg;
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = form.nome.value.trim(), tel = form.tel.value.replace(/\D/g, ""), motivo = form.motivo.value;
    let ok = erro(form.nome, nome.length < 2 ? "Escreva seu nome para a gente saber com quem falar." : "");
    ok = erro(form.tel, tel.length < 10 || tel.length > 11 ? "Informe o número com DDD, por exemplo (96) 9 9999-0000." : "") && ok;
    if (motivo === "visita") ok = erro(dia, !dia.value ? "Escolha um dia para a visita." : dia.value < dia.min ? "Escolha uma data a partir de hoje." : "") && ok;
    if (!form.lgpd.checked) { ok = false; aviso("Marque a caixa de consentimento para enviar."); }
    if (!ok) { const p = form.querySelector("[aria-invalid=true]"); if (p) p.focus(); return; }
    const motivoTxt = { visita: "agendar uma visita", duvida: "tirar dúvidas", proposta: "fazer uma proposta" }[motivo];
    let texto = `Olá! Sou ${nome} e quero ${motivoTxt} sobre o imóvel ${im.codigo} — ${im.titulo}.`;
    if (motivo === "visita") texto += ` Melhor dia: ${new Date(dia.value + "T12:00").toLocaleDateString("pt-BR")}, de ${form.periodo.value}.`;
    if (form.msg.value.trim()) texto += ` ${form.msg.value.trim()}`;
    texto += ` Meu WhatsApp: ${tel}. ${urlAbs}`;
    window.open(whats(texto), "_blank", "noopener");
    aviso("Abrimos o WhatsApp com sua mensagem pronta.");
  });

  /* parecidos: mesma negociação, preço mais próximo */
  const parecidos = DADOS.filter((i) => i.codigo !== im.codigo && i.negociacao === im.negociacao)
    .sort((a, b) => Math.abs(Math.log(a.preco / im.preco)) - Math.abs(Math.log(b.preco / im.preco))).slice(0, 3);
  main.querySelector("[data-parecidos]").innerHTML = parecidos.map((i) => card(i)).join("");
})();
