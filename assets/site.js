/* Amigos do Fogo — site público (index + boutique). Lê tudo de dados.js (window.AF). */
(function () {
  'use strict';
  var AF = window.AF; if (!AF) return;
  function $(s, r) { return (r || document).querySelector(s); }
  function el(t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; }
  var CASA = AF.casa();
  if (CASA.whatsapp === AF.CASA.whatsapp && $('#aviso-demo')) $('#aviso-demo').hidden = false;

  /* ---------- entrada + texto em movimento ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vista'); io.unobserve(e.target); } });
  }, { threshold: .15 }) : null;
  function observa(n) { if (io) io.observe(n); else n.classList.add('vista'); }
  document.querySelectorAll('.surge').forEach(observa);

  var reduz = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var corre = Array.prototype.slice.call(document.querySelectorAll('[data-corre]'));
  corre.forEach(function (n) { n.innerHTML = new Array(6).join(n.innerHTML); });
  var frase = $('#frase'), pend = false;
  function rola() {
    pend = false;
    var h = window.innerHeight;
    if (!reduz) corre.forEach(function (n) {
      var r = n.getBoundingClientRect(), f = +n.getAttribute('data-corre');
      var d = Math.max(0, h - r.top) * f; // anda conforme a faixa atravessa a tela
      n.style.transform = 'translateX(' + ((f < 0 ? -200 : -2600) + d) + 'px)';
    });
    if (frase) {
      var r = frase.getBoundingClientRect(), p = Math.min(1, Math.max(0, (h * .8 - r.top) / (r.height + h * .2)));
      var ws = frase.children, n = reduz ? ws.length : Math.ceil(p * ws.length);
      for (var i = 0; i < ws.length; i++) ws[i].classList.toggle('on', i < n);
    }
  }
  window.addEventListener('scroll', function () { if (!pend) { pend = true; requestAnimationFrame(rola); } }, { passive: true });
  window.addEventListener('resize', rola);
  rola();

  function chip(nome, tipo, valor, txt, marcado) {
    var l = el('label'), i = el('input'); i.type = tipo; i.name = nome; i.value = valor; i.checked = !!marcado;
    l.appendChild(i); l.appendChild(el('span', null, txt)); return l;
  }

  /* ================= ORÇAMENTO ================= */
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
    var dmin = AF.soma(AF.hoje(), 1); $('#o-data').min = dmin;
    function dados() {
      return {
        data: $('#o-data').value, hora: $('#o-hora').value,
        adultos: +$('#o-adultos').value || 0, criancas: +$('#o-criancas').value || 0,
        tipo: (form.querySelector('input[name=tipo]:checked') || {}).value || 'outro',
        itens: Array.prototype.map.call(form.querySelectorAll('input[name=itens]:checked'), function (i) { return i.value; }),
        local: $('#o-local').value.trim(),
        churrasqueiro: (form.querySelector('input[name=churras]:checked') || {}).value || 'naosei',
        nome: $('#o-nome').value.trim(), tel: $('#o-tel').value.trim(), obs: $('#o-obs').value.trim()
      };
    }
    function atualiza() {
      var o = dados();
      $('#o-kg').textContent = AF.kgTxt(AF.kgCarne(o.adultos, o.criancas)) + ' kg';
      $('#o-previa').textContent = AF.mensagemOrcamento(o);
    }
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

  /* ---------- almoço ---------- */
  var ag = $('#almoco-grade');
  if (ag) {
    AF.almoco().filter(function (a) { return a.ativo; }).forEach(function (a) {
      var f = el('figure', 'prato surge');
      if (a.foto) { var im = el('img'); im.src = a.foto; im.alt = a.nome; im.loading = 'lazy'; f.appendChild(im); }
      var c = el('figcaption'); c.appendChild(el('h3', null, a.nome)); if (a.desc) c.appendChild(el('p', null, a.desc)); f.appendChild(c);
      ag.appendChild(f); observa(f);
    });
    $('#almoco-horario').textContent = CASA.horario ? 'Horário: ' + CASA.horario : 'Dias e horário do almoço: confirme no WhatsApp antes de vir.';
    $('#almoco-zap').href = AF.linkWa('Fala, Amigos do Fogo! Qual o almoço de hoje? Tem costela?');
  }
  if ($('#rod-cidade') && CASA.endereco) $('#rod-cidade').textContent = CASA.endereco + ' · Salvador · Bahia';

  /* ================= BOUTIQUE ================= */
  var vit = $('#vitrine');
  if (vit) {
    var kit = [];
    AF.boutique().forEach(function (b) {
      var c = el('article', 'peca surge' + (b.foto ? '' : ' sem-foto'));
      if (b.foto) { var im = el('img'); im.src = b.foto; im.alt = b.nome; im.loading = 'lazy'; c.appendChild(im); }
      var et = el('div', 'etiqueta'); et.appendChild(el('small', null, b.cat)); et.appendChild(el('b', null, b.nome));
      et.appendChild(el('p', null, b.desc));
      if (!b.disponivel) et.appendChild(el('p', 'em-falta', 'Em falta esta semana'));
      c.appendChild(et);
      if (b.disponivel) {
        var l = el('label'), i = el('input'); i.type = 'checkbox'; i.value = b.nome;
        i.addEventListener('change', function () { if (i.checked) kit.push(b.nome); else kit = kit.filter(function (k) { return k !== b.nome; }); kitAtualiza(); });
        l.appendChild(i); l.appendChild(document.createTextNode('Quero no meu kit')); c.appendChild(l);
      }
      vit.appendChild(c); observa(c);
    });
    var barra = $('#kit-barra'), pes = $('#kit-pessoas');
    function kitAtualiza() {
      barra.hidden = !kit.length;
      $('#kit-resumo').textContent = kit.length + (kit.length === 1 ? ' item' : ' itens') + ' no kit: ' + kit.join(', ');
      var n = +pes.value || 0;
      $('#kit-zap').href = AF.linkWa('Fala, Amigos do Fogo! Quero montar um kit de churrasco pra ' + n + ' pessoas (uns ' + AF.kgTxt(AF.kgCarne(n, 0)) + ' kg de carne).\n\nNo kit: ' + kit.join(', ') + '\n\nO que vocês têm essa semana?');
    }
    pes.addEventListener('input', kitAtualiza);

    /* ---------- guia de cortes ---------- */
    var NS = 'http://www.w3.org/2000/svg', zonas = $('#zonas'), boi = $('#boi'), info = $('#corte-info'), lista = $('#cortes-lista');
    var rotulos = document.createElementNS(NS, 'g');
    function mostra(id) {
      var g = AF.GUIA.filter(function (x) { return x.id === id; })[0]; if (!g) return;
      info.innerHTML = '';
      info.appendChild(el('h3', null, g.nome));
      var dl = el('dl');
      [['Onde fica', g.onde], ['No fogo', g.fogo], ['Ponto', g.ponto]].forEach(function (p) { dl.appendChild(el('dt', null, p[0])); dl.appendChild(el('dd', null, p[1])); });
      info.appendChild(dl);
      var z = el('a', 'bt bt-brasa bt-mini', 'Perguntar se tem ' + g.nome.split(' ')[0].toLowerCase()); z.style.marginTop = '16px';
      z.href = AF.linkWa('Fala, Amigos do Fogo! Tem ' + g.nome.toLowerCase() + ' essa semana?'); z.target = '_blank'; z.rel = 'noopener'; info.appendChild(z);
      zonas.querySelectorAll('.zona').forEach(function (p) { p.classList.toggle('ativa', p.getAttribute('data-id') === id); });
      lista.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-id') === id); });
    }
    AF.GUIA.forEach(function (g) {
      var p = document.createElementNS(NS, 'polygon');
      p.setAttribute('points', g.pts); p.setAttribute('class', 'zona'); p.setAttribute('data-id', g.id);
      p.setAttribute('tabindex', '0'); p.setAttribute('role', 'button'); p.setAttribute('aria-label', g.nome);
      p.addEventListener('click', function () { mostra(g.id); });
      p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mostra(g.id); } });
      zonas.appendChild(p);
      var xs = g.pts.split(' ').map(function (q) { return q.split(',').map(Number); });
      var cx = xs.reduce(function (s, q) { return s + q[0]; }, 0) / xs.length, cy = xs.reduce(function (s, q) { return s + q[1]; }, 0) / xs.length;
      var t = document.createElementNS(NS, 'text'); t.setAttribute('x', cx); t.setAttribute('y', cy + 5); t.setAttribute('text-anchor', 'middle');
      t.textContent = g.nome.split(/[ /]/)[0]; rotulos.appendChild(t);
      var b = el('button', null, g.nome); b.type = 'button'; b.setAttribute('data-id', g.id); b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { mostra(g.id); }); lista.appendChild(b);
    });
    boi.appendChild(rotulos);
    mostra('picanha');
  }
})();
