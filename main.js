/* Constructora JM&R Sierra — interacciones ligeras (sin dependencias) */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Cada página abre siempre arriba (sin restaurar el scroll anterior), salvo que traiga un #ancla */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  function toTop() { if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }
  toTop();
  window.addEventListener('pageshow', toTop);
  /* Clic en una pestaña del menú o en el logo: si es la misma página, sube hasta arriba */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.site-header a[href], .footer a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var url = new URL(a.getAttribute('href'), location.href);
    if (url.hash || url.origin !== location.origin) return;
    var here = location.pathname.split('/').pop() || 'index.html', there = url.pathname.split('/').pop() || 'index.html';
    if (here === there) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); if (typeof closeMenu === 'function' && document.body.classList.contains('menu-open')) closeMenu(); }
  });

  /* Header sólido al hacer scroll */
  var header = document.querySelector('[data-header]');
  function onScrollHeader() { header.classList.toggle('is-solid', window.scrollY > 40); }
  onScrollHeader();

  /* Menú móvil */
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-menu]');
  /* Submenú de servicios en móvil: plegado por defecto, se abre con la flechita */
  var subBtn = document.querySelector('[data-sub-toggle]');
  function setSub(open) {
    if (!subBtn) return;
    subBtn.setAttribute('aria-expanded', String(open));
    subBtn.querySelector('.sr-only').textContent = open ? 'Ocultar servicios' : 'Mostrar servicios';
    subBtn.parentNode.classList.toggle('sub-open', open);
  }
  if (subBtn) subBtn.addEventListener('click', function (e) { e.preventDefault(); setSub(subBtn.getAttribute('aria-expanded') !== 'true'); });

  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('.sr-only').textContent = 'Abrir menú';
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
  }
  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr-only').textContent = open ? 'Cerrar menú' : 'Abrir menú';
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    /* El menú siempre abre desde arriba y con los servicios plegados */
    if (open) { menu.scrollTop = 0; setSub(false); }
    document.body.style.overflow = open ? 'hidden' : '';
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { closeMenu(); toggle.focus(); } });

  /* Revelado al entrar en pantalla */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var sibs = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('reveal'); }) : [];
        var i = Math.max(0, sibs.indexOf(el));
        el.style.transitionDelay = Math.min(i, 5) * 80 + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Contadores: el HTML trae el valor final; solo se animan si hay movimiento permitido */
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !reduce) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, end = parseInt(el.getAttribute('data-count'), 10), t0 = null, dur = 1600;
        function step(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * eased);
          if (p < 1) requestAnimationFrame(step);
        }
        el.textContent = '0';
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* Parallax ligero (solo transform, con rAF) */
  var layers = reduce ? [] : Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  function parallax() {
    var vh = window.innerHeight;
    layers.forEach(function (el) {
      var host = el.parentElement, r = host.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
      var offset = (r.top + r.height / 2 - vh / 2) * -speed;
      el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
    });
  }

  /* Enlace activo en el menú */
  var links = Array.prototype.slice.call(document.querySelectorAll('.menu a[href^="#"]'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function activeLink() {
    var y = window.scrollY + window.innerHeight * 0.35, current = -1;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= y) current = i; });
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === current); });
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScrollHeader(); parallax(); activeLink(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', parallax);
  parallax(); activeLink();

  /* Abrir el servicio cuando se llega por ancla (#ingenieria, etc.) */
  function openFromHash() {
    var t = location.hash && document.querySelector(location.hash);
    if (t && t.tagName === 'DETAILS') t.open = true;
  }
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
  document.querySelectorAll('.svc-note a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function () { var d = document.querySelector(a.getAttribute('href')); if (d) d.open = true; });
  });

  /* Formulario: valida y abre WhatsApp con el mensaje (provisional hasta conectar el formulario de WordPress) */
  var form = document.querySelector('[data-form]');
  if (form) {
    var err = form.querySelector('[data-form-error]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements, ok = true;
      ['nombre', 'correo', 'mensaje'].forEach(function (n) {
        var el = f[n], valid = el.value.trim() !== '' && (n !== 'correo' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
        el.setAttribute('aria-invalid', String(!valid));
        if (!valid && ok) { el.focus(); ok = false; }
      });
      err.hidden = ok;
      if (!ok) return;
      var lines = [
        'Hola, JM&R Sierra. Me gustaría agendar una cita.',
        'Nombre: ' + f.nombre.value.trim(),
        'Correo: ' + f.correo.value.trim()
      ];
      if (f.telefono.value.trim()) lines.push('Teléfono: ' + f.telefono.value.trim());
      if (f.servicio.value) lines.push('Servicio: ' + f.servicio.value);
      lines.push('Mensaje: ' + f.mensaje.value.trim());
      window.open('https://wa.me/526461311913?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  }

  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();

/* =========================================================
   Escena con scroll: la excavadora excava, avanza y queda sobre la banda;
   después pasan las letras gigantes y la franja de servicios.
   El video no se reproduce: el scroll lo adelanta o lo regresa.
   ========================================================= */
(function () {
  'use strict';
  var track = document.querySelector('[data-track]');
  if (!track) return;
  var scene = track.querySelector('[data-scene]');
  var q = function (s) { return scene.querySelector(s); };
  var video = q('[data-video]'), floor = q('[data-floor]'), cutout = q('[data-cutout]');
  var strip = q('[data-strip]'), giant = q('[data-giant]');
  var cue = q('[data-scroll-cue]');
  var readN = q('[data-readout-n]'), hero = q('[data-sx-hero]'), foot = q('[data-sx-foot]');
  var cards = Array.prototype.slice.call(scene.querySelectorAll('[data-card]'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Borde superior de la banda negra dentro del clip (fracción de su alto), cada 8 cuadros */
  var EDGES = [.821, .821, .821, .8196, .821, .821, .821, .821, .821, .8196, .8182, .8168, .8139,
    .8097, .804, .7969, .7884, .777, .7628, .7472, .7301, .7145, .6974, .6818, .669];
  /* El mismo borde medido más a la derecha (x = 1110 de 1248): la banda del clip queda un poco inclinada */
  var EDGES_R = [.821, .821, .821, .8196, .821, .821, .821, .821, .821, .8196, .8182, .8153, .8125,
    .8097, .804, .7955, .7855, .7741, .7585, .7415, .7244, .7074, .6889, .6705, .6562];
  var XL = 30 / 1248, XR = 1110 / 1248;
  var FPS = 24, CW = 1248, CH = 704, FINAL = .669;

  var A = 2.4, B = 2, vw = 0, vh = 0, narrow = false, stripW = 0, giantW = 0;
  var lineY0 = 0, lineSlope = 0, edgeYc = 0, headerB = 0;
  var clipTop = 0, top0 = 0, top1 = 0, left0 = 0, left1 = 0, clipH = 0, dur = 8.333;
  var target = 0, cur = 0, shown = 0, seeking = false, primed = false;
  var lastY = window.scrollY, lastT = performance.now(), speed = 0;
  var clamp = function (v, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, v)); };

  function edgeAt(t, tbl) {
    tbl = tbl || EDGES;
    var i = clamp(t * FPS / 8, 0, tbl.length - 1), a = Math.floor(i), b = Math.min(a + 1, tbl.length - 1);
    return tbl[a] + (tbl[b] - tbl[a]) * (i - a);
  }

  /* Altura estable en celular: la barra del navegador aparece y se esconde al hacer scroll y cambia
     innerHeight. Usamos la altura "grande" (100lvh, la misma de la escena) para que nada brinque. */
  var probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:100vh;height:100lvh;visibility:hidden;pointer-events:none';
  document.body.appendChild(probe);
  var lastW = 0, lastH = 0;
  function stableH() { return Math.max(probe.offsetHeight || 0, window.innerHeight); }
  function onResize() {
    var w = window.innerWidth, h = stableH();
    /* Si solo cambió la altura un poco (barra del navegador), no se recalcula la escena */
    if (w === lastW && Math.abs(h - lastH) < 160) return;
    layout();
  }

  function layout() {
    vw = window.innerWidth; vh = stableH(); lastW = vw; lastH = vh;
    if (video.duration && isFinite(video.duration)) dur = video.duration;
    narrow = vw < 768 || vw <= vh;
    scene.classList.toggle('is-narrow', narrow);
    var clipW, left, edgeY;
    if (narrow) {
      clipW = Math.max(vw * 1.6, 560); clipH = clipW * CH / CW;
      left = vw * .5 - clipW * .55;
      left0 = vw * .5 - clipW * .45;
      /* En celular la escena final queda pegada al menú: la parte de arriba del video
         (donde el brazo se sale del cuadro) siempre queda escondida detrás de la barra */
      /* Se mide el menú en su versión compacta (con scroll), que es como se ve cuando la máquina sube */
      var hdr = document.querySelector('[data-header]'), hadSolid = hdr && hdr.classList.contains('is-solid');
      if (hdr) {
        var tr = hdr.style.transition; hdr.style.transition = 'none';
        var lg = hdr.querySelectorAll('.logo'); lg.forEach(function (l) { l.style.transition = 'none'; });
        hdr.classList.add('is-solid');
        headerB = hdr.offsetHeight;
        if (!hadSolid) hdr.classList.remove('is-solid');
        void hdr.offsetHeight; hdr.style.transition = tr; lg.forEach(function (l) { l.style.transition = ''; });
      } else headerB = 64;
      headerB -= 1;
      edgeY = headerB + FINAL * clipH;
    } else {
      clipH = Math.min(vh * .84, vw * CH / CW * 1.02); clipW = clipH * CW / CH;
      left = (vw - clipW) / 2;
      edgeY = vh * .58;
      /* Portada: la máquina arranca más abajo y a la derecha para dejar libre la esquina superior izquierda */
      left0 = left + Math.min(vw * .16, Math.max(0, vw - clipW * .86));
    }
    /* En celular la banda arranca más abajo y sube con la máquina */
    top1 = edgeY - FINAL * clipH;
    top0 = Math.max(top1, vh * (narrow ? .78 : .8) - EDGES[0] * clipH);
    scene.style.setProperty('--hero-top', (narrow ? 92 : Math.max(96, vh * .15)).toFixed(0) + 'px');
    /* En celular la máquina de la portada no debe tapar los botones: su brazo (18 % del cuadro) queda debajo del texto */
    if (narrow && hero) {
      var heroBottom = hero.offsetTop + hero.offsetHeight + 18;
      top0 = Math.max(top0, Math.min(heroBottom - .18 * clipH, vh * .9 - EDGES[0] * clipH));
    }
    left1 = left;
    video.style.width = clipW.toFixed(1) + 'px';
    video.style.height = clipH.toFixed(1) + 'px';
    scene.style.setProperty('--edge', edgeY.toFixed(1) + 'px');
    edgeYc = edgeY;
    if (reduce) {
      scene.classList.add('is-static'); track.style.height = vh + 'px';
      /* Sin movimiento: se queda la portada (primer cuadro) con sus títulos */
      cur = target = 0;
      seek(); place(0);
      return;
    }
    stripW = strip.scrollWidth; giantW = giant.scrollWidth;
    B = (stripW + .45 * vw) / vw * (narrow ? .75 : 1.1);
    track.style.height = ((1 + A + B) * vh).toFixed(0) + 'px';
    place(shown);
    render();
  }

  /* El piso del DOM sigue al borde del cuadro que se ve, así la banda llega de lado a lado */
  function place(t) {
    var e = edgeAt(t), f = (EDGES[0] - e) / (EDGES[0] - FINAL);
    if (narrow) {
      /* En celular, en cuanto se va el texto la máquina sube rápido hasta el menú,
         antes de que el brazo llegue al borde del cuadro (≈1.7 s) */
      var g = clamp((t - .3) / 1.2); f = g * g * (3 - 2 * g);
    }
    clipTop = top0 + (top1 - top0) * f;
    var x = left0 + (left1 - left0) * f, clipW = clipH * CW / CH;
    video.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + clipTop.toFixed(1) + 'px,0)';
    /* Recorte de la pose final encima de las letras: así "NUESTROS SERVICIOS" pasa por detrás de la máquina */
    if (cutout) {
      cutout.style.width = clipW.toFixed(1) + 'px'; cutout.style.height = clipH.toFixed(1) + 'px';
      cutout.style.transform = video.style.transform;
      cutout.style.visibility = t >= 7.95 ? 'visible' : 'hidden';
    }
    /* Recta del borde, extendida a todo el ancho de la pantalla */
    var er = edgeAt(t, EDGES_R), slope = (er - e) * clipH / ((XR - XL) * clipW);
    var y0 = clipTop + e * clipH - slope * (x + XL * clipW) - 2, y1 = y0 + slope * vw;
    lineY0 = y0 + 2; lineSlope = slope;
    floor.style.clipPath = 'polygon(0 ' + y0.toFixed(1) + 'px,100% ' + y1.toFixed(1) + 'px,100% 100%,0 100%)';
  }

  function seek() {
    if (seeking || video.readyState < 1) return;
    if (Math.abs(video.currentTime - cur) < 1 / 60) return;
    seeking = true;
    video.currentTime = cur;
  }
  video.addEventListener('seeked', function () {
    seeking = false; shown = video.currentTime; place(shown); seek();
  });
  video.addEventListener('loadedmetadata', layout);

  /* iOS no decodifica cuadros hasta que el video se reproduce una vez */
  function prime() {
    if (primed) return; primed = true;
    if (video.readyState < 2) {
      var p = video.play();
      if (p && p.then) p.then(function () { video.pause(); seek(); }).catch(function () {});
    }
  }

  var raf = 0;
  function loop(now) {
    raf = 0;
    cur += (target - cur) * .2;
    if (Math.abs(target - cur) < .002) cur = target;
    seek();
    var dt = Math.max(16, now - lastT), sy = window.scrollY;
    speed += (Math.abs(sy - lastY) / dt * 1000 / 32 - speed) * .15;
    lastY = sy; lastT = now;
    window.JMR_WIND = speed;
    var n = Math.min(99, Math.round(speed));
    readN.textContent = (n < 10 ? '0' : '') + n;
    if (cur !== target || speed > .5) raf = requestAnimationFrame(loop);
  }
  function kick() { if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(loop); } }

  function render() {
    if (reduce) return;
    var y = window.scrollY - track.offsetTop;
    var pA = clamp(y / (A * vh));
    var r = clamp((y - A * vh) / (B * vh));
    target = pA * (dur - 1 / (FPS * 2));
    kick();

    /* La portada se va con los primeros movimientos del scroll */
    if (cue) cue.classList.toggle('is-gone', window.scrollY > 8);
    var k = clamp(pA / .07);
    hero.style.opacity = (1 - k).toFixed(3);
    hero.style.transform = 'translate3d(0,' + (-60 * k).toFixed(1) + 'px,0)';
    hero.style.visibility = k >= 1 ? 'hidden' : 'visible';
    foot.style.opacity = (1 - clamp(pA / .04)).toFixed(3);
    foot.style.visibility = pA >= .04 ? 'hidden' : 'visible';

    scene.style.setProperty('--ph', pA >= .94 ? 1 : 0);
    scene.style.setProperty('--pill', pA >= .94 && r < .035 ? 1 : 0);

    strip.style.transform = 'translate3d(' + (vw - r * (stripW + .45 * vw)).toFixed(1) + 'px,0,0)';
    /* Las letras se apoyan justo sobre el borde inclinado de la banda naranja */
    var gx = vw - r * (giantW + vw), gy = lineY0 + lineSlope * gx - edgeYc;
    giant.style.transform = 'translate3d(' + gx.toFixed(1) + 'px,' + gy.toFixed(1) + 'px,0) rotate(' + (Math.atan(lineSlope) * 180 / Math.PI).toFixed(3) + 'deg)';
    if (r > 0) cards.forEach(function (card) {
      var left = card.getBoundingClientRect().left;
      var s = clamp((.98 - left / vw) / .3, -.4, 1.6) * 100;
      card.style.setProperty('--s', s.toFixed(1) + '%');
    });
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    prime();
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { render(); ticking = false; });
  }, { passive: true });
  window.addEventListener('touchstart', prime, { passive: true, once: true });
  window.addEventListener('resize', onResize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  window.addEventListener('load', layout);
  layout();
})();

/* =========================================================
   Partículas naranjas: polvo de obra que sube despacio.
   En la escena de la excavadora se aceleran con el scroll.
   ========================================================= */
(function () {
  'use strict';
  var cans = Array.prototype.slice.call(document.querySelectorAll('[data-particles]'));
  if (!cans.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function Field(c) {
    this.c = c; this.ctx = c.getContext('2d'); this.on = false; this.p = [];
    this.scene = c.getAttribute('data-particles') === 'scene';
    this.size();
  }
  Field.prototype.size = function () {
    var r = this.c.getBoundingClientRect();
    this.w = r.width; this.h = r.height;
    this.c.width = Math.round(this.w * dpr); this.c.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(90, Math.max(18, this.w * this.h / 16000)));
    this.p = [];
    for (var i = 0; i < n; i++) this.p.push(this.make(true));
  };
  Field.prototype.make = function (anywhere) {
    var big = Math.random() < .12;
    return {
      x: Math.random() * this.w,
      y: anywhere ? Math.random() * this.h : this.h + 10,
      r: big ? 2.2 + Math.random() * 1.8 : .8 + Math.random() * 1.4,
      vy: -(.12 + Math.random() * .38),
      vx: (Math.random() - .5) * .16,
      a: .25 + Math.random() * .6,
      ph: Math.random() * 6.28,
      sq: Math.random() < .35
    };
  };
  Field.prototype.draw = function (dt) {
    var ctx = this.ctx, wind = this.scene ? Math.min(40, window.JMR_WIND || 0) : 0, f = dt / 16.7;
    ctx.clearRect(0, 0, this.w, this.h);
    for (var i = 0; i < this.p.length; i++) {
      var q = this.p[i];
      q.ph += .02 * f;
      q.x += (q.vx + Math.sin(q.ph) * .12 - wind * .05) * f;
      q.y += (q.vy - wind * .03) * f;
      if (q.y < -10 || q.x < -10 || q.x > this.w + 10) { this.p[i] = this.make(false); if (q.x < -10) this.p[i].x = this.w + 5; continue; }
      var tw = .75 + .25 * Math.sin(q.ph * 1.7);
      ctx.fillStyle = 'rgba(247,147,30,' + (q.a * tw).toFixed(3) + ')';
      if (q.sq) { ctx.fillRect(q.x - q.r, q.y - q.r, q.r * 2, q.r * 2); }
      else { ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.2832); ctx.fill(); }
    }
  };

  var fields = cans.map(function (c) { return new Field(c); });
  if (reduce) { fields.forEach(function (f) { f.draw(0); }); return; }

  var last = performance.now(), running = false;
  function tick(now) {
    var dt = Math.min(50, now - last), any = false; last = now;
    fields.forEach(function (f) { if (f.on) { f.draw(dt); any = true; } });
    running = any;
    if (any) requestAnimationFrame(tick);
  }
  function start() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); } }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var f = fields[cans.indexOf(e.target)];
        f.on = e.isIntersecting;
      });
      start();
    });
    cans.forEach(function (c) { io.observe(c); });
  } else { fields.forEach(function (f) { f.on = true; }); start(); }

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { fields.forEach(function (f) { f.size(); }); }, 150);
  });
})();

