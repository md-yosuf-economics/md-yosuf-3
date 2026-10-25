/* Md. Yosuf portfolio: menu, citation copy, old-link redirects, image guards. No tracking, no external requests. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;

  /* The document viewer needs <dialog>; where it is missing the view buttons are hidden. */
  if (typeof HTMLDialogElement !== 'function') root.classList.add('no-viewer');

  /* Copy-citation buttons stay hidden unless the clipboard API exists. */
  var status = d.querySelector('[data-copy-status]');
  Array.prototype.forEach.call(d.querySelectorAll('[data-copy]'), function (b) {
    if (!(navigator.clipboard && navigator.clipboard.writeText)) return;
    b.hidden = false;
    b.addEventListener('click', function () {
      navigator.clipboard.writeText(b.getAttribute('data-copy')).then(function () {
        var label = b.textContent;
        b.textContent = 'Copied';
        if (status) status.textContent = 'Citation copied to the clipboard.';
        setTimeout(function () { b.textContent = label; if (status) status.textContent = ''; }, 2000);
      }, function () {
        if (status) status.textContent = 'Copy failed. Select the citation text instead.';
      });
    });
  });

  /* Mobile menu: close on link, outside tap, Escape, or when the layout switches to the side rail. */
  var menu = d.querySelector('.topbar .menu');
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) menu.open = false;
    });
    d.addEventListener('click', function (e) {
      if (menu.open && !menu.contains(e.target)) menu.open = false;
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.open) {
        menu.open = false;
        var s = menu.querySelector('summary');
        if (s) s.focus();
      }
    });
    if (window.matchMedia) {
      var mq = window.matchMedia('(min-width: 1024px)');
      var close = function (m) { if (m.matches) menu.open = false; };
      if (mq.addEventListener) mq.addEventListener('change', close); else if (mq.addListener) mq.addListener(close);
    }
  }

  /* Links to the old one-page site (#awards, #about ...) go to the matching page. */
  if (d.body.getAttribute('data-page') === 'home' && location.hash.length > 1) {
    var map = {
      about: 'about.html', education: 'education.html', expertise: 'expertise.html', experience: 'experience.html',
      projects: 'projects.html', publications: 'publications.html', skills: 'skills.html', awards: 'honours.html',
      leadership: 'leadership.html', volunteering: 'volunteering.html', conferences: 'conferences.html',
      magazine: 'magazine.html', certifications: 'certifications.html', affiliations: 'affiliations.html',
      contact: 'contact.html'
    };
    var target = map[location.hash.slice(1)];
    if (target) location.replace(target);
  }

  /* Documents are view-only: no context menu or dragging on protected images and the viewer. */
  function guard(e) {
    if (e.target.closest && e.target.closest('.doc-img, .doc-btn, .page-btn, .viewer')) e.preventDefault();
  }
  d.addEventListener('contextmenu', guard);
  d.addEventListener('dragstart', guard);
})();
