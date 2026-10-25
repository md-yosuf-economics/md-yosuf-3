/* View-only document viewer. The image is drawn into a canvas, so the dialog holds no <img> to save, drag or copy.
   Loaded only on pages that contain documents. */
(function () {
  'use strict';
  var dlg = document.getElementById('viewer');
  if (!dlg || typeof dlg.showModal !== 'function') return;

  var canvas = dlg.querySelector('canvas');
  var ctx = canvas.getContext('2d');
  var cap = dlg.querySelector('#viewer-cap');
  var count = dlg.querySelector('[data-viewer-count]');
  var prev = dlg.querySelector('[data-viewer-prev]');
  var next = dlg.querySelector('[data-viewer-next]');
  var group = [], index = 0, opener = null, token = 0;

  function mark(w, h) {                       /* faint diagonal watermark for scans without one baked in */
    var size = Math.max(14, Math.round(w / 46)), step = Math.max(150, Math.round(Math.min(w, h) / 3.4));
    var diag = Math.sqrt(w * w + h * h), row = 0;
    ctx.save();
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = '#0E3A47';
    ctx.font = '600 ' + size + 'px system-ui, "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-Math.PI / 7);
    for (var y = -diag / 2; y < diag / 2; y += step, row++) {
      for (var x = -diag / 2; x < diag / 2; x += step * 2.7) {
        ctx.fillText('mdyosuf.site \u00b7 view only', x + (row % 2 ? step * 1.35 : 0), y);
      }
    }
    ctx.restore();
  }

  function paint(img, overlay) {
    var s = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
    var w = Math.max(1, Math.round(img.naturalWidth * s)), h = Math.max(1, Math.round(img.naturalHeight * s));
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    if (overlay) mark(w, h);
  }

  function failed() {
    canvas.width = 640;
    canvas.height = 140;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 640, 140);
    ctx.fillStyle = '#18323B';
    ctx.font = '20px system-ui, Arial, sans-serif';
    ctx.fillText('This document could not be loaded.', 24, 76);
  }

  function show(i) {
    index = (i + group.length) % group.length;
    var el = group[index], mine = ++token;
    var caption = el.getAttribute('data-caption') || '';
    cap.textContent = caption;
    canvas.setAttribute('aria-label', caption);
    count.textContent = group.length > 1 ? (index + 1) + ' of ' + group.length : '';
    prev.hidden = next.hidden = group.length < 2;
    dlg.setAttribute('aria-busy', 'true');
    var img = new Image();
    img.onload = function () {
      if (mine !== token) return;
      paint(img, el.getAttribute('data-overlay') === '1');
      dlg.removeAttribute('aria-busy');
      var stage = dlg.querySelector('.viewer-stage');
      if (stage) stage.scrollTop = 0;
    };
    img.onerror = function () { if (mine === token) { failed(); dlg.removeAttribute('aria-busy'); } };
    img.decoding = 'async';
    img.src = el.getAttribute('data-src');
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-viewer]');
    if (!el || el === dlg) return;
    var name = el.getAttribute('data-viewer');
    group = Array.prototype.slice.call(document.querySelectorAll('[data-viewer="' + name + '"]'));
    opener = el;
    dlg.setAttribute('data-group', name);
    dlg.showModal();
    show(group.indexOf(el));
  });

  prev.addEventListener('click', function () { show(index - 1); });
  next.addEventListener('click', function () { show(index + 1); });
  dlg.querySelector('[data-viewer-close]').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });   /* backdrop */
  dlg.addEventListener('close', function () {
    token++;
    canvas.width = 1;
    canvas.height = 1;
    if (opener && opener.focus) opener.focus();
  });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft' && group.length > 1) { e.preventDefault(); show(index - 1); }
    if (e.key === 'ArrowRight' && group.length > 1) { e.preventDefault(); show(index + 1); }
  });

  /* Saving, copying and printing are switched off while a document is open. */
  ['contextmenu', 'dragstart', 'copy', 'cut', 'selectstart'].forEach(function (ev) {
    dlg.addEventListener(ev, function (e) { e.preventDefault(); });
  });
  document.addEventListener('keydown', function (e) {
    if (dlg.open && (e.ctrlKey || e.metaKey) && /^[spc]$/i.test(e.key)) e.preventDefault();
  });
})();
