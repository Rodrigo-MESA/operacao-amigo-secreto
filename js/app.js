(() => {
  "use strict";
  const C = CONFIG, $ = s => document.querySelector(s);
  const norm = s => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, "").toUpperCase();
  const normHora = s => norm(s).replace(/H/g, "");           // 19:48 / 19h48 / 1948 → 1948
  const fill = s => s.replace(/\{pessoa\}/g, C.pessoa).replace(/\{empresa\}/g, C.empresa);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const N = C.desafios.length;

  // ---------------------------------------------------------------- Estado persistente
  const KEY = "oas_state_v2", OLD_KEY = "oas_stage";
  const fresh = () => ({ v: 2, started: false, prova: 0, lant: { achadas: [] },
    arquivo: false, pistaDecod: false, fim1: false, fase2: false, p2: 0, revelado: false });
  const rd = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const wr = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const rm = k => { try { localStorage.removeItem(k); } catch (e) {} };
  let S = fresh();
  const save = () => wr(KEY, JSON.stringify(S));
  function load() {
    const raw = rd(KEY);
    if (raw) {
      try { const o = JSON.parse(raw); S = Object.assign(fresh(), o); S.lant = Object.assign(fresh().lant, o.lant || {}); }
      catch (e) { S = fresh(); }
    } else {                                   // migra o formato antigo (versão anterior da app)
      const old = rd(OLD_KEY);
      if (old === "arquivo" || old === "fase2") {
        Object.assign(S, { started: true, prova: N, arquivo: true });
        if (old === "fase2") Object.assign(S, { pistaDecod: true, fim1: true, fase2: true });
        save();
      }
      rm(OLD_KEY);
    }
    S.prova = Math.max(0, Math.min(N, +S.prova || 0)); S.p2 = Math.max(0, +S.p2 || 0);
    S.lant.achadas = Array.isArray(S.lant.achadas) ? S.lant.achadas.filter(Number.isInteger) : [];
  }

  // Atalhos de teste:  ?reset  apaga tudo · ?skip  salta para o fim da fase 1 · ?teste  mostra notas de programador
  const Q = new URLSearchParams(location.search);
  const TEST = Q.has("teste") || location.protocol === "file:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  if (Q.has("reset")) { rm(KEY); rm(OLD_KEY); }
  load();
  if (Q.has("skip")) { Object.assign(S, { started: true, prova: N, arquivo: true, pistaDecod: true, fim1: true }); save(); }
  if (Q.has("reset") || Q.has("skip") || Q.has("teste")) { try { history.replaceState(null, "", location.pathname); } catch (e) {} }

  // ---------------------------------------------------------------- Efeitos sonoros (gerados no browser, sem ficheiros)
  const SFX = (() => {
    let ctx = null, armed = false, muted = rd("oas_mute") === "1";
    ["pointerdown", "keydown", "touchstart"].forEach(ev => window.addEventListener(ev, () => { armed = true; }, { capture: true, passive: true }));
    const ac = () => {
      if (muted || !armed) return null;
      if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
      try { if (ctx.state === "suspended") ctx.resume(); } catch (e) {}
      return ctx;
    };
    function tone(f, at, dur, type, vol, f2) {
      const c = ac(); if (!c) return;
      try {
        const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
        o.type = type || "sine"; o.frequency.setValueAtTime(f, t);
        if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || .08, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + .03);
      } catch (e) {}
    }
    const seq = (notes, step, type, vol) => notes.forEach((f, i) => tone(f, i * step, step * 1.7, type, vol));
    const api = {
      isMuted: () => muted,
      toggle() { muted = !muted; wr("oas_mute", muted ? "1" : "0"); if (!muted) api.click(); return muted; },
      click: () => tone(520, 0, .05, "square", .022),
      tick: () => tone(1900, 0, .016, "square", .01),
      blip: () => tone(380 + Math.random() * 700, 0, .05, "square", .022),
      found: () => { tone(880, 0, .09, "sine", .09); tone(1320, .07, .16, "sine", .08); },
      ok: () => seq([523, 659, 784, 1047], .09, "triangle", .09),
      bad: () => { tone(190, 0, .18, "sawtooth", .06, 110); tone(150, .13, .24, "sawtooth", .055, 90); },
      stamp: () => { tone(120, 0, .18, "sine", .16, 45); tone(1300, 0, .03, "square", .025); },
      unlock: () => { seq([392, 523, 659, 784], .11, "triangle", .1); setTimeout(api.stamp, 480); },
      reveal: () => seq([523, 659, 784, 1047, 1319, 1568], .12, "triangle", .1)
    };
    return api;
  })();
  const sndBtn = $("#snd");
  const sndLabel = () => { sndBtn.textContent = SFX.isMuted() ? "SOM OFF" : "SOM ON"; sndBtn.classList.toggle("on", !SFX.isMuted()); sndBtn.setAttribute("aria-pressed", String(!SFX.isMuted())); };
  sndBtn.onclick = () => { SFX.toggle(); sndLabel(); };
  sndLabel();
  document.addEventListener("click", e => { const b = e.target.closest("button,summary"); if (b && b.id !== "snd") SFX.click(); });

  // ---------------------------------------------------------------- Utilitários de UI
  function show(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.toggle("on", s.id === id));
    window.scrollTo(0, 0);
    if (document.getElementById(id).querySelector(".stamp")) SFX.stamp();
  }
  let typeTok = 0;
  function type(el, text, speed, done) {
    const tok = ++typeTok;
    if (!speed) { el.textContent = text; if (done) done(); return; }
    el.textContent = ""; let i = 0;
    (function t() { if (tok !== typeTok) return; el.textContent = text.slice(0, ++i); if (i % 2 === 0) SFX.tick(); if (i < text.length) setTimeout(t, speed); else if (done) done(); })();
  }
  let busy = false;
  function overlay(stages, grant, done) {
    const ov = $("#overlay"), bar = $("#overlay i"), title = $("#ovTitle"), txt = $("#ovTxt"), g = $("#ovGrant");
    g.hidden = true; ov.classList.add("on"); let p = 0;
    const t = setInterval(() => {
      p = Math.min(100, p + 4); if (p % 8 === 0) SFX.blip(); bar.style.width = p + "%"; txt.textContent = p + "%";
      title.textContent = (stages.find(s => p <= s.ate) || stages[stages.length - 1]).t;
      if (p < 100) return;
      clearInterval(t);
      if (grant) { g.textContent = grant; g.hidden = false; SFX.unlock(); }
      setTimeout(() => { ov.classList.remove("on"); bar.style.width = "0"; g.hidden = true; done(); }, grant ? 1000 : 400);
    }, 70);
  }
  function confetti() {
    if (reduce) return;
    const box = $("#confetti"), cols = ["#d62839", "#ececec", "#8b8b93", "#ff5a6a"];
    for (let i = 0; i < 48; i++) {
      const e = document.createElement("i");
      e.style.cssText = `left:${Math.random() * 100}%;background:${cols[i % 4]};animation-delay:${Math.random() * .6}s;animation-duration:${2 + Math.random() * 1.8}s;transform:rotate(${Math.random() * 360}deg)`;
      box.appendChild(e);
    }
    setTimeout(() => { box.innerHTML = ""; }, 4800);
  }

  $("#topCase").textContent = "PROCESSO " + C.processo;
  $("#introCase").textContent = "Nº " + C.processo;
  $("#agent").textContent = C.pessoa.toUpperCase();
  $("#introText").textContent = fill(C.intro);
  $("#mystery").textContent = C.mensagemMisteriosa;
  $("#deliveryInfo").textContent = `${C.entrega.data} · ${C.entrega.hora} · ${C.entrega.local}`;

  // ---------------------------------------------------------------- Desafios
  let idx = 0;
  function addNext(card, i) {
    const last = i === N - 1;
    const n = document.createElement("button"); n.className = "btn"; n.id = "next"; n.textContent = last ? "Abrir arquivo" : "Próxima prova";
    n.onclick = () => { if (last) { S.arquivo = true; save(); openArchive(); } else renderCh(i + 1); };
    card.appendChild(n);
  }
  function finish(d) {
    const card = $("#chBody"), msg = $("#msg");
    msg.className = "msg good"; msg.textContent = d.sucesso;
    card.classList.add("ok");
    card.querySelectorAll("#ans,#check,button.opt").forEach(e => e.disabled = true);
    addNext(card, idx);
  }
  function renderCh(i) {
    idx = i;
    const d = C.desafios[i], body = $("#chBody"), solved = i < S.prova;
    $("#chStep").textContent = `PROVA ${i + 1} DE ${N}`;
    $("#chBar").style.width = ((solved ? i + 1 : i) / N * 100) + "%";
    body.className = "card";
    let h = `<h2>${esc(d.titulo)}</h2><p class="narr">${esc(d.intro)}</p>`;
    if (d.tipo === "cifra") h += `<div class="cipher">${esc(d.mensagemCodificada)}</div><p class="dim">${esc(d.dica)}</p>`;
    if (d.tipo === "documento") h += `<div class="paper" id="paper">${d.linhas.map(l => `<p>${esc(l)}</p>`).join("")}<p class="ink">${esc(d.textoOculto)}</p></div><button class="btn ghost" id="uv">Ligar luz UV</button>`;
    if (d.tipo === "lanterna") h += lanternaHTML(d);
    if (d.tipo === "escolha") h += `<div class="paper">${d.declaracoes.map(l => `<p>${esc(l)}</p>`).join("")}</div>`;
    h += `<p><b>${esc(d.pergunta || "Qual é a mensagem original?")}</b></p>`;
    if (d.tipo === "escolha") h += `<div class="opts">${d.opcoes.map((o, k) => `<button class="opt" data-i="${k}">${esc(o)}</button>`).join("")}</div>`;
    else h += `<input class="inp" id="ans" placeholder="Resposta" autocomplete="off" autocapitalize="characters"${d.teclado ? ` inputmode="${esc(d.teclado)}"` : ""}><button class="btn" id="check">Validar</button>`;
    h += `<p class="msg" id="msg" aria-live="polite"></p>`;
    body.innerHTML = h;
    if ($("#uv")) $("#uv").onclick = () => { const on = $("#paper").classList.toggle("uv"); $("#uv").textContent = on ? "Desligar luz UV" : "Ligar luz UV"; };
    if ($("#check")) {
      $("#check").onclick = () => {
        if (d.tipo === "lanterna" && new Set(S.lant.achadas).size < d.letras.length) { SFX.bad(); const m = $("#msg"); m.className = "msg bad"; m.textContent = "Ainda faltam marcas por encontrar no escuro."; return; }
        const v = norm($("#ans").value); verify(!!v && d.respostas.map(norm).includes(v));
      };
      $("#ans").onkeydown = e => { if (e.key === "Enter") $("#check").click(); };
    }
    body.querySelectorAll(".opt").forEach(b => b.onclick = () => verify(+b.dataset.i === d.correta));
    if (d.tipo === "lanterna") bindLanterna(d, solved);
    if (solved) {
      if (d.tipo === "escolha") body.querySelectorAll(".opt")[d.correta].classList.add("right"); else $("#ans").value = d.respostas[0];
      if (d.tipo === "documento") { $("#paper").classList.add("uv"); $("#uv").textContent = "Desligar luz UV"; }
      finish(d);
    }
  }
  function verify(ok) {
    const d = C.desafios[idx], msg = $("#msg"), card = $("#chBody");
    if (!ok) {
      SFX.bad(); msg.className = "msg bad"; msg.textContent = "Resposta incorreta. Tenta outra vez.";
      card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake"); return;
    }
    S.prova = Math.max(S.prova, idx + 1); save(); SFX.ok();
    $("#chBar").style.width = ((idx + 1) / N * 100) + "%";
    finish(d);
  }
  function startCh() { renderCh(Math.min(S.prova, N - 1)); show("s-case"); }
  $("#start").onclick = () => { S.started = true; save(); startCh(); };
  $("#back").onclick = () => { if (idx > 0) renderCh(idx - 1); else { updateIntro(); show("s-intro"); } };
  function updateIntro() { $("#start").textContent = S.started ? "Continuar investigação" : "Iniciar investigação"; }

  // ---------------------------------------------------------------- Prova 3 · Lanterna
  function lanternaHTML(d) {
    return `<p class="dim">${esc(d.ajuda)}</p>
      <div class="stage" id="lStage"><div class="desk"></div><div class="shelf s1"></div><div class="shelf s2"></div><div class="floor"></div>
        ${d.letras.map((l, i) => `<button class="mk" data-i="${i}" style="left:${l.x}%;top:${l.y}%" tabindex="-1" aria-label="Marca ${l.n}"><b>${esc(l.c)}</b><sup>${l.n}</sup></button>`).join("")}
        <div class="dark"></div></div>
      <div class="tray" id="lTray"></div>`;
  }
  function bindLanterna(d, solved) {
    const st = $("#lStage"), L = d.letras, found = new Set(S.lant.achadas.filter(i => L[i]));
    const R = Math.max(62, Math.min(100, (st.clientWidth || 320) * .2));
    let x = (st.clientWidth || 320) / 2, y = (st.clientHeight || 260) / 2;
    const light = () => { st.style.setProperty("--x", x + "px"); st.style.setProperty("--y", y + "px"); st.style.setProperty("--r", R + "px"); };
    function tray() {
      $("#lTray").innerHTML = [...L].sort((a, b) => a.n - b.n).map(l => { const i = L.indexOf(l);
        return `<span class="slot${found.has(i) ? " on" : ""}"><small>${l.n}</small>${found.has(i) ? esc(l.c) : "?"}</span>`; }).join("") +
        `<span class="mono dim cnt">${found.size}/${L.length}</span>`;
      st.querySelectorAll(".mk").forEach(b => b.classList.toggle("got", found.has(+b.dataset.i)));
    }
    light(); tray();
    if (solved) { L.forEach((l, i) => found.add(i)); tray(); st.classList.add("lit"); return; }
    const move = e => { const r = st.getBoundingClientRect(); x = e.clientX - r.left; y = e.clientY - r.top - (e.pointerType === "touch" ? 40 : 0); light(); };
    st.addEventListener("pointermove", move);
    st.addEventListener("pointerdown", e => {
      move(e); const w = st.clientWidth || 320, h = st.clientHeight || 260;
      const antes = found.size;
      L.forEach((l, i) => { if (!found.has(i) && Math.hypot(l.x / 100 * w - x, l.y / 100 * h - y) <= R * .6) found.add(i); });
      if (found.size > antes) SFX.found();
      S.lant.achadas = [...found]; save(); tray();
    });
  }

  // ---------------------------------------------------------------- Arquivo
  function openArchive() {
    const a = C.arquivo;
    $("#suspects").innerHTML = a.suspeitos.map(s => `<div class="suspect"><div class="silh"></div><b class="mono">${esc(s.id)}</b><span>${esc(s.alcunha)}</span><em class="st">${esc(s.estado)}</em></div>`).join("");
    $("#docs").innerHTML = a.documentos.map((d, i) => `<details class="card" open><summary><span class="mono red">PISTA ${i + 1}</span> · ${esc(d.titulo)}</summary><p>${esc(d.texto)}</p></details>`).join("");
    $("#clueLbl").textContent = `PISTA ${a.documentos.length + 1} · NOVA PISTA`;
    $("#clueText").textContent = S.pistaDecod ? a.novaPista : "████████████";
    $("#decode").hidden = S.pistaDecod; $("#toFinal").hidden = !S.pistaDecod;
    show("s-archive");
  }
  $("#decode").onclick = () => {
    $("#decode").hidden = true;
    type($("#clueText"), C.arquivo.novaPista, 28, () => { S.pistaDecod = true; save(); SFX.found(); $("#toFinal").hidden = false; });
  };
  $("#toFinal").onclick = () => { S.fim1 = true; save(); showFinal(); };

  // ---------------------------------------------------------------- Fim da fase 1 + código
  function showFinal() {
    $("#finBack").textContent = S.arquivo ? "← Rever arquivo" : "← Voltar";
    show("s-final");
  }
  $("#finBack").onclick = () => { if (S.arquivo) openArchive(); else { updateIntro(); show("s-intro"); } };
  $("#unlock").onclick = () => {
    if (busy) return;
    const m = $("#codeMsg");
    if (norm($("#code").value) !== norm(C.codigoFase2)) { SFX.bad(); m.className = "msg bad"; m.textContent = "Código inválido. Acesso negado."; return; }
    m.textContent = ""; busy = true;
    S.fase2 = true; S.p2 = 0; S.revelado = false; save();
    overlay([{ ate: 34, t: "A VALIDAR CÓDIGO" }, { ate: 70, t: "A DESENCRIPTAR ARQUIVO" }, { ate: 100, t: "A ABRIR PROCESSO CONFIDENCIAL" }],
      "ACESSO CONCEDIDO", () => { busy = false; renderP2(); show("s-p2"); });
  };
  $("#code").onkeydown = e => { if (e.key === "Enter") $("#unlock").click(); };

  // ---------------------------------------------------------------- Fase 2
  const PH = "████████████";
  const GOAL = `<svg class="goal" viewBox="0 0 240 110" aria-hidden="true"><defs><pattern id="net" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="#8b8b93" stroke-opacity=".4"/></pattern></defs><rect x="20" y="14" width="200" height="82" fill="url(#net)"/><path d="M20 96V14H220V96" fill="none" stroke="#d62839" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><line x1="6" y1="98" x2="234" y2="98" stroke="#2b2b30" stroke-width="3"/><circle cx="178" cy="46" r="10" fill="#ececec"/><path d="M178 36l5 5-2 6h-6l-2-6z" fill="#0b0b0c"/></svg>`;
  function clueCard(p, i, done) {
    const vis = p.visual === "baliza" ? GOAL
      : p.visual === "foto" ? `<figure class="polaroid"><div class="photo${done ? "" : " blur"}" id="photo${i}"></div><figcaption>${esc(C.fase2.foto.legenda)}</figcaption></figure>` : "";
    return `<div class="card clue" id="pc${i}"><p class="mono dim">${esc(p.etiqueta)}</p>${vis}<p class="decode" id="pt${i}">${done ? esc(p.texto) : PH}</p><p class="mono dim small" id="pl${i}"${done && p.ligacao ? "" : " hidden"}>${esc(p.ligacao || "")}</p><button class="btn ghost" data-i="${i}"${done ? " hidden" : ""}>Descodificar</button></div>`;
  }
  function loadPhoto(box) {
    const f = C.fase2.foto, img = new Image(); let k = 0; img.alt = "Fotografia confidencial";
    img.onload = () => { box.innerHTML = ""; box.appendChild(img); };
    img.onerror = () => {
      if (++k < f.extensoes.length) { img.src = f.base + "." + f.extensoes[k]; return; }
      box.innerHTML = `<div class="silh big"></div><p class="mono">FOTOGRAFIA CLASSIFICADA</p>` +
        (TEST ? `<p class="mono dev">[TESTE] Falta a foto. Coloca-a em ${esc(f.base)}.jpg</p>` : "");
    };
    img.src = f.base + "." + f.extensoes[0];
  }
  function renderP2() {
    const ps = C.fase2.pistas, vis = Math.min(S.p2 + 1, ps.length), list = $("#p2List");
    $("#p2Title").textContent = C.fase2.titulo; $("#p2Intro").textContent = C.fase2.intro;
    list.innerHTML = ps.slice(0, vis).map((p, i) => clueCard(p, i, i < S.p2)).join("");
    list.querySelectorAll("button[data-i]").forEach(b => b.onclick = () => decodeClue(+b.dataset.i, b));
    list.querySelectorAll(".photo").forEach(loadPhoto);
    updateP2Next(false);
  }
  function decodeClue(i, btn) {
    const p = C.fase2.pistas[i]; btn.hidden = true;
    type($("#pt" + i), p.texto, 28, () => {
      S.p2 = Math.max(S.p2, i + 1); save(); SFX.found();
      if (p.ligacao) $("#pl" + i).hidden = false;
      const ph = $("#photo" + i); if (ph) ph.classList.remove("blur");
      updateP2Next(true);
    });
  }
  function updateP2Next(justDecoded) {
    const b = $("#p2Next"), n = C.fase2.pistas.length; b.hidden = true;
    if (S.p2 >= n) { b.textContent = S.revelado ? "Ver revelação" : "Revelar identidade"; b.dataset.m = "reveal"; b.hidden = false; }
    else if (justDecoded) { b.textContent = "Próxima pista"; b.dataset.m = "next"; b.hidden = false; }
  }
  $("#p2Next").onclick = () => {
    const m = $("#p2Next").dataset.m;
    if (m === "next") { renderP2(); const c = $("#pc" + (S.p2)); if (c && c.scrollIntoView) c.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); return; }
    if (S.revelado) return showReveal(false);
    if (busy) return; busy = true;
    overlay([{ ate: 100, t: "A DESCODIFICAR IDENTIDADE" }], null, () => { busy = false; showReveal(true); });
  };

  // ---------------------------------------------------------------- Revelação
  function showReveal(animate) {
    S.revelado = true; save();
    $("#revTitle").textContent = C.final.titulo; $("#revSign").textContent = ""; $("#revBack").hidden = true;
    const box = $("#revText"); box.innerHTML = ""; show("s-reveal");
    const ps = C.final.texto.map(t => {
      const it = typeof t === "string" ? { texto: t } : t, p = document.createElement("p");
      if (it.destaque) p.className = "hl"; box.appendChild(p); return [p, it];
    });
    (function next(i) {
      if (i >= ps.length) { $("#revSign").textContent = C.final.assinatura; $("#revBack").hidden = false; return; }
      const [p, it] = ps[i];
      type(p, it.texto, animate ? 30 : 0, () => {
        if (it.destaque && animate) { confetti(); SFX.reveal(); }
        if (animate) setTimeout(() => next(i + 1), 350); else next(i + 1);
      });
    })(0);
  }
  $("#revBack").onclick = () => { renderP2(); show("s-p2"); };

  // ---------------------------------------------------------------- Arranque (retoma onde ficou)
  updateIntro();
  if (S.fase2) { if (S.revelado) showReveal(false); else { renderP2(); show("s-p2"); } }
  else if (S.fim1) showFinal();
  else if (S.arquivo) openArchive();
  else if (S.started) startCh();
})();
