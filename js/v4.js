// Ventcor v3 · sin dependencias. Todo el contenido está en el HTML: si esto no carga, se lee igual.
(function () {
  var d = document;
  d.documentElement.classList.add('js');
  var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (quieto) d.querySelectorAll('svg').forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); });

  // cabecera con sombra al bajar
  var cab = d.querySelector('.cab');
  if (cab) { var f = function () { cab.classList.toggle('sombra', scrollY > 8); }; addEventListener('scroll', f, { passive: true }); f(); }

  // menú en móvil
  var bot = d.querySelector('.menu-btn'), nav = d.getElementById('nav');
  if (bot && nav) bot.addEventListener('click', function () {
    var ab = nav.classList.toggle('abierto'); bot.setAttribute('aria-expanded', ab ? 'true' : 'false');
  });

  // entradas al hacer scroll (una vez)
  var rev = d.querySelectorAll('.revela');
  if (!quieto && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rev.forEach(function (el) { io.observe(el); });
  } else rev.forEach(function (el) { el.classList.add('visto'); });

  // formularios que componen el mensaje (oferta y empleo)
  d.querySelectorAll('form[data-mensaje]').forEach(function (fm) {
    var pre = d.getElementById(fm.dataset.mensaje), env = d.getElementById(fm.dataset.enviar),
        cop = d.getElementById(fm.dataset.copiar), tipo = fm.dataset.tipo;
    function val(n) { var e = fm.elements[n]; return e ? (e.value || '').trim() : ''; }
    function marc(n) { return Array.prototype.slice.call(fm.querySelectorAll('[name="' + n + '"]:checked')).map(function (e) { return e.value; }); }
    function texto() {
      var l = [];
      if (tipo === 'empleo') {
        l.push('Hola, quiero trabajar en Ventcor.');
        if (val('nombre')) l.push('Me llamo ' + val('nombre') + (val('pueblo') ? ', de ' + val('pueblo') : '') + '.');
        if (val('tel')) l.push('Teléfono: ' + val('tel') + '.');
        var z = marc('zona'); if (z.length) l.push('Puedo trabajar en: ' + z.join(', ') + '.');
        if (val('exp')) l.push('Experiencia montando conducto: ' + val('exp') + '.');
        var m = marc('material'); if (m.length) l.push('He montado: ' + m.join(', ') + '.');
        var c = marc('curso'); if (c.length) l.push('Tengo: ' + c.join(', ') + '.');
      } else {
        l.push('Solicitud de oferta para Ventcor');
        l.push('');
        l.push('Empresa: ' + (val('empresa') || '—'));
        if (val('persona')) l.push('Contacto: ' + val('persona') + (val('cargo') ? ' (' + val('cargo') + ')' : ''));
        if (val('tel')) l.push('Teléfono: ' + val('tel'));
        if (val('email')) l.push('Correo: ' + val('email'));
        l.push('');
        if (val('obra')) l.push('Obra: ' + val('obra'));
        if (val('lugar')) l.push('Ubicación: ' + val('lugar'));
        var t = marc('tipo'); if (t.length) l.push('Tipo de edificio: ' + t.join(', '));
        var a = marc('alcance'); if (a.length) l.push('Alcance: ' + a.join(', '));
        if (val('fecha')) l.push('Entrada prevista: ' + val('fecha'));
        if (marc('situacion').length) l.push('Situación: obra empezada por otra empresa, hay que revisar y terminar la red.');
        if (marc('docs').length) l.push('Solicitamos la documentación de empresa.');
        if (val('nota')) { l.push(''); l.push(val('nota')); }
        l.push(''); l.push('Adjuntamos los planos de climatización y ventilación.');
      }
      return l.join('\n');
    }
    function pinta() { var t = texto(); pre.textContent = t; if (env && env.dataset.base) env.href = env.dataset.base + encodeURIComponent(t); }
    fm.addEventListener('input', pinta); fm.addEventListener('change', pinta); pinta();
    fm.addEventListener('submit', function (e) { e.preventDefault(); if (env && env.dataset.base) env.click(); });
    if (cop) cop.addEventListener('click', function () {
      var t = texto();
      (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () {
        cop.textContent = 'Copiado'; setTimeout(function () { cop.textContent = 'Copiar el texto'; }, 1800);
      }, function () { var r = d.createRange(); r.selectNodeContents(pre); var s = getSelection(); s.removeAllRanges(); s.addRange(r); });
    });
  });
})();

// ---------- v4: modales, pestañas de materiales y piezas que se montan al verse ----------
(function () {
  var d = document;
  var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  // modales: cualquier [data-modal] abre su <dialog>; con flechas se pasa a la pieza siguiente
  var ultimo = null;
  function abre(id) {
    var m = d.getElementById(id); if (!m || !m.showModal) return;
    d.querySelectorAll('dialog[open]').forEach(function (x) { x.close(); });
    m.showModal();
  }
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-modal]');
    if (b) { e.preventDefault(); ultimo = b; abre(b.getAttribute('data-modal')); return; }
    var c = e.target.closest('[data-cerrar]');
    if (c) { c.closest('dialog').close(); return; }
    if (e.target.tagName === 'DIALOG') e.target.close();          // clic en el fondo
  });
  d.querySelectorAll('dialog.modal').forEach(function (m) {
    m.addEventListener('close', function () { if (ultimo && document.contains(ultimo)) ultimo.focus(); });
  });
  // pestañas de materiales (sin JS se ven los tres paneles seguidos)
  d.querySelectorAll('[role=tablist]').forEach(function (tl) {
    var tabs = tl.querySelectorAll('[role=tab]');
    function elige(t) {
      tabs.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
        var p = d.getElementById(x.getAttribute('aria-controls')); p.hidden = !on; if (on) setTimeout(function () { p.classList.add('visto'); }, 30); });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { elige(t); });
      t.addEventListener('keydown', function (e) {
        var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (k) { var n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); elige(n); }
      });
    });
    elige(tabs[0]);
  });
  // barras de la obra y capas de materiales: se montan al entrar en pantalla
  var vis = d.querySelectorAll('.gantt, .mat-panel:not([hidden])');
  if (!quieto && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -15% 0px' });
    vis.forEach(function (el) { io.observe(el); });
  } else vis.forEach(function (el) { el.classList.add('visto'); });
})();
