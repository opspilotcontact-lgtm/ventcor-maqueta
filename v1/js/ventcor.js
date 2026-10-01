// Ventcor · el mando (tecla MODO) y el presupuesto de 4 pasos. Sin dependencias.
(() => {
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- tecla MODO en la portada ---------- */
  const portada = document.querySelector('.portada[data-mando]') || document.querySelector('.portada');
  const sub = document.getElementById('sub-portada');
  const rotor = document.getElementById('rotor');
  const textos = {
    '': sub ? sub.textContent : '',
    frio: 'Aire acondicionado por conductos o split, pensado para el verano de Córdoba.',
    calor: 'Aerotermia y calefacción: una sola máquina para calentar la casa y el agua.',
    aire: 'Ventilación y extracción para cocinas, garajes, naves y locales.',
  };
  const giro = { '': 1, frio: 1.8, calor: 1.8, aire: 3.2 };
  let modoActual = portada?.dataset.modo || '';

  const velocidad = (m) => {
    if (quieto || !rotor) return;
    const a = rotor.getAnimations?.()[0];
    if (a) a.updatePlaybackRate ? a.updatePlaybackRate(giro[m]) : (a.playbackRate = giro[m]);
  };

  // páginas de servicio: el ventilador gira al ritmo de su modo desde el principio
  if (modoActual) setTimeout(() => velocidad(modoActual), 50);

  document.querySelectorAll('.portada .tecla').forEach((t) => {
    t.addEventListener('click', () => {
      const m = t.dataset.modo === modoActual ? '' : t.dataset.modo;
      modoActual = m;
      if (m) portada.dataset.modo = m; else delete portada.dataset.modo;
      document.querySelectorAll('.portada .tecla').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.modo === m)));
      if (sub && textos[m] !== undefined) sub.textContent = textos[m];
      velocidad(m);
    });
  });

  /* ---------- presupuesto ---------- */
  const dlg = document.getElementById('pres');
  if (!dlg) return;
  const form = dlg.querySelector('form');
  const pasos = [...dlg.querySelectorAll('[data-paso]')];
  const aspas = [...dlg.querySelectorAll('.progreso .asp')];
  const btnSeguir = document.getElementById('seguir');
  const btnAtras = document.getElementById('atras');
  const pasoN = document.getElementById('paso-n');
  const error = document.getElementById('error');
  const resumen = document.getElementById('resumen');
  const TOTAL = 4;
  let paso = 1;
  let origen = null;

  const mapaModo = { frio: 'Frío · aire acondicionado', calor: 'Calor · aerotermia o calefacción', aire: 'Aire · ventilación o extracción' };
  const mapaLugar = { nave: 'Nave u obra', local: 'Local u oficina', garaje: 'Comunidad o garaje' };

  const pinta = () => {
    pasos.forEach((p) => (p.hidden = Number(p.dataset.paso) !== paso));
    aspas.forEach((a, i) => a.classList.toggle('on', i < Math.min(paso, TOTAL)));
    btnAtras.hidden = paso === 1 || paso > TOTAL;
    pasoN.textContent = paso > TOTAL ? 'Enviado (simulado)' : `Paso ${paso} de ${TOTAL}`;
    btnSeguir.innerHTML = paso === TOTAL ? 'Ver mi solicitud' : paso > TOTAL ? 'Cerrar' : 'Siguiente <svg class="ico" aria-hidden="true"><use href="#i-flecha"/></svg>';
    error.textContent = '';
    const foco = pasos.find((p) => !p.hidden)?.querySelector('input,select,textarea,h3');
    if (foco) { if (foco.tagName === 'H3') foco.tabIndex = -1; foco.focus({ preventScroll: true }); }
  };

  const valido = () => {
    const f = new FormData(form);
    if (paso === 1 && !f.get('modo')) return 'Elige una opción para seguir.';
    if (paso === 2 && !f.get('lugar')) return 'Elige dónde es la instalación.';
    if (paso === 4) {
      if (!String(f.get('nombre') || '').trim()) return 'Dinos tu nombre.';
      const tel = String(f.get('tel') || '').replace(/[\s.-]/g, '');
      if (!/^(\+34)?[6789]\d{8}$/.test(tel)) return 'Revisa el teléfono: 9 cifras, empezando por 6, 7, 8 o 9.';
      if (!f.get('acepto')) return 'Necesitamos tu permiso para contestarte.';
    }
    return '';
  };

  const componer = () => {
    const f = new FormData(form);
    return [
      `Hola, soy ${String(f.get('nombre')).trim()}.`,
      `Necesito: ${f.get('modo')}`,
      `En: ${f.get('lugar')}${f.get('pueblo') ? ' · ' + String(f.get('pueblo')).trim() : ''}`,
      f.get('m2') ? `Superficie: ${f.get('m2')}` : '',
      String(f.get('nota') || '').trim() ? `Detalles: ${String(f.get('nota')).trim()}` : '',
      `Teléfono: ${String(f.get('tel')).trim()} · ${f.get('cuando')}`,
    ].filter(Boolean).join('\n');
  };

  const abrir = (b) => {
    origen = b;
    form.reset();
    paso = 1;
    let modo = b.dataset.modo || (b.hasAttribute('data-desde-portada') ? modoActual : '');
    if (modo && mapaModo[modo]) {
      form.querySelector(`input[name=modo][value="${mapaModo[modo]}"]`).checked = true;
      paso = 2;
    }
    if (b.dataset.lugar && mapaLugar[b.dataset.lugar]) {
      form.querySelector(`input[name=lugar][value="${mapaLugar[b.dataset.lugar]}"]`).checked = true;
      if (paso === 2) paso = 3;
    }
    dlg.showModal();
    pinta();
  };

  document.querySelectorAll('[data-pres]').forEach((b) => b.addEventListener('click', () => abrir(b)));
  dlg.querySelector('[data-cerrar]').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => origen?.focus());

  // elegir una opción en los pasos 1 y 2 avanza solo
  form.addEventListener('change', (e) => {
    if (e.target.type === 'radio' && (paso === 1 || paso === 2)) setTimeout(() => { paso++; pinta(); }, 180);
  });

  btnSeguir.addEventListener('click', () => {
    if (paso > TOTAL) return dlg.close();
    const e = valido();
    if (e) { error.textContent = e; return; }
    if (paso === TOTAL) resumen.textContent = componer();
    paso++;
    pinta();
  });
  btnAtras.addEventListener('click', () => { paso = Math.max(1, paso - 1); pinta(); });
})();
