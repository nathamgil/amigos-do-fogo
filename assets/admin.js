/* =====================================================================
   Painel — Amigos do Fogo.
   Orçamentos do buffet (status, responder no WhatsApp do cliente)
   · Boutique (tem / em falta) · Almoço (o que sai hoje) · Ajustes.
   Demo: localStorage (af_) via dados.js.
   Login de DEMONSTRAÇÃO (não é segurança): dono / fogo.
   ===================================================================== */
(function () {
  'use strict';
  var AF = window.AF; if (!AF) return;
  var LOGIN = { user: 'dono', senha: 'fogo' }, K = 'af_sessao';
  function $(s, r) { return (r || document).querySelector(s); }
  function el(t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; }
  function bt(txt, cls, fn) { var b = el('button', 'bt bt-mini ' + (cls || ''), txt); b.type = 'button'; if (fn) b.addEventListener('click', fn); return b; }
  function inp(tipo, val, ph) { var i = el('input'); i.type = tipo || 'text'; if (val != null) i.value = val; if (ph) i.placeholder = ph; return i; }
  function campo(rot, input) { var d = el('div'), id = 'c' + Math.random().toString(36).slice(2, 8); input.id = id; var l = el('label', null, rot); l.htmlFor = id; d.appendChild(l); d.appendChild(input); return d; }
  var tT; function toast(t) { var n = $('#toast'); n.textContent = t; n.hidden = false; clearTimeout(tT); tT = setTimeout(function () { n.hidden = true; }, 2400); }
  function telWa(t) { var d = String(t || '').replace(/\D/g, ''); if (!d) return ''; return d.length <= 11 ? '55' + d : d; }

  function logado() { try { return sessionStorage.getItem(K) === '1'; } catch (e) { return false; } }
  function entra() { $('#tela-login').hidden = true; $('#tela-painel').hidden = false; abre(new URLSearchParams(location.search).get('aba') || 'orcamentos'); }
  $('#form-login').addEventListener('submit', function (e) {
    e.preventDefault();
    if ($('#l-user').value.trim().toLowerCase() === LOGIN.user && $('#l-senha').value === LOGIN.senha) { try { sessionStorage.setItem(K, '1'); } catch (x) {} entra(); }
    else $('#login-erro').textContent = 'Usuário ou senha errados. Veja o quadro acima.';
  });
  $('#btn-sair').addEventListener('click', function () { try { sessionStorage.removeItem(K); } catch (x) {} location.reload(); });

  var ABAS = { orcamentos: orcamentos, boutique: boutique, almoco: almoco, ajustes: ajustes };
  document.querySelectorAll('.abas button').forEach(function (b) { b.addEventListener('click', function () { abre(b.getAttribute('data-aba')); }); });
  function abre(id) {
    if (!ABAS[id]) id = 'orcamentos';
    document.querySelectorAll('.aba').forEach(function (s) { s.hidden = s.id !== 'aba-' + id; });
    document.querySelectorAll('.abas button').forEach(function (b) { if (b.getAttribute('data-aba') === id) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    ABAS[id]($('#aba-' + id)); badge(); window.scrollTo(0, 0);
  }
  function badge() { var n = AF.orcamentos().filter(function (o) { return o.status === 'novo'; }).length, b = $('#badge'); b.hidden = !n; b.textContent = n; }
  function cab(sec, tit, txt) { sec.innerHTML = ''; sec.appendChild(el('h2', null, tit)); if (txt) sec.appendChild(el('p', null, txt)); }

  /* ---------- orçamentos ---------- */
  var filtro = 'abertos';
  function orcamentos(sec) {
    cab(sec, 'Orçamentos do buffet', 'Cada pedido que chega pelo site fica aqui, com tudo que o cliente marcou. Responda no WhatsApp dele e mude o status.');
    var todos = AF.orcamentos();
    var res = el('div', 'resumo');
    AF.STATUS.forEach(function (s) { var d = el('div'); d.appendChild(el('b', null, todos.filter(function (o) { return o.status === s.id; }).length)); d.appendChild(document.createTextNode(s.nome)); res.appendChild(d); });
    sec.appendChild(res);
    var fl = el('div', 'filtros');
    [['abertos', 'Em aberto'], ['todos', 'Todos'], ['fechado', 'Fechados'], ['perdido', 'Não rolou']].forEach(function (f) {
      var b = el('button', null, f[1]); b.type = 'button'; b.setAttribute('aria-pressed', filtro === f[0]);
      b.addEventListener('click', function () { filtro = f[0]; orcamentos(sec); }); fl.appendChild(b);
    });
    sec.appendChild(fl);
    var lista = todos.filter(function (o) { return filtro === 'todos' || (filtro === 'abertos' ? (o.status === 'novo' || o.status === 'respondido') : o.status === filtro); })
      .sort(function (a, b) { return String(a.data).localeCompare(String(b.data)); });
    if (!lista.length) sec.appendChild(el('p', null, 'Nenhum pedido aqui.'));
    lista.forEach(function (o) {
      var c = el('article', 'ped'); c.setAttribute('data-st', o.status);
      var h = el('h3'); h.appendChild(el('span', 'st', (AF.STATUS.filter(function (s) { return s.id === o.status; })[0] || {}).nome)); h.appendChild(document.createTextNode(AF.nomeTipo(o.tipo) + ' · ' + o.nome)); c.appendChild(h);
      c.appendChild(el('p', 'meta', AF.dataLonga(o.data) + (o.hora ? ', ' + AF.hm(o.hora) : '') + ' · ' + o.adultos + ' adultos' + (o.criancas ? ' + ' + o.criancas + ' crianças' : '') + ' · ~' + AF.kgTxt(AF.kgCarne(o.adultos, o.criancas)) + ' kg de carne'));
      var ul = el('ul');
      ul.appendChild(el('li', null, 'Cardápio: ' + (o.itens.map(AF.nomeItem).join(', ') || 'quer sugestão')));
      ul.appendChild(el('li', null, 'Local: ' + (o.local || '—') + ' · churrasqueiro: ' + ({ sim: 'sim', nao: 'não (retira)', naosei: 'não sabe' }[o.churrasqueiro] || '—')));
      if (o.obs) ul.appendChild(el('li', null, '“' + o.obs + '”'));
      c.appendChild(ul);
      var lb = el('div', 'linha-bt');
      var tel = telWa(o.tel);
      if (tel) { var z = el('a', 'bt bt-mini bt-tinta', 'Responder no WhatsApp'); z.href = AF.linkWa('Oi, ' + String(o.nome).replace(/\s*\(exemplo\)/, '') + '! Aqui é do Amigos do Fogo, sobre o buffet de ' + AF.dataLonga(o.data) + '.', tel); z.target = '_blank'; z.rel = 'noopener'; lb.appendChild(z); }
      var sel = el('select'); sel.setAttribute('aria-label', 'Status do pedido de ' + o.nome);
      AF.STATUS.forEach(function (s) { var op = el('option', null, s.nome); op.value = s.id; sel.appendChild(op); }); sel.value = o.status;
      sel.addEventListener('change', function () { var l = AF.orcamentos(); l.forEach(function (x) { if (x.id === o.id) x.status = sel.value; }); AF.grava('orcamentos', l); toast('Status: ' + sel.options[sel.selectedIndex].text); orcamentos(sec); badge(); });
      lb.appendChild(sel);
      lb.appendChild(bt('Copiar comanda', '', function () { var t = AF.mensagemOrcamento(o); if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { toast('Comanda copiada'); }); }));
      c.appendChild(lb); sec.appendChild(c);
    });
  }

  /* ---------- boutique ---------- */
  function boutique(sec) {
    cab(sec, 'Boutique', 'Marque o que está em falta esta semana. No site aparece "Em falta" e some do kit.');
    var ul = el('ul', 'lista-adm');
    AF.boutique().forEach(function (b, i) {
      var li = el('li', b.disponivel ? '' : 'off'), t = el('div');
      t.appendChild(el('b', null, b.nome)); t.appendChild(el('small', null, b.cat + (b.disponivel ? ' · tem' : ' · em falta')));
      li.appendChild(t);
      li.appendChild(bt(b.disponivel ? 'Acabou' : 'Chegou', b.disponivel ? '' : 'bt-tinta', function () { var l = AF.boutique(); l[i].disponivel = !l[i].disponivel; AF.grava('boutique', l); boutique(sec); }));
      ul.appendChild(li);
    });
    sec.appendChild(ul);
  }

  /* ---------- almoço ---------- */
  function almoco(sec) {
    cab(sec, 'Almoço', 'Ligue só o que sai hoje. Aparece na seção "Domingo é dia de costela" do site.');
    var ul = el('ul', 'lista-adm');
    AF.almoco().forEach(function (a, i) {
      var li = el('li', a.ativo ? '' : 'off'), t = el('div');
      t.appendChild(el('b', null, a.nome)); t.appendChild(el('small', null, a.ativo ? 'no site' : 'fora do site'));
      li.appendChild(t);
      li.appendChild(bt(a.ativo ? 'Tirar' : 'Mostrar', a.ativo ? '' : 'bt-tinta', function () { var l = AF.almoco(); l[i].ativo = !l[i].ativo; AF.grava('almoco', l); almoco(sec); }));
      ul.appendChild(li);
    });
    sec.appendChild(ul);
  }

  /* ---------- ajustes ---------- */
  function ajustes(sec) {
    cab(sec, 'Ajustes', 'WhatsApp que recebe os pedidos, horário e endereço da boutique.');
    var cs = AF.casa(), c = el('div', 'cartao'), g = el('div', 'campos');
    var fZ = inp('tel', cs.whatsapp), fH = inp('text', cs.horario, 'Ex.: ter a dom, 11h às 22h'), fE = inp('text', cs.endereco, 'Rua, número, bairro');
    g.appendChild(campo('WhatsApp (55 71 9…)', fZ)); g.appendChild(campo('Horário', fH)); g.appendChild(campo('Endereço', fE)); c.appendChild(g);
    var lb = el('div', 'linha-bt');
    lb.appendChild(bt('Salvar', 'bt-tinta', function () { AF.grava('casa', { whatsapp: fZ.value.replace(/\D/g, '') || AF.CASA.whatsapp, horario: fH.value.trim(), endereco: fE.value.trim() }); toast('Ajustes salvos'); }));
    lb.appendChild(bt('Voltar dados de exemplo', '', function () { if (confirm('Apagar o que foi mexido e voltar ao exemplo?')) { AF.semear(true); toast('Exemplo restaurado'); ajustes(sec); } }));
    c.appendChild(lb); sec.appendChild(c);
  }

  if (logado()) entra();
})();