/* =========================================================
   Fondo técnico interactivo (canvas): cotas, reglas, grados,
   coordenadas, retículas y partículas naranjas sobre blanco.
   Reacciona al cursor con desplazamiento, atracción y conexión.
   ========================================================= */
(function () {
  'use strict';
  var cans = Array.prototype.slice.call(document.querySelectorAll('[data-tech]'));
  if (!cans.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var OR = '247,147,30';
  var FONT = '500 12px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  var mouse = { x: -9999, y: -9999, on: false, t: 0 };

  window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true; mouse.t = performance.now(); }, { passive: true });
  document.addEventListener('mouseleave', function () { mouse.on = false; });
  window.addEventListener('touchmove', function (e) { var t = e.touches[0]; if (t) { mouse.x = t.clientX; mouse.y = t.clientY; mouse.on = true; mouse.t = performance.now(); } }, { passive: true });
  window.addEventListener('touchend', function () { mouse.on = false; }, { passive: true });

  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------- Plantillas de elementos ---------- */
  var DRAW = {
    dim: function (c, e, p) {
      var L = e.len * p, h = L / 2;
      c.save(); c.translate(e.x, e.y); if (e.vert) c.rotate(-Math.PI / 2);
      c.beginPath();
      c.moveTo(-h, 0); c.lineTo(h, 0);
      c.moveTo(-e.len / 2, -9); c.lineTo(-e.len / 2, 9);
      c.moveTo(e.len / 2, -9); c.lineTo(e.len / 2, 9);
      if (p > .98) { c.moveTo(-h + 7, -3.5); c.lineTo(-h, 0); c.lineTo(-h + 7, 3.5); c.moveTo(h - 7, -3.5); c.lineTo(h, 0); c.lineTo(h - 7, 3.5); }
      c.stroke();
      c.globalAlpha *= p; c.fillText(e.label, 0, -10);
      c.restore();
    },
    ruler: function (c, e, p) {
      var step = e.len / 5;
      c.save(); c.translate(e.x, e.y);
      c.beginPath(); c.moveTo(0, 0); c.lineTo(e.len * p, 0);
      for (var i = 0; i <= 10; i++) { var x = i * step / 2; if (x > e.len * p) break; c.moveTo(x, 0); c.lineTo(x, i % 2 ? -5 : -10); }
      c.stroke();
      c.globalAlpha *= p;
      for (var j = 0; j <= 5; j++) c.fillText(j === 5 ? '5 m' : String(j), j * step + (j === 5 ? 8 : 0), 18);
      c.restore();
    },
    angle: function (c, e, p, t) {
      var a1 = e.a0 + (e.a1 - e.a0) * p;
      c.save(); c.translate(e.x, e.y);
      c.beginPath();
      c.moveTo(0, 0); c.lineTo(Math.cos(e.a0) * e.ray, Math.sin(e.a0) * e.ray);
      c.moveTo(0, 0); c.lineTo(Math.cos(a1) * e.ray, Math.sin(a1) * e.ray);
      c.stroke();
      c.setLineDash([3, 4]); c.lineDashOffset = -t * .01;
      c.beginPath(); c.arc(0, 0, e.r, e.a0, a1, e.a1 < e.a0); c.stroke(); c.setLineDash([]);
      var am = (e.a0 + a1) / 2;
      c.globalAlpha *= p; c.fillText(e.label, Math.cos(am) * (e.r + 18), Math.sin(am) * (e.r + 18) + 4);
      c.restore();
    },
    cross: function (c, e, p, t) {
      c.save(); c.translate(e.x, e.y); c.rotate(t * .00012 * e.dir);
      c.beginPath(); c.arc(0, 0, e.r * p, 0, 6.2832);
      c.moveTo(-e.r * 1.35 * p, 0); c.lineTo(e.r * 1.35 * p, 0);
      c.moveTo(0, -e.r * 1.35 * p); c.lineTo(0, e.r * 1.35 * p);
      c.stroke(); c.restore();
    },
    compass: function (c, e, p, t) {
      c.save(); c.translate(e.x, e.y);
      c.setLineDash([6, 7]); c.lineDashOffset = t * .006 * e.dir;
      c.beginPath(); c.arc(0, 0, e.r, e.a0, e.a0 + (e.a1 - e.a0) * p); c.stroke();
      c.setLineDash([]); c.restore();
    },
    dots: function (c, e, p, t) {
      for (var i = 0; i < e.cols; i++) for (var j = 0; j < e.rows; j++) {
        var dx = i - (e.cols - 1) / 2, dy = j - (e.rows - 1) / 2;
        var fall = 1 - Math.sqrt(dx * dx + dy * dy) / (Math.max(e.cols, e.rows) * .62);
        if (fall <= 0) continue;
        var tw = .65 + .35 * Math.sin(t * .0012 + i * .7 + j * 1.3);
        c.globalAlpha = e.alpha * fall * tw * p;
        c.fillRect(e.x + i * e.gap - 1, e.y + j * e.gap - 1, 2, 2);
      }
    },
    text: function (c, e, p) {
      c.save(); c.globalAlpha *= p; c.textAlign = 'left';
      for (var i = 0; i < e.lines.length; i++) c.fillText(e.lines[i], e.x, e.y + i * 18);
      c.restore();
    },
    plus: function (c, e, p) {
      var s = e.s * p;
      c.beginPath(); c.moveTo(e.x - s, e.y); c.lineTo(e.x + s, e.y); c.moveTo(e.x, e.y - s); c.lineTo(e.x, e.y + s); c.stroke();
    },
    frame: function (c, e, p) {
      c.save(); c.translate(e.x, e.y);
      c.beginPath(); c.moveTo(e.w * e.sx * p, 0); c.lineTo(0, 0); c.lineTo(0, e.h * p); c.stroke();
      c.strokeRect(e.sx > 0 ? 8 : -18, e.h - 18, 10, 10);
      c.restore();
    }
  };

  function build(f) {
    var w = f.w, h = f.h, R = rng(f.seed), small = w < 700, E = [];
    var pick = function (a) { return a[Math.floor(R() * a.length)]; };
    var add = function (o) { o.d = .35 + R() * .65; o.ox = 0; o.oy = 0; o.hot = 0; o.ph = R() * 6.28; E.push(o); };
    var labels = ['3.50 m', '2.40 m', '5.20 m', '1.20 m', '4.80 m', '6.00 m', '0.90 m', '12.00 m'];
    /* Se colocan en espacios vacíos: nunca encima de textos, botones ni fotos */
    var avoid = f.avoid || [];
    var free = function (bx, by, bw, bh) {
      if (bx < 4 || by < 4 || bx + bw > w - 4 || by + bh > h - 4) return false;
      for (var a = 0; a < avoid.length; a++) { var r = avoid[a]; if (bx < r[0] + r[2] + 18 && bx + bw > r[0] - 18 && by < r[1] + r[3] + 18 && by + bh > r[1] - 18) return false; }
      for (var o = 0; o < E.length; o++) { var q = E[o].box; if (q && bx < q[0] + q[2] + 30 && bx + bw > q[0] - 30 && by < q[1] + q[3] + 30 && by + bh > q[1] - 30) return false; }
      return true;
    };
    var place = function (bw, bh) {
      for (var tries = 0; tries < 40; tries++) { var bx = R() * (w - bw), by = R() * (h - bh); if (free(bx, by, bw, bh)) return [bx, by]; }
      return null;
    };
    var texts = [['31.8667° N', '116.5964° W'], ['1 m = 100 cm', '1 km = 1,000 m', '1 ft = 0.3048 m'], ['ESC. 1:100', 'N.P.T. +0.00']].sort(function () { return R() - .5; });
    var n = small ? 4 : 6, kinds = ['dim', 'ruler', 'angle', 'cross', 'text', 'dimv', 'dim', 'cross', 'text'];
    kinds.sort(function () { return R() - .5; });
    for (var i = 0; i < n; i++) {
      var k = kinds[i % kinds.length], len, ps;
      if (k === 'dim') { len = small ? 140 : 180 + R() * 120; ps = place(len, 34); if (ps) add({ k: 'dim', x: ps[0] + len / 2, y: ps[1] + 24, len: len, vert: false, label: pick(labels), box: [ps[0], ps[1], len, 34] }); }
      else if (k === 'dimv') { len = small ? 110 : 140 + R() * 90; ps = place(34, len); if (ps) add({ k: 'dim', x: ps[0] + 22, y: ps[1] + len / 2, len: len, vert: true, label: pick(labels), box: [ps[0], ps[1], 34, len] }); }
      else if (k === 'ruler') { len = small ? 160 : 230; ps = place(len + 30, 36); if (ps) add({ k: 'ruler', x: ps[0], y: ps[1] + 14, len: len, box: [ps[0], ps[1], len + 30, 36] }); }
      else if (k === 'angle') { var ray = small ? 80 : 120, deg = pick([30, 45, 60, 90]), a0 = pick([0, Math.PI]), sgn = R() < .5 ? 1 : -1; ps = place(ray * 1.1, ray * 1.1);
        if (ps) { var vx = a0 === 0 ? ps[0] : ps[0] + ray * 1.1, vy = sgn > 0 ? ps[1] + ray * 1.1 : ps[1]; add({ k: 'angle', x: vx, y: vy, ray: ray, r: 42, a0: a0, a1: a0 + (a0 === 0 ? -1 : 1) * sgn * deg * Math.PI / 180, label: deg + '°', box: [ps[0], ps[1], ray * 1.1, ray * 1.1] }); } }
      else if (k === 'cross') { var cr = 22 + R() * 12; ps = place(cr * 2.8, cr * 2.8); if (ps) add({ k: 'cross', x: ps[0] + cr * 1.4, y: ps[1] + cr * 1.4, r: cr, dir: R() < .5 ? 1 : -1, box: [ps[0], ps[1], cr * 2.8, cr * 2.8] }); }
      else if (k === 'text') { var lines = texts.length ? texts.pop() : null; if (!lines) continue; ps = place(140, lines.length * 18 + 8); if (ps) add({ k: 'text', x: ps[0], y: ps[1] + 14, lines: lines, box: [ps[0], ps[1], 140, lines.length * 18 + 8] }); }
    }
    /* Arcos de compás y escuadras en las orillas, detrás de todo */
    add({ k: 'compass', x: R() < .5 ? 0 : w, y: R() < .5 ? 0 : h, r: (small ? 140 : 220) + R() * 100, a0: 0, a1: 6.2832, dir: R() < .5 ? 1 : -1 });
    if (!small) add({ k: 'frame', x: R() < .5 ? 0 : w, y: h * (.15 + R() * .6), w: 140, h: 150, sx: 1 });
    E[E.length - 1].sx = E[E.length - 1].x > 0 ? -1 : 1;
    var patches = small ? 2 : 3;
    for (var j = 0; j < patches; j++) add({ k: 'dots', x: R() * w * .8, y: R() * h * .8, cols: 6 + Math.floor(R() * 6), rows: 5 + Math.floor(R() * 5), gap: 22, alpha: .5 });
    for (var m = 0; m < (small ? 3 : 5); m++) { var pp = place(24, 24); if (pp) add({ k: 'plus', x: pp[0] + 12, y: pp[1] + 12, s: 5 + R() * 6, box: [pp[0], pp[1], 24, 24] }); }
    f.els = E;
    /* Partículas */
    var count = Math.round(clamp(w * h / 26000, 16, small ? 26 : 54));
    f.pts = [];
    for (var q = 0; q < count; q++) f.pts.push({ x: R() * w, y: R() * h, vx: (R() - .5) * .2, vy: -(.05 + R() * .22), r: R() < .15 ? 2 : 1 + R() * .9, a: .35 + R() * .45, sq: R() < .4 });
  }

  function Field(c, i) {
    this.c = c; this.ctx = c.getContext('2d'); this.seed = 4242 + i * 977; this.on = false; this.start = 0;
    this.col = c.getAttribute('data-tech-color') || OR;
    this.cur = { x: -9999, y: -9999, a: 0 };
    this.size();
  }
  Field.prototype.size = function () {
    var r = this.c.getBoundingClientRect();
    this.w = r.width; this.h = r.height;
    this.c.width = Math.round(this.w * dpr); this.c.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var host = this.c.parentElement, av = [];
    Array.prototype.forEach.call(host.querySelectorAll('h1,h2,h3,p,a.btn,.link-arrow,img,.ph,.member-photo,form,ul.contact-data,.crumbs,.tel-link'), function (el) {
      var b = el.getBoundingClientRect(), pend = el.closest('.reveal:not(.is-in)') ? 56 : 0; /* aún sin entrar */
      if (b.width && b.height) av.push([b.left - r.left, b.top - r.top - pend, b.width, b.height + pend]);
    });
    if (r.top + window.scrollY < 20) av.push([0, 0, this.w, 100]); /* zona del encabezado */
    this.avoid = av;
    build(this);
  };
  Field.prototype.draw = function (now) {
    var c = this.ctx, w = this.w, h = this.h, rect = this.c.getBoundingClientRect();
    var mx = mouse.x - rect.left, my = mouse.y - rect.top;
    var inside = mouse.on && mx > -40 && my > -40 && mx < w + 40 && my < h + 40 && now - mouse.t < 4000;
    c.clearRect(0, 0, w, h);
    c.lineWidth = 1; c.font = FONT; c.textAlign = 'center'; c.lineCap = 'round';
    var el = this.els, i;
    for (i = 0; i < el.length; i++) {
      var e = el[i], p = reduce ? 1 : ease(clamp((now - this.start - i * 110) / 1500, 0, 1));
      if (p <= 0) continue;
      /* Desplazamiento: paralaje suave + repulsión cerca del cursor */
      var tx = 0, ty = 0, hot = 0;
      if (inside) {
        tx = -(mx - w / 2) / w * 18 * e.d; ty = -(my - h / 2) / h * 14 * e.d;
        var dx = e.x - mx, dy = e.y - my, dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < 220) { var push = (1 - dist / 220) * 14 * e.d; tx += dx / dist * push; ty += dy / dist * push; hot = 1 - dist / 220; }
      }
      e.ox += (tx - e.ox) * .06; e.oy += (ty - e.oy) * .06; e.hot += (hot - e.hot) * .08;
      var fy = reduce ? 0 : Math.sin(now * .0006 + e.ph) * 2.2;
      var alpha = (e.k === 'dots' ? 1 : .34) + e.hot * .4;
      c.save(); c.translate(e.ox, e.oy + fy);
      c.strokeStyle = 'rgba(' + this.col + ',1)'; c.fillStyle = 'rgba(' + this.col + ',1)';
      c.globalAlpha = e.k === 'text' ? .55 + e.hot * .35 : alpha;
      DRAW[e.k](c, e, p, now);
      c.restore();
    }
    /* Partículas con atracción y conexión al cursor */
    var pts = this.pts, near = [];
    for (i = 0; i < pts.length; i++) {
      var q = pts[i];
      if (!reduce) {
        if (inside) {
          var ddx = mx - q.x, ddy = my - q.y, dd = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
          if (dd < 200) { var f = (1 - dd / 200) * .045; q.vx += ddx / dd * f; q.vy += ddy / dd * f; if (dd < 150) near.push([q, dd]); }
        }
        q.vx *= .975; q.vy = q.vy * .975 + (-.12 - q.vy) * .01;
        q.x += q.vx; q.y += q.vy;
        if (q.y < -10) { q.y = h + 8; q.x = Math.random() * w; }
        if (q.x < -10) q.x = w + 8; else if (q.x > w + 10) q.x = -8;
      }
      c.globalAlpha = q.a; c.fillStyle = 'rgba(' + this.col + ',1)';
      if (q.sq) c.fillRect(q.x - q.r, q.y - q.r, q.r * 2, q.r * 2); else { c.beginPath(); c.arc(q.x, q.y, q.r, 0, 6.2832); c.fill(); }
    }
    if (inside && near.length) {
      c.strokeStyle = 'rgba(' + this.col + ',1)'; c.lineWidth = .8;
      for (i = 0; i < near.length; i++) {
        c.globalAlpha = (1 - near[i][1] / 150) * .45;
        c.beginPath(); c.moveTo(near[i][0].x, near[i][0].y); c.lineTo(mx, my); c.stroke();
        for (var k2 = i + 1; k2 < near.length; k2++) {
          var a = near[i][0], b = near[k2][0], ab = Math.hypot(a.x - b.x, a.y - b.y);
          if (ab < 90) { c.globalAlpha = (1 - ab / 90) * .3; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
        }
      }
    }
    /* Mira del cursor con coordenadas en metros (escala 1 m = 100 px) */
    var cu = this.cur;
    cu.a += ((inside && fine ? 1 : 0) - cu.a) * .1;
    if (cu.a > .01) {
      cu.x += (mx - cu.x) * .18; cu.y += (my - cu.y) * .18;
      if (cu.x < -999) { cu.x = mx; cu.y = my; }
      c.globalAlpha = .5 * cu.a; c.strokeStyle = 'rgba(' + this.col + ',1)'; c.lineWidth = 1;
      c.beginPath(); c.arc(cu.x, cu.y, 14, 0, 6.2832);
      c.moveTo(cu.x - 22, cu.y); c.lineTo(cu.x - 8, cu.y); c.moveTo(cu.x + 8, cu.y); c.lineTo(cu.x + 22, cu.y);
      c.moveTo(cu.x, cu.y - 22); c.lineTo(cu.x, cu.y - 8); c.moveTo(cu.x, cu.y + 8); c.lineTo(cu.x, cu.y + 22);
      c.stroke();
      c.globalAlpha = .6 * cu.a; c.fillStyle = 'rgba(' + this.col + ',1)'; c.textAlign = 'left';
      c.fillText('x ' + (cu.x / 100).toFixed(2) + ' m · y ' + (cu.y / 100).toFixed(2) + ' m', cu.x + 26, cu.y - 14);
    } else { cu.x = -9999; }
    c.globalAlpha = 1;
  };

  var fields = cans.map(function (c, i) { return new Field(c, i); });
  if (reduce) {
    var paintAll = function () { fields.forEach(function (f) { f.draw(performance.now()); }); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(paintAll); else paintAll();
    window.addEventListener('resize', function () { fields.forEach(function (f) { f.size(); f.draw(0); }); });
    return;
  }

  var running = false;
  function tick(now) {
    var any = false;
    fields.forEach(function (f) { if (f.on) { f.draw(now); any = true; } });
    running = any;
    if (any) requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var f = fields[cans.indexOf(e.target)];
        f.on = e.isIntersecting;
        if (f.on && !f.start) f.start = performance.now() + 150;
      });
      if (!running) { running = true; requestAnimationFrame(tick); }
    }, { rootMargin: '60px 0px' });
    cans.forEach(function (c) { io.observe(c); });
  }
  var rt;
  var resizeAll = function () { fields.forEach(function (f) { f.size(); }); };
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resizeAll, 160); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resizeAll);
  window.addEventListener('load', resizeAll);
})();

