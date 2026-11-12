/* =====================================================================
   Amigos do Fogo — dados da casa + "banco" do modo demo.
   ÚNICO lugar com informação da casa. Site e painel leem daqui.
   Modo demo: tudo no navegador (localStorage, prefixo af_).
   Sem preço inventado: nenhum item tem preço até a casa passar.
   ===================================================================== */
(function () {
  'use strict';

  var CASA = {
    nome: 'Amigos do Fogo',
    instagram: 'amigosfogo',
    cidade: 'Salvador · Bahia',
    // !!! PLACEHOLDER — NÃO É O NÚMERO DA CASA. Hoje o contato é "Chame no Direct". Trocar (README > A confirmar).
    whatsapp: '5571900000000',
    whatsappPlaceholder: true,
    // horário e endereço estão nos destaques "Horário" e "Localização" do Instagram — ainda não temos.
    horario: '',
    endereco: ''
  };

  var TIPOS_EVENTO = [
    { id: 'aniver',   nome: 'Aniversário' },
    { id: 'empresa',  nome: 'Confraternização de empresa' },
    { id: 'casamento', nome: 'Casamento / noivado' },
    { id: 'formatura', nome: 'Formatura' },
    { id: 'familia',  nome: 'Churrasco em família' },
    { id: 'outro',    nome: 'Outro' }
  ];

  // itens do buffet: só o que aparece nas postagens (cardápio real do buffet: a confirmar)
  var BUFFET = [
    { id: 'cortes',   grupo: 'Carnes',          nome: 'Cortes especiais bovinos' },
    { id: 'cupim',    grupo: 'Carnes',          nome: 'Cupim' },
    { id: 'costela',  grupo: 'Carnes',          nome: 'Costela' },
    { id: 'frango',   grupo: 'Carnes',          nome: 'Frango na brasa' },
    { id: 'pulled',   grupo: 'Carnes',          nome: 'Porco defumado (pulled pork)' },
    { id: 'burger',   grupo: 'Carnes',          nome: 'Hambúrguer artesanal' },
    { id: 'carreteiro', grupo: 'Acompanhamentos', nome: 'Arroz carreteiro' },
    { id: 'tropeiro', grupo: 'Acompanhamentos', nome: 'Feijão tropeiro' },
    { id: 'farofa',   grupo: 'Acompanhamentos', nome: 'Farofa' },
    { id: 'vinagrete', grupo: 'Acompanhamentos', nome: 'Vinagrete' }
  ];

  // boutique: cortes do guia + o que aparece nas fotos. disponivel = o painel liga/desliga.
  var BOUTIQUE = [
    { id: 'cupim',     cat: 'Cortes especiais', nome: 'Cupim',               desc: '"Pega esse marmoreio desse cupim, pai!" Padrão Amigos do Fogo.', foto: 'fotos/cupim-marmoreio.jpg' },
    { id: 'costela',   cat: 'Cortes especiais', nome: 'Costela',             desc: 'Pra fogo baixo e paciência. Também sai defumada.', foto: 'fotos/costela-defumada.jpg' },
    { id: 'avacuo',    cat: 'Cortes especiais', nome: 'Cortes bovinos a vácuo', desc: 'Peças seladas com a etiqueta da casa. Pergunte quais tem na semana.', foto: 'fotos/ancho-a-vacuo.jpg' },
    { id: 'marcas',    cat: 'Cortes especiais', nome: 'Cortes de marca',     desc: 'Peças embaladas de frigoríficos selecionados, no balcão da boutique.', foto: 'fotos/boutique-cortes.jpg' },
    { id: 'defumados', cat: 'Defumados artesanais', nome: 'Defumados da casa', desc: 'Costela e porco defumados aqui mesmo, no fogo da casa.', foto: 'fotos/baguete-pulled-pork.jpg' },
    { id: 'temperos',  cat: 'Temperos e bebidas', nome: 'Temperos',          desc: 'Pra acertar o sal e o tempero do seu churrasco.', foto: '' },
    { id: 'bebidas',   cat: 'Temperos e bebidas', nome: 'Bebidas',           desc: 'Pra resenha não secar.', foto: '' }
  ];

  var ALMOCO = [
    { id: 'costela',  nome: 'Costela suculenta com arroz carreteiro e feijão tropeiro', desc: 'O almoço de domingo.', foto: 'fotos/almoco-domingo.jpg', ativo: true },
    { id: 'baguete',  nome: 'Baguete Pulled Pork', desc: 'Porco defumado desfiado na baguete.', foto: 'fotos/baguete-pulled-pork.jpg', ativo: true },
    { id: 'burger',   nome: 'Hambúrguer caprichado', desc: 'Pão macio, carne alta e queijo escorrendo.', foto: 'fotos/hamburguer-cheddar.jpg', ativo: true },
    { id: 'prato',    nome: 'Prato da brasa', desc: 'Frango e carne na brasa com farofa e vinagrete.', foto: 'fotos/prato-frango-farofa.jpg', ativo: true }
  ];

  /* Guia de cortes: conteúdo geral de churrasco (não é estoque da casa). zona = polígono no desenho do boi. */
  var GUIA = [
    { id: 'cupim',     nome: 'Cupim',       pts: '170,62 250,62 250,112 170,112', onde: 'A corcova em cima do pescoço, típica do gado zebu.', fogo: 'Fogo baixo e tempo longo (ou defumado). Embrulhado no papel-alumínio no começo, selado no fim.', ponto: 'Bem passado e desmanchando.', foto: 'fotos/cupim-marmoreio.jpg', frase: '"Pega esse marmoreio desse cupim, pai!" Padrão Amigos do Fogo.' },
    { id: 'paleta',    nome: 'Paleta e acém', pts: '100,62 170,62 170,112 250,112 250,272 100,272', onde: 'O dianteiro, ombro do boi.', fogo: 'Melhor pra panela, desfiado ou na brasa bem lenta.', ponto: 'Bem passado.' },
    { id: 'ancho',     nome: 'Ancho',       pts: '250,62 360,62 360,140 250,140', onde: 'Começo do contrafilé, perto do dianteiro. Muita gordura entremeada.', fogo: 'Brasa forte, grelha alta. Vira uma vez só.', ponto: 'Ao ponto pra mal passado.', foto: '', frase: 'Muita gordura entremeada. Brasa forte, vira uma vez só.' },
    { id: 'contrafile', nome: 'Contrafilé / chorizo', pts: '360,62 450,62 450,140 360,140', onde: 'Lombo, do meio pra trás. Capa de gordura de um lado.', fogo: 'Brasa forte, capa de gordura virada pro fogo primeiro.', ponto: 'Ao ponto.' },
    { id: 'picanha',   nome: 'Picanha',     pts: '450,62 575,62 575,122 450,122', onde: 'Em cima da alcatra, no traseiro. Triângulo com capa de gordura.', fogo: 'Inteira no espeto ou em bifes grossos. Sal grosso só na hora.', ponto: 'Mal passada a ao ponto.', foto: 'fotos/picanha-na-grelha.jpg', frase: 'Capa de gordura pro fogo. Sal grosso só na hora.' },
    { id: 'alcatra',   nome: 'Alcatra e maminha', pts: '450,122 575,122 575,180 450,180', onde: 'Traseiro, entre a picanha e a perna.', fogo: 'Maminha inteira em fogo médio; alcatra em bifes.', ponto: 'Ao ponto.' },
    { id: 'costela',   nome: 'Costela',     pts: '250,140 410,140 410,272 250,272', onde: 'A lateral do boi, sobre as costelas.', fogo: 'Fogo de chão ou brasa baixa por horas, osso virado pro fogo primeiro.', ponto: 'Soltando do osso.', foto: 'fotos/costela-defumada.jpg', frase: 'Fogo baixo e paciência. Também sai defumada.' },
    { id: 'fraldinha', nome: 'Fraldinha',   pts: '410,140 450,140 450,180 505,180 505,272 410,272', onde: 'Parte de baixo da barriga, perto do traseiro. Fibras longas.', fogo: 'Inteira em brasa média. Corte contra a fibra na hora de servir.', ponto: 'Ao ponto.', foto: '', frase: 'Fibras longas. Corta contra a fibra na hora de servir.' },
    { id: 'coxao',     nome: 'Coxão e lagarto', pts: '505,180 575,180 575,300 505,300', onde: 'A perna traseira.', fogo: 'Mais pra panela ou carne de sol que pra grelha.', ponto: '—' }
  ];

  var SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var STATUS = [
    { id: 'novo', nome: 'Novo' }, { id: 'respondido', nome: 'Respondido' }, { id: 'fechado', nome: 'Fechado' }, { id: 'perdido', nome: 'Não rolou' }
  ];
  var PFX = 'af_';

  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function deIso(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
  function hoje() { return iso(new Date()); }
  function soma(s, n) { var d = deIso(s); d.setDate(d.getDate() + n); return iso(d); }
  function le(k, pad) { try { var v = localStorage.getItem(PFX + k); return v ? JSON.parse(v) : pad; } catch (e) { return pad; } }
  function grava(k, v) { try { localStorage.setItem(PFX + k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function novoId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function copia(x) { return JSON.parse(JSON.stringify(x)); }

  function semear(forcar) {
    var V = 'semeado_v1';
    if (!forcar) { try { if (localStorage.getItem(PFX + V)) return; } catch (e) { return; } }
    grava('casa', { whatsapp: CASA.whatsapp, horario: CASA.horario, endereco: CASA.endereco });
    grava('boutique', BOUTIQUE.map(function (b) { return Object.assign({ disponivel: true }, b); }));
    grava('almoco', copia(ALMOCO));
    var h = hoje(), agora = new Date().toISOString();
    grava('orcamentos', [
      { id: novoId(), criado: agora, status: 'novo', nome: 'Juliana (exemplo)', tel: '71900000001', tipo: 'aniver', data: soma(h, 18), hora: '13:00', adultos: 40, criancas: 10, local: 'Salão de festas do condomínio', churrasqueiro: 'sim', itens: ['cortes', 'costela', 'frango', 'carreteiro', 'farofa', 'vinagrete'], obs: '40 anos do marido. Querem costela no fogo de chão se der.' },
      { id: novoId(), criado: agora, status: 'respondido', nome: 'Marcos (exemplo)', tel: '71900000002', tipo: 'empresa', data: soma(h, 32), hora: '12:00', adultos: 60, criancas: 0, local: 'Galpão da empresa', churrasqueiro: 'naosei', itens: ['cortes', 'cupim', 'pulled', 'tropeiro', 'carreteiro'], obs: 'Confraternização de fim de ano.' },
      { id: novoId(), criado: agora, status: 'fechado', nome: 'Patrícia (exemplo)', tel: '71900000003', tipo: 'familia', data: soma(h, 9), hora: '12:00', adultos: 18, criancas: 6, local: 'Casa da família', churrasqueiro: 'nao', itens: ['costela', 'burger', 'farofa'], obs: 'Vão retirar.' }
    ]);
    try { localStorage.setItem(PFX + V, '1'); } catch (e) { /* sem armazenamento */ }
  }

  function casa() { return Object.assign({}, CASA, le('casa', {})); }
  function boutique() { return le('boutique', BOUTIQUE.map(function (b) { return Object.assign({ disponivel: true }, b); })); }
  function almoco() { return le('almoco', copia(ALMOCO)); }
  function orcamentos() { return le('orcamentos', []); }
  function addOrcamento(o) { var l = orcamentos(); o.id = novoId(); o.criado = new Date().toISOString(); o.status = 'novo'; l.unshift(o); grava('orcamentos', l); return o; }
  // estimativa do SITE (regra de bolso: 400 g de carne por adulto, metade por criança) — a casa confirma
  function kgCarne(ad, cr) { return Math.round(((+ad || 0) * 0.4 + (+cr || 0) * 0.2) * 10) / 10; }
  function nomeTipo(id) { return (TIPOS_EVENTO.filter(function (t) { return t.id === id; })[0] || {}).nome || id; }
  function nomeItem(id) { return (BUFFET.filter(function (t) { return t.id === id; })[0] || {}).nome || id; }
  function dataLonga(s) { if (!s) return '—'; var d = deIso(s); return SEMANA[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()]; }
  function hm(t) { return t ? String(t).replace(':00', 'h').replace(':', 'h') : ''; }
  function linkWa(txt, numero) { return 'https://wa.me/' + (numero || casa().whatsapp) + '?text=' + encodeURIComponent(txt); }
  function kgTxt(n) { return String(n).replace('.', ','); }

  function mensagemOrcamento(o) {
    var carnes = o.itens.filter(function (i) { return nomeItem(i) && BUFFET.some(function (b) { return b.id === i && b.grupo === 'Carnes'; }); }).map(nomeItem);
    var acomp = o.itens.filter(function (i) { return BUFFET.some(function (b) { return b.id === i && b.grupo !== 'Carnes'; }); }).map(nomeItem);
    var ch = { sim: 'sim', nao: 'não', naosei: 'ainda não sei' }[o.churrasqueiro] || '—';
    return [
      'Fala, Amigos do Fogo! Quero um orçamento de buffet 🔥',
      '',
      'Evento: ' + nomeTipo(o.tipo),
      'Data: ' + dataLonga(o.data) + (o.hora ? ', ' + hm(o.hora) : ''),
      'Pessoas: ' + (o.adultos || 0) + ' adultos' + (o.criancas ? ' + ' + o.criancas + ' crianças' : ''),
      'Local: ' + (o.local || '—'),
      'Churrasqueiro no local: ' + ch,
      'Carnes: ' + (carnes.join(', ') || 'vocês sugerem'),
      'Acompanhamentos: ' + (acomp.join(', ') || 'vocês sugerem'),
      o.obs ? 'Obs.: ' + o.obs : '',
      '',
      'Nome: ' + (o.nome || '—') + (o.tel ? ' · ' + o.tel : '')
    ].filter(function (l, i, a) { return l !== '' || (a[i - 1] !== '' && i < a.length - 1); }).join('\n');
  }

  semear(false);

  window.AF = {
    CASA: CASA, TIPOS_EVENTO: TIPOS_EVENTO, BUFFET: BUFFET, GUIA: GUIA, STATUS: STATUS, SEMANA: SEMANA, MESES: MESES,
    iso: iso, deIso: deIso, hoje: hoje, soma: soma, le: le, grava: grava, novoId: novoId, semear: semear,
    casa: casa, boutique: boutique, almoco: almoco, orcamentos: orcamentos, addOrcamento: addOrcamento,
    kgCarne: kgCarne, kgTxt: kgTxt, nomeTipo: nomeTipo, nomeItem: nomeItem, dataLonga: dataLonga, hm: hm, linkWa: linkWa,
    mensagemOrcamento: mensagemOrcamento
  };
})();
