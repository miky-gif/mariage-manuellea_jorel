/* =========================================================
   Mariage Manuela & Jorel — interactions
   ========================================================= */
(function () {
  'use strict';

  /* (L'ouverture systematique sur le hero est geree par un script en <head> de index.html) */

  /* ---------- Son de la video du hero ----------
     La video demarre en muet (obligatoire pour l'autoplay des navigateurs).
     Le son s'active au 1er geste de l'invite (autorise apres interaction) ou via le bouton.
     Il se coupe quand le hero n'est plus a l'ecran, et revient au retour. */
  (function heroSound() {
    var video = document.querySelector('.hero__video');
    var btn = document.getElementById('soundBtn');
    if (!video || !btn) return;
    var tx = document.getElementById('soundTx');
    var wantsSound = false;

    function apply() {
      video.muted = !wantsSound;   // le son persiste sur toute la page tant qu'il est active
      if (!video.muted) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
      btn.classList.toggle('is-on', wantsSound);
      btn.setAttribute('aria-pressed', wantsSound ? 'true' : 'false');
      btn.setAttribute('aria-label', wantsSound ? 'Couper le son de la vidéo' : 'Activer le son de la vidéo');
      if (tx) tx.textContent = wantsSound ? 'Son activé' : 'Activer le son';
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      wantsSound = !wantsSound;
      apply();
    });

    // Activation auto DES QUE l'invite touche l'ecran (meme pour scroller), clique ou tape.
    // (sauf si ce 1er geste vise deja le bouton, qui se gere lui-meme)
    var armed = true;
    function autoOn(e) {
      if (!armed) return;
      if (e && e.target && btn.contains(e.target)) return; // clic sur le bouton -> gere par son handler
      armed = false;
      if (!wantsSound) { wantsSound = true; apply(); }
      // on retire les ecouteurs une fois le son active
      ['touchstart', 'pointerdown', 'mousedown', 'click', 'keydown', 'wheel'].forEach(function (ev) {
        window.removeEventListener(ev, autoOn);
      });
    }
    ['touchstart', 'pointerdown', 'mousedown', 'click', 'keydown', 'wheel'].forEach(function (ev) {
      window.addEventListener(ev, autoOn, { passive: true });
    });

    apply();
  })();

  /* ---------- Compte a rebours (6 fevrier 2027, 10h00, heure de Yaounde UTC+1) ---------- */
  var TARGET = new Date('2027-02-06T10:00:00+01:00').getTime();
  var el = {
    d: document.getElementById('cd-d'),
    h: document.getElementById('cd-h'),
    m: document.getElementById('cd-m'),
    s: document.getElementById('cd-s'),
    intro: document.getElementById('cdIntro')
  };
  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    var diff = TARGET - Date.now();
    if (diff <= 0) {
      el.d.textContent = '00'; el.h.textContent = '00'; el.m.textContent = '00'; el.s.textContent = '00';
      if (el.intro) el.intro.textContent = 'Le grand jour est arrivé';
      clearInterval(timer);
      return;
    }
    el.d.textContent = String(Math.floor(diff / 86400000));
    el.h.textContent = pad(Math.floor(diff / 3600000) % 24);
    el.m.textContent = pad(Math.floor(diff / 60000) % 60);
    el.s.textContent = pad(Math.floor(diff / 1000) % 60);
  }
  tick();
  var timer = setInterval(tick, 1000);

  /* ---------- Nav : fond au defilement ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > window.innerHeight * 0.7) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  var menuClose = document.getElementById('menuClose');
  function openMenu() { menu.hidden = false; burger.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; }
  function closeMenu() { menu.hidden = true; burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
  burger.addEventListener('click', openMenu);
  menuClose.addEventListener('click', closeMenu);
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* ---------- Reveal au defilement ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-shown'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (n) { io.observe(n); });
  } else {
    reveals.forEach(function (n) { n.classList.add('is-shown'); });
  }

  /* ---------- Galerie + lightbox ---------- */
  var PHOTOS = [
    { src: 'assets/images/gallery-1.jpg', label: '' },
    { src: 'assets/images/gallery-2.jpg', label: '' },
    { src: 'assets/images/gallery-3.jpg', label: '' },
    { src: 'assets/images/gallery-4.jpg', label: '' },
    { src: 'assets/images/gallery-5.jpg', label: '' },
    { src: 'assets/images/gallery-6.jpg', label: '' },
    { src: 'assets/images/gallery-7.jpg', label: '' }
  ];
  var grid = document.getElementById('galleryGrid');
  PHOTOS.forEach(function (p, i) {
    var b = document.createElement('button');
    b.className = 'gcell';
    b.type = 'button';
    b.setAttribute('aria-label', 'Agrandir : ' + p.label);
    b.innerHTML =
      '<img src="' + p.src + '" alt="' + p.label + '" loading="lazy" width="1080" height="1350" />' +
      '<span class="gcell__cap"><span>' + p.label + '</span>' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F2B097" stroke-width="1.6"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span>';
    b.addEventListener('click', function () { openLightbox(i); });
    grid.appendChild(b);
  });

  /* ---------- Carrousel galerie (mobile : une seule ligne + defilement auto) ---------- */
  (function initCarousel() {
    var mq = window.matchMedia('(max-width: 720px)');
    var cells = grid.children;
    var lbEl = document.getElementById('lightbox');

    // pastilles de navigation
    var dots = document.createElement('div');
    dots.className = 'gallery__dots';
    for (var i = 0; i < PHOTOS.length; i++) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'gallery__dot';
      d.setAttribute('aria-label', 'Aller à la photo ' + (i + 1));
      (function (idx) { d.addEventListener('click', function () { goTo(idx, true); }); })(i);
      dots.appendChild(d);
    }
    grid.parentNode.appendChild(dots);
    var dotEls = dots.children;

    var current = 0, timer = null, pauseUntil = 0;

    function goTo(i, user) {
      current = (i + cells.length) % cells.length;
      grid.scrollTo({ left: cells[current].offsetLeft, behavior: 'smooth' });
      updateDots();
      if (user) pauseUntil = Date.now() + 7000; // pause apres une action manuelle
    }
    function updateDots() {
      for (var k = 0; k < dotEls.length; k++) dotEls[k].classList.toggle('is-active', k === current);
    }

    // suit le defilement manuel pour garder la bonne pastille active
    var deb;
    grid.addEventListener('scroll', function () {
      clearTimeout(deb);
      deb = setTimeout(function () {
        var best = 0, bestD = Infinity;
        for (var k = 0; k < cells.length; k++) {
          var dd = Math.abs(cells[k].offsetLeft - grid.scrollLeft);
          if (dd < bestD) { bestD = dd; best = k; }
        }
        current = best; updateDots();
      }, 120);
    }, { passive: true });
    grid.addEventListener('pointerdown', function () { pauseUntil = Date.now() + 7000; });
    grid.addEventListener('touchstart', function () { pauseUntil = Date.now() + 7000; }, { passive: true });

    function tick() {
      if (Date.now() < pauseUntil) return;      // en pause apres interaction
      if (!lbEl.hidden) return;                 // photo ouverte en grand
      goTo(current + 1, false);
    }
    function enable() { if (!timer) { updateDots(); timer = setInterval(tick, 3500); } }
    function disable() { if (timer) { clearInterval(timer); timer = null; } grid.scrollTo({ left: 0 }); }
    function apply() { if (mq.matches) enable(); else disable(); }

    apply();
    if (mq.addEventListener) mq.addEventListener('change', apply); else mq.addListener(apply);
  })();

  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var lbIndex = 0;
  function renderLb() {
    var p = PHOTOS[lbIndex];
    lbImg.src = p.src; lbImg.alt = p.label;
    lbCap.innerHTML = '<span>' + p.label + '</span><span style="width:4px;height:4px;border-radius:50%;background:#F2B097"></span>' +
      '<span style="color:#F2B097">' + String(lbIndex + 1).padStart(2, '0') + ' / ' + String(PHOTOS.length).padStart(2, '0') + '</span>';
  }
  function openLightbox(i) { lbIndex = i; renderLb(); lb.hidden = false; document.body.style.overflow = 'hidden'; }
  function closeLightbox() { lb.hidden = true; document.body.style.overflow = ''; }
  function step(d) { lbIndex = (lbIndex + d + PHOTOS.length) % PHOTOS.length; renderLb(); }
  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
  document.getElementById('lbNext').addEventListener('click', function (e) { e.stopPropagation(); step(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
  window.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  });

  /* ---------- RSVP ---------- */
  // MODE DÉMO : true = le formulaire affiche la confirmation SANS enregistrer (présentation visuelle).
  // false = enregistrement réel dans la base de données (via /api/rsvp).
  var DEMO_MODE = false;

  var attending = null;
  var btnYes = document.getElementById('btnYes');
  var btnNo = document.getElementById('btnNo');
  var fName = document.getElementById('fName');
  var fPhone = document.getElementById('fPhone');
  var fMsg = document.getElementById('fMsg');
  var errName = document.getElementById('errName');
  var errPhone = document.getElementById('errPhone');
  var errAttend = document.getElementById('errAttend');
  var errSubmit = document.getElementById('errSubmit');
  var submitBtn = document.getElementById('rsvpSubmit');
  var formBox = document.getElementById('rsvpForm');
  var doneBox = document.getElementById('rsvpDone');

  btnYes.addEventListener('click', function () { attending = 'oui'; btnYes.classList.add('is-yes'); btnNo.classList.remove('is-no'); errAttend.hidden = true; });
  btnNo.addEventListener('click', function () { attending = 'non'; btnNo.classList.add('is-no'); btnYes.classList.remove('is-yes'); errAttend.hidden = true; });
  fName.addEventListener('input', function () { if (fName.value.trim()) errName.hidden = true; });
  fPhone.addEventListener('input', function () { if (fPhone.value.trim()) errPhone.hidden = true; });

  submitBtn.addEventListener('click', function () {
    var name = fName.value.trim();
    var phone = fPhone.value.trim();
    var ok = true;
    errSubmit.hidden = true;
    if (!name) { errName.hidden = false; ok = false; }
    if (!phone) { errPhone.hidden = false; ok = false; }
    if (!attending) { errAttend.hidden = false; ok = false; }
    if (!ok) return;

    submitBtn.disabled = true;
    var prevLabel = submitBtn.textContent;
    submitBtn.textContent = 'Envoi en cours...';

    // Mode démo : on affiche simplement la confirmation, sans appeler le backend.
    if (DEMO_MODE) {
      setTimeout(function () {
        submitBtn.disabled = false; submitBtn.textContent = prevLabel;
        showConfirmation(name);
      }, 600);
      return;
    }

    fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, phone: phone, attending: attending, message: fMsg.value.trim() })
    })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function () { showConfirmation(name); })
      .catch(function () {
        errSubmit.hidden = false;
        errSubmit.textContent = 'Une erreur est survenue. Vérifiez votre connexion et réessayez.';
      })
      .finally(function () { submitBtn.disabled = false; submitBtn.textContent = prevLabel; });
  });

  function showConfirmation(name) {
    var title = document.getElementById('doneTitle');
    var msg = document.getElementById('doneMsg');
    if (attending === 'non') {
      title.textContent = 'Merci pour votre réponse';
      msg.textContent = name + ', votre présence nous manquera. Nous penserons très fort à vous le 6 février 2027.';
    } else {
      title.textContent = 'Votre présence est confirmée';
      msg.textContent = name + ', nous avons hâte de célébrer ce grand jour à vos côtés, le 6 février 2027 à Yaoundé.';
    }
    formBox.hidden = true;
    doneBox.hidden = false;
  }

  document.getElementById('rsvpReset').addEventListener('click', function () {
    doneBox.hidden = true;
    formBox.hidden = false;
  });

})();