/* Tarjetas que se expanden: con el cursor en escritorio y con un toque en celular */
(function () {
  'use strict';
  var groups = document.querySelectorAll('[data-xcards]');
  var hover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  Array.prototype.forEach.call(groups, function (g) {
    var cards = Array.prototype.slice.call(g.querySelectorAll('[data-xcard]'));
    function open(card) {
      cards.forEach(function (c) {
        var on = c === card;
        c.classList.toggle('is-active', on);
        c.querySelector('.xcard-tab').setAttribute('aria-expanded', String(on));
      });
    }
    cards.forEach(function (c) {
      if (hover) c.addEventListener('mouseenter', function () { open(c); });
      c.querySelector('.xcard-tab').addEventListener('click', function () { open(c); });
      c.addEventListener('focusin', function () { if (!c.classList.contains('is-active')) open(c); });
    });
  });
})();

/* ===== Casco JM&R: entra desde la derecha, se queda, sale a la derecha ===== */
(function () {
  var slot = document.querySelector('[data-helmet]');
  if (!slot) return;
  var img = slot.querySelector('img');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { img.style.opacity = 1; img.style.transform = 'none'; return; }
  var cur = 1, target = 1, running = false, visible = false;
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  // k: 1 = fuera a la derecha, 0 = en su lugar
  function measure() {
    var r = slot.getBoundingClientRect(), vh = window.innerHeight;
    var c = (r.top + r.height / 2) / vh; // 1 = abajo, 0 = arriba
    if (c > 0.6) return 1 - ease(clamp((1.02 - c) / 0.42));      // entrada
    if (c > 0.22) return 0;                                       // quieto
    return ease(clamp((0.22 - c) / 0.34));                        // salida
  }
  function render() {
    var r = slot.getBoundingClientRect();
    var dist = window.innerWidth - r.left + 40;
    var x = cur * dist, rot = cur * 16, y = cur * -14;
    img.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + rot.toFixed(2) + 'deg)';
    img.style.opacity = (1 - cur * 0.6).toFixed(3);
  }
  function tick() {
    target = measure();
    cur += (target - cur) * 0.12;
    if (Math.abs(target - cur) < 0.0008) cur = target;
    render();
    if (visible || cur !== target) requestAnimationFrame(tick); else running = false;
  }
  function start() { if (!running) { running = true; requestAnimationFrame(tick); } }
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) start(); }, { rootMargin: '20% 0px' }).observe(slot);
  window.addEventListener('scroll', start, { passive: true });
  window.addEventListener('resize', start);
  render();
})();

