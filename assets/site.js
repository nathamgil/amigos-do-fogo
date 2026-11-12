/* Amigos do Fogo — site público v2 (index + boutique). Lê tudo de dados.js (window.AF).
   Cena da capa: o mapa de cortes do boi se separa com a rolagem (GSAP + ScrollTrigger do cdnjs).
   Sem GSAP ou com prefers-reduced-motion: boi já separado e etiquetas em fila, sem seção presa. */
(function () {
  'use strict';
  var AF = window.AF; if (!AF) return;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; }
  var CASA = AF.casa();
  if (CASA.whatsapp === AF.CASA.whatsapp && $('#aviso-demo')) $('#aviso-demo').hidden = false;

  var reduz = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var temGsap = !reduz && window.gsap && window.ScrollTrigger;

  /* ---------- desenho do boi: silhueta + peças (cada peça leva o próprio recorte, então pode sair do lugar) ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  var SILHUETA = 'M60,128 L92,96 L112,108 L150,104 L178,70 L215,58 L252,66 L470,64 L530,72 L572,92 L580,150 L572,210 L566,312 L540,312 L532,236 L500,262 L440,272 L262,276 L246,268 L236,312 L208,312 L200,256 L168,232 L140,196 L104,170 L72,170 L50,150 Z';
  var CENTRO = [330, 180];
  function sv(t, at) { var n = document.createElementNS(NS, t); for (var k in at) n.setAttribute(k, at[k]); return n; }
  function centro(pts) {
    var xs = pts.split(' ').map(function (q) { return q.split(',').map(Number); });
    return [xs.reduce(function (s, q) { return s + q[0]; }, 0) / xs.length, xs.reduce(function (s, q) { return s + q[1]; }, 0) / xs.length];
  }
  function montaBoi(svg, px, opts) {
    var defs = sv('defs', {});
    defs.appendChild(sv('path', { id: px + '-sil', d: SILHUETA }));
    var cc = sv('clipPath', { id: px + '-corpo' }); cc.appendChild(sv('use', { href: '#' + px + '-sil' })); defs.appendChild(cc);
    svg.appendChild(defs);
    svg.appendChild(sv('use', { href: '#' + px + '-sil', 'class': 'fantasma' }));
    var pecas = {};
    AF.GUIA.forEach(function (g) {
      var cz = sv('clipPath', { id: px + '-z-' + g.id }); cz.appendChild(sv('polygon', { points: g.pts })); defs.appendChild(cz);
      var c = centro(g.pts), vx = c[0] - CENTRO[0], vy = c[1] - CENTRO[1], m = Math.sqrt(vx * vx + vy * vy) || 1;
      var w = opts.href ? sv('a', { href: opts.href(g), 'class': 'peca', 'data-id': g.id, 'aria-label': g.nome + ': ver a ficha na boutique' })
        : sv('g', { 'class': 'peca', 'data-id': g.id, tabindex: '0', role: 'button', 'aria-label': g.nome });
      var mov = sv('g', { 'class': 'peca-mov' });
      var corpo = sv('g', { 'clip-path': 'url(#' + px + '-corpo)' });
      corpo.appendChild(sv('polygon', { points: g.pts, 'class': 'zona' }));
      corpo.appendChild(sv('polygon', { points: g.pts, 'class': 'quente' }));
      mov.appendChild(corpo);
      var borda = sv('g', { 'clip-path': 'url(#' + px + '-z-' + g.id + ')' });
      borda.appendChild(sv('use', { href: '#' + px + '-sil', 'class': 'contorno' }));
      mov.appendChild(borda);
      var t = sv('text', { x: c[0].toFixed(0), y: (c[1] + 6).toFixed(0), 'text-anchor': 'middle', 'aria-hidden': 'true' });
      t.textContent = g.nome.split(/[ /]/)[0]; mov.appendChild(t);
      w.appendChild(mov); svg.appendChild(w);
      pecas[g.id] = { el: w, mov: mov, quente: $('.quente', mov), vx: vx / m, vy: vy / m };
      if (opts.separa) mov.setAttribute('transform', 'translate(' + (vx / m * opts.separa).toFixed(1) + ' ' + (vy / m * opts.separa).toFixed(1) + ')');
    });
    return pecas;
  }
  function guia(id) { return AF.GUIA.filter(function (x) { return x.id === id; })[0]; }

  /* ================= INDEX — capa: mapa de cortes de açougue que explode ================= */
  /* Boi de perfil (cabeça à esquerda). Os cortes são polígonos que dividem a tela inteira usando
     os MESMOS vértices nas bordas vizinhas (encaixe de quebra-cabeça, sem buraco); cada peça é
     recortada pela silhueta, então mostra a forma real do corte e leva o recorte junto quando sai. */
  var boiCapa = $('#boi-capa');
  if (boiCapa) {
    var SIL_CAPA = 'M34,206 Q26,188 42,174 L84,148 Q96,138 106,130 Q98,104 110,82 Q116,108 128,122 L140,126 Q154,114 160,118 Q158,130 148,138 ' +
      'L176,128 L205,114 L226,106 Q252,74 280,96 Q294,108 310,114 L420,112 L560,110 L640,114 Q690,112 712,128 Q734,150 730,210 Q726,262 712,292 ' +
      'L706,340 L712,398 L716,428 L716,440 L690,440 L690,428 L684,380 L668,340 Q652,316 628,318 Q560,330 470,332 Q380,334 306,326 ' +
      'L298,342 L294,400 L298,428 L298,440 L268,440 L268,428 L262,380 L246,336 Q218,322 200,302 Q172,284 152,264 L130,248 Q102,240 74,234 Q48,230 38,220 Z';
    var RABO = 'M712,130 Q750,170 744,262 Q740,300 746,334 M746,334 Q728,360 738,388 Q746,374 752,388 Q764,360 746,334 Z';
    var V = { T0: [0, 0], A: [160, 0], A1: [162, 134], A2: [154, 192], A3: [136, 252], A35: [130, 322], A4: [124, 480], B0: [0, 480],
      N0: [228, 0], N1: [228, 100], N2: [224, 170], N3: [212, 234], C1: [258, 134], C2: [300, 128], K0: [300, 0], Kx: [303, 178], K2: [306, 205], K3: [304, 262],
      P1: [250, 262], M1: [222, 322], M2: [306, 318], MB: [306, 480], S1: [352, 186], R0: [395, 0], R1: [408, 184], F0: [470, 178], S2: [545, 170], V0: [530, 0],
      G0: [346, 272], G1: [392, 278], F1: [472, 272], Fm: [464, 225], F15: [478, 322], F2: [486, 480], Q1: [552, 262],
      T6: [670, 0], Pi1: [668, 140], Al1: [664, 255], Z3: [654, 332], Z4: [644, 480], T7: [800, 0], H2: [800, 332], B7: [800, 480] };
    /* id = do GUIA (tem ficha na boutique) ou peça só do mapa (sem link). r = nome girado (perna). */
    var CORTES = [
      { id: 'cabeca', nome: 'Cabeça', v: 'T0 A A1 A2 A3 A35 A4 B0', l: [92, 204], f: 19 },
      { id: 'pescoco', nome: 'Pescoço', v: 'A N0 N1 N2 N3 A3 A2 A1', l: [187, 196], f: 14 },
      { id: 'cupim', v: 'N0 K0 C2 C1 N1', l: [266, 116], f: 17 },
      { id: 'paleta', nome: 'Paleta', v: 'N1 C1 C2 Kx K2 K3 P1 N3 N2', l: [262, 200], f: 20 },
      { id: 'peito', nome: 'Peito', v: 'A3 N3 P1 K3 M2 M1 A35', l: [250, 294], f: 18 },
      { id: 'musculo-d', nome: 'Músculo', v: 'A35 M1 M2 MB A4', l: [281, 392], f: 15, r: 1 },
      { id: 'ancho', v: 'K0 R0 R1 S1 Kx C2', l: [352, 152], f: 21 },
      { id: 'contrafile', nome: 'Contrafilé', v: 'R0 V0 S2 F0 R1', l: [470, 146], f: 18 },
      { id: 'costela', v: 'Kx S1 R1 F0 Fm F1 G1 G0 K3 K2', l: [392, 232], f: 22 },
      { id: 'file', nome: 'Filé', v: 'F0 S2 Q1 F1 Fm', l: [510, 222], f: 17 },
      { id: 'picanha', v: 'V0 T6 Pi1 S2', l: [602, 138], f: 20 },
      { id: 'alcatra', nome: 'Alcatra', v: 'S2 Pi1 Al1 Q1', l: [606, 212], f: 18 },
      { id: 'coxao', nome: 'Coxão', v: 'T6 T7 H2 Z3 Al1 Pi1', l: [692, 228], f: 18 },
      { id: 'ponta', nome: 'Ponta de agulha', v: 'K3 G0 G1 F1 F15 F2 MB M2', l: [392, 304], f: 16 },
      { id: 'fraldinha', v: 'F1 Q1 Al1 Z3 Z4 F2 F15', l: [568, 298], f: 18 },
      { id: 'musculo-t', nome: 'Músculo', v: 'Z3 H2 B7 Z4', l: [698, 392], f: 15, r: 1 }
    ];
    var CENTRO_CAPA = [400, 250], DESTAQUE = ['cupim', 'ancho', 'picanha', 'costela', 'fraldinha'];
    var SEPARA = window.innerWidth < 700 ? 30 : 44;

    var defs = sv('defs', {});
    defs.appendChild(sv('path', { id: 'cp-sil', d: SIL_CAPA }));
    var cc = sv('clipPath', { id: 'cp-corpo' }); cc.appendChild(sv('use', { href: '#cp-sil' })); defs.appendChild(cc);
    boiCapa.appendChild(defs);
    var pecas = {}, ordem = [];
    CORTES.forEach(function (c) {
      var g = guia(c.id), nome = c.nome || (g && g.nome.split(/[ /]/)[0]);
      var pts = c.v.split(' ').map(function (k) { return V[k].join(','); }).join(' ');
      var cz = sv('clipPath', { id: 'cp-z-' + c.id }); cz.appendChild(sv('polygon', { points: pts })); defs.appendChild(cz);
      var w = g ? sv('a', { href: 'boutique.html?corte=' + c.id + '#guia', 'class': 'peca', 'data-id': c.id, 'aria-label': g.nome + ': ver a ficha na boutique' })
        : sv('g', { 'class': 'peca peca-mapa', 'data-id': c.id, 'aria-hidden': 'true' });
      var mov = sv('g', { 'class': 'peca-mov' });
      if (c.id === 'coxao') mov.appendChild(sv('path', { d: RABO, 'class': 'rabo' })); /* o rabo sai junto com o coxão */
      var corpo = sv('g', { 'clip-path': 'url(#cp-corpo)' });
      corpo.appendChild(sv('polygon', { points: pts, 'class': 'zona' }));
      corpo.appendChild(sv('polygon', { points: pts, 'class': 'quente' }));
      mov.appendChild(corpo);
      var borda = sv('g', { 'clip-path': 'url(#cp-z-' + c.id + ')' }); borda.appendChild(sv('use', { href: '#cp-sil', 'class': 'contorno' })); mov.appendChild(borda);
      var t = sv('text', { x: c.l[0], y: (c.l[1] + c.f * .35).toFixed(1), 'text-anchor': 'middle', 'font-size': c.f, 'aria-hidden': 'true' });
      if (c.r) t.setAttribute('transform', 'rotate(-90 ' + c.l[0] + ' ' + c.l[1] + ')');
      t.textContent = nome; mov.appendChild(t);
      w.appendChild(mov); boiCapa.appendChild(w);
      var vx = c.l[0] - CENTRO_CAPA[0], vy = c.l[1] - CENTRO_CAPA[1], m = Math.sqrt(vx * vx + vy * vy) || 1;
      pecas[c.id] = { el: w, mov: mov, quente: $('.quente', mov), vx: vx / m, vy: vy / m, rot: (vx < 0 ? -1 : 1) * (2 + (Math.abs(vy) / m) * 4), o: c.l[0] + ' ' + c.l[1] };
      ordem.push(c.id);
      if (!temGsap) mov.setAttribute('transform', 'translate(' + (vx / m * SEPARA).toFixed(1) + ' ' + (vy / m * SEPARA).toFixed(1) + ')');
    });

    var etqs = $('#etiquetas');
    DESTAQUE.forEach(function (id) {
      var g = guia(id); if (!g) return;
      var t = el('article', 'etq' + (g.foto ? '' : ' sem-foto')); t.setAttribute('data-id', id);
      if (g.foto) { var im = el('img'); im.src = g.foto; im.alt = g.nome; im.width = 84; im.height = 104; t.appendChild(im); }
      var tx = el('div');
      tx.appendChild(el('small', null, 'Padrão Amigos do Fogo'));
      tx.appendChild(el('b', null, g.nome));
      tx.appendChild(el('p', null, g.frase || g.onde));
      var l = el('a', null, 'Ver a ficha →'); l.href = 'boutique.html?corte=' + id + '#guia'; tx.appendChild(l);
      t.appendChild(tx); etqs.appendChild(t);
    });

    if (temGsap) {
      var gsap = window.gsap, ST = window.ScrollTrigger;
      gsap.registerPlugin(ST);
      ST.config({ ignoreMobileResize: true });
      document.documentElement.classList.add('cena');
      var movs = ordem.map(function (id) { return pecas[id].mov; });
      movs.forEach(function (m, i) { gsap.set(m, { svgOrigin: pecas[ordem[i]].o }); });
      var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#mapa', start: 'top top', end: 'bottom bottom', scrub: .5 } });
      /* 1) o boi inteiro já está na tela; rolando, as peças se afastam do centro (vista explodida) */
      tl.fromTo('.rola-dica', { autoAlpha: 1 }, { autoAlpha: 0, duration: .05 }, .02)
        .fromTo(movs, { x: 0, y: 0, rotation: 0, scale: 1 }, {
          x: function (i) { return pecas[ordem[i]].vx * SEPARA; }, y: function (i) { return pecas[ordem[i]].vy * SEPARA; },
          rotation: function (i) { return pecas[ordem[i]].rot; }, duration: .2, ease: 'power2.inOut', stagger: .004 }, .03);
      /* 2) um corte por vez cresce, acende e mostra a etiqueta de açougue */
      $$('.etq', etqs).forEach(function (t, k) {
        var p = pecas[t.getAttribute('data-id')], s = .3 + k * .12, rot = k % 2 ? 2.5 : -2;
        tl.to(p.mov, { scale: 1.22, x: p.vx * SEPARA * 1.6, y: p.vy * SEPARA * 1.6, rotation: 0, duration: .04 }, s)
          .fromTo(p.quente, { opacity: 0 }, { opacity: .9, duration: .03 }, s)
          .fromTo(t, { autoAlpha: 0, y: 50, rotation: rot * 3 }, { autoAlpha: 1, y: k * 5, rotation: rot, duration: .05 }, s + .01)
          .to(p.mov, { scale: 1, x: p.vx * SEPARA, y: p.vy * SEPARA, rotation: p.rot, duration: .04 }, s + .09)
          .to(p.quente, { opacity: 0, duration: .03 }, s + .09);
      });
      /* 3) peças ficam afastadas: "toque num corte" */
      tl.fromTo('.mapa-acoes', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .04 }, .92).to({}, { duration: .04 }, .96);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
    }
  }

  /* ---------- frase da casa acende com a rolagem ---------- */
  var frase = $('#frase');
  if (frase) {
    var pend = false;
    var rola = function () {
      pend = false;
      var h = window.innerHeight, r = frase.getBoundingClientRect(), p = Math.min(1, Math.max(0, (h * .8 - r.top) / (r.height + h * .2)));
      var ws = frase.children, n = reduz ? ws.length : Math.ceil(p * ws.length);
      for (var i = 0; i < ws.length; i++) ws[i].classList.toggle('on', i < n);
    };
    window.addEventListener('scroll', function () { if (!pend) { pend = true; requestAnimationFrame(rola); } }, { passive: true });
    window.addEventListener('resize', rola);
    rola();
  }

  function chip(nome, tipo, valor, txt, marcado) {
    var l = el('label'), i = el('input'); i.type = tipo; i.name = nome; i.value = valor; i.checked = !!marcado;
    l.appendChild(i); l.appendChild(el('span', null, txt)); return l;
  }

  /* ================= ORÇAMENTO (comanda) ================= */
  var form = $('#form-orc');
  if (form) {
    var tipos = $('#o-tipos'), itens = $('#o-itens');
    AF.TIPOS_EVENTO.forEach(function (t, i) { tipos.appendChild(chip('tipo', 'radio', t.id, t.nome, i === 0)); });
    ['Carnes', 'Acompanhamentos'].forEach(function (g) {
      itens.appendChild(el('p', 'grupo-rot', g));
      var box = el('div', 'chips');
      AF.BUFFET.filter(function (b) { return b.grupo === g; }).forEach(function (b) { box.appendChild(chip('itens', 'checkbox', b.id, b.nome, false)); });
      itens.appendChild(box);
    });
    $('#o-data').min = AF.soma(AF.hoje(), 1);
    var dados = function () {
      return {
        data: $('#o-data').value, hora: $('#o-hora').value,
        adultos: +$('#o-adultos').value || 0, criancas: +$('#o-criancas').value || 0,
        tipo: (form.querySelector('input[name=tipo]:checked') || {}).value || 'outro',
        itens: $$('input[name=itens]:checked', form).map(function (i) { return i.value; }),
        local: $('#o-local').value.trim(),
        churrasqueiro: (form.querySelector('input[name=churras]:checked') || {}).value || 'naosei',
        nome: $('#o-nome').value.trim(), tel: $('#o-tel').value.trim(), obs: $('#o-obs').value.trim()
      };
    };
    var atualiza = function () {
      var o = dados();
      $('#o-kg').textContent = AF.kgTxt(AF.kgCarne(o.adultos, o.criancas)) + ' kg';
      $('#o-previa').textContent = AF.mensagemOrcamento(o);
    };
    form.addEventListener('input', atualiza); form.addEventListener('change', atualiza);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var o = dados(), erro = $('#o-erro');
      if (!o.data) { erro.textContent = 'Falta a data do evento (passo 1).'; $('#o-data').focus(); return; }
      if (!o.adultos) { erro.textContent = 'Quantas pessoas? (passo 2)'; $('#o-adultos').focus(); return; }
      if (!o.nome) { erro.textContent = 'Bota seu nome no passo 6 pra gente saber com quem fala.'; $('#o-nome').focus(); return; }
      erro.textContent = '';
      AF.addOrcamento(o);
      window.open(AF.linkWa(AF.mensagemOrcamento(o)), '_blank', 'noopener');
    });
    atualiza();
  }

  /* ---------- almoço: o primeiro grande, o resto na bandeja ---------- */
  var ag = $('#almoco-grade');
  if (ag) {
    AF.almoco().filter(function (a) { return a.ativo; }).forEach(function (a, i) {
      var f = el('figure', 'prato' + (i === 0 ? ' grande' : ''));
      if (a.foto) { var im = el('img'); im.src = a.foto; im.alt = a.nome; im.loading = 'lazy'; f.appendChild(im); }
      var c = el('figcaption'); c.appendChild(el('h3', null, a.nome)); if (a.desc) c.appendChild(el('p', null, a.desc)); f.appendChild(c);
      ag.appendChild(f);
    });
    $('#almoco-horario').textContent = CASA.horario ? 'Horário: ' + CASA.horario : 'Dias e horário do almoço: confirme no WhatsApp antes de vir.';
    $('#almoco-zap').href = AF.linkWa('Fala, Amigos do Fogo! Qual o almoço de hoje? Tem costela?');
  }
  if ($('#rod-cidade') && CASA.endereco) $('#rod-cidade').textContent = CASA.endereco + ' · Salvador · Bahia';

  /* ================= BOUTIQUE ================= */
  var boi = $('#boi');
  if (boi) {
    var kit = [], atual = null;
    var barra = $('#kit-barra'), pes = $('#kit-pessoas'), info = $('#corte-info'), lista = $('#cortes-lista'), vit = $('#vitrine');
    var noKit = function (n) { return kit.indexOf(n) >= 0; };
    var kitAtualiza = function () {
      barra.hidden = !kit.length;
      $('#kit-resumo').textContent = kit.length + (kit.length === 1 ? ' item' : ' itens') + ' no kit: ' + kit.join(', ');
      var n = +pes.value || 0;
      $('#kit-zap').href = AF.linkWa('Fala, Amigos do Fogo! Quero montar um kit de churrasco pra ' + n + ' pessoas (uns ' + AF.kgTxt(AF.kgCarne(n, 0)) + ' kg de carne).\n\nNo kit: ' + kit.join(', ') + '\n\nO que vocês têm essa semana?');
    };
    var poeKit = function (nome, sim) {
      kit = kit.filter(function (k) { return k !== nome; }); if (sim) kit.push(nome);
      $$('input[type=checkbox]', vit).forEach(function (i) { if (i.value === nome) i.checked = sim; });
      if (atual && guia(atual).nome === nome) mostra(atual);
      kitAtualiza();
    };
    pes.addEventListener('input', kitAtualiza);

    /* ficha do corte */
    var mostra = function (id, rolar) {
      var g = guia(id); if (!g) return;
      atual = id;
      info.innerHTML = '';
      var et = el('div', 'etiqueta');
      et.appendChild(el('small', null, 'Ficha do corte · Padrão Amigos do Fogo'));
      et.appendChild(el('h3', null, g.nome));
      if (g.foto) { var im = el('img'); im.src = g.foto; im.alt = g.nome; et.appendChild(im); }
      if (g.frase) et.appendChild(el('p', 'frase-corte', g.frase));
      var dl = el('dl');
      [['Onde fica', g.onde], ['No fogo', g.fogo], ['Ponto', g.ponto]].forEach(function (p) { dl.appendChild(el('dt', null, p[0])); dl.appendChild(el('dd', null, p[1])); });
      et.appendChild(dl);
      var ac = el('div', 'acoes');
      var tem = noKit(g.nome);
      var b = el('button', 'bt bt-mini ' + (tem ? 'bt-contorno' : 'bt-tinta'), tem ? 'Tirar do kit' : 'Pôr no kit'); b.type = 'button';
      b.addEventListener('click', function () { poeKit(g.nome, !noKit(g.nome)); });
      ac.appendChild(b);
      var z = el('a', 'bt bt-mini bt-contorno', 'Perguntar se tem'); z.href = AF.linkWa('Fala, Amigos do Fogo! Tem ' + g.nome.toLowerCase() + ' essa semana?'); z.target = '_blank'; z.rel = 'noopener';
      ac.appendChild(z); et.appendChild(ac);
      info.appendChild(et);
      $$('.peca', boi).forEach(function (p) { p.classList.toggle('ativa', p.getAttribute('data-id') === id); });
      $$('button', lista).forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-id') === id)); });
      if (rolar && window.innerWidth < 900) info.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'start' });
    };
    var pecasG = montaBoi(boi, 'gd', { separa: 10 });
    Object.keys(pecasG).forEach(function (id) {
      var p = pecasG[id].el;
      p.addEventListener('click', function () { mostra(id, true); });
      p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mostra(id, true); } });
    });
    AF.GUIA.forEach(function (g) {
      var b = el('button', null, g.nome); b.type = 'button'; b.setAttribute('data-id', g.id); b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { mostra(g.id, true); }); lista.appendChild(b);
    });

    /* balcão (vitrine em fila) */
    AF.boutique().forEach(function (b) {
      var c = el('article', 'peca' + (b.foto ? '' : ' sem-foto'));
      if (b.foto) { var im = el('img'); im.src = b.foto; im.alt = b.nome; im.loading = 'lazy'; c.appendChild(im); }
      var et = el('div', 'etiqueta'); et.appendChild(el('small', null, b.cat)); et.appendChild(el('b', null, b.nome));
      et.appendChild(el('p', null, b.desc));
      if (!b.disponivel) et.appendChild(el('p', 'em-falta', 'Em falta esta semana'));
      c.appendChild(et);
      if (b.disponivel) {
        var l = el('label'), i = el('input'); i.type = 'checkbox'; i.value = b.nome;
        i.addEventListener('change', function () { poeKit(b.nome, i.checked); });
        l.appendChild(i); l.appendChild(document.createTextNode('Quero no meu kit')); c.appendChild(l);
      }
      vit.appendChild(c);
    });

    var q = new URLSearchParams(location.search).get('corte');
    mostra(q && guia(q) ? q : 'picanha');
    if (q && guia(q)) setTimeout(function () { document.getElementById('guia').scrollIntoView({ behavior: 'auto' }); }, 50);
  }
})();
