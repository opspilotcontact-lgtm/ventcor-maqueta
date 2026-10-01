// Ventcor v2 · sin dependencias. Todo el contenido está en el HTML: si esto no carga, se lee igual.
(function () {
  var d = document, raiz = d.documentElement;
  raiz.classList.add('js');
  var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // el aire por la red: SMIL parado si se pide movimiento reducido
  if (quieto) d.querySelectorAll('svg').forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); });

  // menú en móvil
  var bot = d.querySelector('.menu-btn'), nav = d.getElementById('nav');
  if (bot && nav) bot.addEventListener('click', function () {
    var ab = nav.classList.toggle('abierto');
    bot.setAttribute('aria-expanded', ab ? 'true' : 'false');
  });

  // entradas al hacer scroll (una vez)
  var rev = d.querySelectorAll('.revela');
  if (!quieto && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rev.forEach(function (el) { io.observe(el); });
  } else rev.forEach(function (el) { el.classList.add('visto'); });

  // formularios que componen el mensaje (empleo y constructoras)
  d.querySelectorAll('form[data-mensaje]').forEach(function (f) {
    var pre = d.getElementById(f.dataset.mensaje), env = d.getElementById(f.dataset.enviar),
        cop = d.getElementById(f.dataset.copiar), tipo = f.dataset.tipo, dest = f.dataset.destino || '';
    function val(n) { var e = f.elements[n]; return e ? (e.value || '').trim() : ''; }
    function marcados(n) { return Array.prototype.slice.call(f.querySelectorAll('[name="' + n + '"]:checked')).map(function (e) { return e.value; }); }
    function texto() {
      var l = [];
      if (tipo === 'empleo') {
        l.push('Hola Juan, quiero trabajar en Ventcor.');
        if (val('nombre')) l.push('Me llamo ' + val('nombre') + (val('pueblo') ? ', de ' + val('pueblo') : '') + '.');
        var z = marcados('zona'); if (z.length) l.push('Puedo trabajar en: ' + z.join(', ') + '.');
        if (val('exp')) l.push('Experiencia montando conducto: ' + val('exp') + '.');
        var m = marcados('material'); if (m.length) l.push('He montado: ' + m.join(', ') + '.');
        var c = marcados('curso'); if (c.length) l.push('Tengo: ' + c.join(', ') + '.');
        if (val('nota')) l.push(val('nota'));
      } else {
        l.push('Hola Juan, os escribo de ' + (val('empresa') || '[empresa]') + '.');
        if (val('obra')) l.push('Obra: ' + val('obra') + (val('ciudad') ? ' (' + val('ciudad') + ')' : '') + '.');
        var t = marcados('tipo'); if (t.length) l.push('Tipo: ' + t.join(', ') + '.');
        var q = marcados('montar'); if (q.length) l.push('Hay que montar: ' + q.join(', ') + '.');
        if (val('entrada')) l.push('Entrada prevista: ' + val('entrada') + '.');
        if (marcados('rescate').length) l.push('La obra ya está empezada por otra empresa: hay que revisar y terminar.');
        if (marcados('docs').length) l.push('Enviadnos la documentación de empresa, por favor.');
        if (val('contacto')) l.push('Contacto: ' + val('contacto') + '.');
        if (val('nota')) l.push(val('nota'));
      }
      return l.join('\n');
    }
    function pinta() {
      var t = texto(); pre.textContent = t;
      if (env && dest) env.href = env.dataset.base + encodeURIComponent(t);
    }
    f.addEventListener('input', pinta); f.addEventListener('change', pinta); pinta();
    f.addEventListener('submit', function (e) { e.preventDefault(); if (env && dest) env.click(); });
    if (cop) cop.addEventListener('click', function () {
      var t = texto();
      (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () {
        cop.textContent = 'Copiado'; setTimeout(function () { cop.textContent = 'Copiar el mensaje'; }, 1800);
      }, function () { var r = d.createRange(); r.selectNodeContents(pre); var s = getSelection(); s.removeAllRanges(); s.addRange(r); });
    });
  });
})();