/* ===== Servicios: cada sección se queda fija y la siguiente se encima ===== */
(function () {
  var stack = document.querySelector('[data-stack]');
  if (!stack) return;
  var items = [].slice.call(stack.children);
  function fit() {
    var vh = window.innerHeight;
    /* Si la sección es más alta que la pantalla, se fija cuando ya se vio completa */
    items.forEach(function (el) { el.style.setProperty('--st', Math.min(0, vh - el.offsetHeight) + 'px'); });
  }
  fit();
  var fw = window.innerWidth;
  window.addEventListener('resize', function () { if (window.innerWidth !== fw) { fw = window.innerWidth; fit(); } });
  window.addEventListener('load', fit);
  if (window.ResizeObserver) new ResizeObserver(fit).observe(stack);
})();

/* ===== Frase que se pinta palabra por palabra al hacer scroll ===== */
(function () {
  var box = document.querySelector('[data-paint]');
  if (!box) return;
  var p = box.querySelector('p');
  var words = p.textContent.trim().split(/\s+/);
  p.setAttribute('aria-label', p.textContent.trim());
  p.innerHTML = words.map(function (w) { return '<span class="w" aria-hidden="true">' + w.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span>'; }).join(' ');
  var spans = [].slice.call(p.querySelectorAll('.w'));
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { spans.forEach(function (s) { s.classList.add('on'); }); return; }
  var ticking = false;
  function update() {
    ticking = false;
    var r = p.getBoundingClientRect(), vh = window.innerHeight;
    /* empieza cuando la frase entra por abajo y termina cuando su final llega a ~40% de la pantalla */
    var start = vh * .9, end = vh * .4;
    var prog = (start - r.top) / ((start - end) + r.height);
    prog = Math.max(0, Math.min(1, prog));
    var n = Math.round(prog * spans.length);
    spans.forEach(function (s, i) { s.classList.toggle('on', i < n); });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
