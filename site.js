/* Projects showcase — ship log, stats and reveal. Data: data/projects.js (window.SHOWCASE). */
(function () {
  "use strict";
  var D = window.SHOWCASE;
  if (!D) return;
  var S = D.stats, items = D.items.filter(function (i) { return i.date; });
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var HE = (document.documentElement.lang || "").slice(0, 2) === "he", RTL = document.documentElement.dir === "rtl";
  /* UI strings — the page itself is static HTML per language; these are the bits site.js writes */
  var T = HE ? {
    mon: ["ינו׳","פבר׳","מרץ","אפר׳","מאי","יוני","יולי","אוג׳","ספט׳","אוק׳","נוב׳","דצמ׳"],
    monLong: ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"],
    side: { ent: "ארגון", su: "סטארטאפ", own: "מוצר שלנו" },
    cat: { training: "הדרכה", deck: "הרצאה או מצגת", system: "מערכת ללקוח", product: "מוצר", rnd: "מחקר ופיתוח" },
    pace: function (a, b) { return "בין " + a + " ל " + b + " פרויקטים בכל חודש"; },
    day: function (d, m) { return d + " ב" + m; },
    sameDay: "עלה לאוויר באותו יום", nextDay: "עלה לאוויר למחרת", inDays: function (n) { return "עלה לאוויר תוך " + n + " ימים"; },
    open: "לפתיחה ↖", conf: "חסוי, אין קישור ציבורי", client: "לקוח", peakTag: "שיא",
    hint: "אפשר לגרור או להחליק", prev: "הקודם", next: "הבא", pause: "עצירה", resume: "הפעלה",
    car: { ".builds": "פרויקטים", ".cases": "הדרכות", ".prods": "המוצרים שלנו" }
  } : {
    mon: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    monLong: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    side: { ent: "Enterprise", su: "Startup / SMB", own: "Our product" },
    cat: { training: "Training", deck: "Talk / deck", system: "Client system", product: "Product", rnd: "R&D" },
    pace: function (a, b) { return a + " to " + b + " projects every month"; },
    day: function (d, m) { return d + " " + m; },
    sameDay: "live the same day", nextDay: "live the next day", inDays: function (n) { return "live in " + n + " days"; },
    open: "open ↗", conf: "confidential, no public link", client: "Client", peakTag: "peak",
    hint: "Drag or swipe to explore", prev: "Previous", next: "Next", pause: "Pause motion", resume: "Resume motion",
    car: { ".builds": "Projects", ".cases": "Training case studies", ".prods": "Our products" }
  };
  var MON = T.mon, SIDE = T.side, CAT = T.cat;
  function titleOf(i) { return (HE && i.title_he) || i.title; }

  /* ---- stats from data (HTML holds the same numbers as a no-JS fallback) ---- */
  document.querySelectorAll("[data-stat]").forEach(function (el) {
    var v = S[el.getAttribute("data-stat")];
    if (typeof v === "number") el.textContent = v;
  });
  function fmtMonth(ym) { var p = ym.split("-"); return T.monLong[+p[1] - 1] + " " + p[0]; }
  setText("paceLine", T.pace(S.per_month_min, S.per_month_max));
  function setText(id, t) { var e = document.getElementById(id); if (e) e.textContent = t; }

  /* ---- ship log ---- */
  var chart = document.getElementById("logChart"), tip = document.getElementById("logTip");
  var months = [], a = S.first_month.split("-").map(Number), end = S.last_month;
  for (var y = a[0], m = a[1]; ; ) {
    var key = y + "-" + (m < 10 ? "0" : "") + m;
    months.push(key);
    if (key >= end) break;
    m++; if (m > 12) { m = 1; y++; }
  }
  chart.style.setProperty("--cols", months.length);
  var byMonth = {};
  items.forEach(function (i) { (byMonth[i.date.slice(0, 7)] = byMonth[i.date.slice(0, 7)] || []).push(i); });
  var dots = [], lastTap = null;
  months.forEach(function (key) {
    var col = document.createElement("div"); col.className = "log-col";
    var list = (byMonth[key] || []).sort(function (x, y) { return x.side < y.side ? -1 : 1; });
    var stack = document.createElement("div"); stack.className = "log-stack";
    list.forEach(function (i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "dot " + i.side + (i.url ? "" : " nolink");
      b.setAttribute("aria-label", titleOf(i) + ", " + fmtMonth(key));
      b._i = i;
      b.addEventListener("mouseenter", show); b.addEventListener("focus", show);
      b.addEventListener("mouseleave", hide); b.addEventListener("blur", hide);
      b.addEventListener("click", function (e) {
        var touch = matchMedia("(hover: none)").matches;
        // desktop & keyboard: open directly · touch: first tap explains, second tap opens
        if (i.url && (e.detail === 0 || !touch || lastTap === b)) window.open(i.url, "_blank", "noopener");
        else { show.call(b); lastTap = b; }
      });
      stack.appendChild(b); dots.push(b);
    });
    var lab = document.createElement("div"); lab.className = "log-m";
    var p = key.split("-");
    lab.innerHTML = MON[+p[1] - 1] + "<b>" + (key === months[0] ? p[0] : "&nbsp;") + "</b>";
    col.appendChild(stack); col.appendChild(lab); chart.appendChild(col);
  });

  function show() {
    var i = this._i, r = this.getBoundingClientRect();
    var meta = [CAT[i.cat], fmtMonth(i.date.slice(0, 7))];
    tip.dir = RTL ? "rtl" : "ltr";
    tip.innerHTML = '<div class="c"></div><div class="t"></div><div class="m"></div>' +
      (i.url ? '<div class="go">' + T.open + '</div>' : '<div class="m">' + T.conf + '</div>');
    tip.querySelector(".c").textContent = SIDE[i.side];
    tip.querySelector(".t").textContent = titleOf(i);
    tip.querySelector(".m").textContent = meta.join(" · ");
    tip.hidden = false; tip._cur = this;
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var x = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), innerWidth - w - 8);
    var yy = r.top - h - 10; if (yy < 8) yy = r.bottom + 10;
    tip.style.left = x + "px"; tip.style.top = yy + "px";
  }
  function hide() { tip.hidden = true; tip._cur = null; }
  window.addEventListener("scroll", hide, { passive: true });

  /* filters */
  var counts = { all: items.length, ent: 0, su: 0, own: 0 };
  items.forEach(function (i) { counts[i.side]++; });
  document.querySelectorAll("[data-count]").forEach(function (e) { e.textContent = counts[e.getAttribute("data-count")]; });
  document.querySelectorAll(".chip").forEach(function (c) {
    c.addEventListener("click", function () {
      document.querySelectorAll(".chip").forEach(function (o) { o.classList.toggle("on", o === c); o.setAttribute("aria-pressed", o === c); });
      var f = c.getAttribute("data-f");
      dots.forEach(function (d) { d.classList.toggle("dim", f !== "all" && d._i.side !== f); });
    });
  });

  /* animate dots in when the chart scrolls into view */
  function dotsIn() { dots.forEach(function (d, k) { setTimeout(function () { d.classList.add("in"); }, reduce ? 0 : k * 14); }); }
  if (reduce || !("IntersectionObserver" in window)) dotsIn();
  else {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { dotsIn(); io.disconnect(); } }, { threshold: .25 });
    io.observe(chart);
  }

  /* click-to-play video: nothing loads from YouTube until the visitor asks (delegated, so carousel clones work) */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".video-btn");
    if (!btn) return;
    var v = btn.parentNode, f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + v.getAttribute("data-yt") + "?autoplay=1&rel=0";
    f.title = btn.getAttribute("data-title") || btn.getAttribute("aria-label");
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.allowFullscreen = true;
    v.replaceChild(f, btn);
    v.closest(".carousel") && v.closest(".carousel").dispatchEvent(new CustomEvent("carousel:hold", { detail: 1e9 }));
  });

  /* ---- carousels ----
     Motion on: a continuous, seamless drift (like the logo strip) built on a transform,
     with drag/swipe, arrows, keyboard, pause button; pauses on hover, focus, touch,
     off-screen and hidden tab. Motion off (prefers-reduced-motion): a plain swipeable
     scroll-snap row with arrows. */
  var ARROW = '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>';
  var PAUSE_SVG = '<svg viewBox="0 0 24 24"><path d="M9 6v12M15 6v12"/></svg>', PLAY_SVG = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  [".builds", ".cases", ".prods"].map(function (k) { return [k, T.car[k]]; }).forEach(function (cfg) {
    var track = document.querySelector(cfg[0]);
    if (!track) return;
    var slides = Array.prototype.slice.call(track.children);
    var wrap = document.createElement("div");
    wrap.className = "carousel" + (reduce ? "" : " drift");
    wrap.setAttribute("role", "region");
    wrap.setAttribute("aria-roledescription", "carousel");
    wrap.setAttribute("aria-label", cfg[1]);
    track.parentNode.insertBefore(wrap, track);
    var vp = document.createElement("div"); vp.className = "car-vp";
    wrap.appendChild(vp); vp.appendChild(track);
    track.classList.add("track");
    track.tabIndex = 0;

    var ctl = document.createElement("div"); ctl.className = "car-ctl";
    var hint = document.createElement("span"); hint.className = "car-hint"; hint.textContent = T.hint;
    var pause = document.createElement("button"), prev = document.createElement("button"), next = document.createElement("button");
    [pause, prev, next].forEach(function (b) { b.type = "button"; b.className = "car-btn"; });
    pause.classList.add("car-pause");
    prev.innerHTML = ARROW; next.innerHTML = ARROW; (RTL ? prev : next).querySelector("svg").style.transform = "scaleX(-1)";
    prev.setAttribute("aria-label", T.prev); next.setAttribute("aria-label", T.next);
    var SG = RTL ? -1 : 1;   // RTL: cards run right→left, so "forward" is a rightward translate
    ctl.appendChild(hint); ctl.appendChild(pause); ctl.appendChild(prev); ctl.appendChild(next);
    wrap.appendChild(ctl);
    function step() { return slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 18); }

    if (reduce) {                                   // ---- static, swipeable fallback
      pause.hidden = true;
      prev.addEventListener("click", function () { track.scrollBy({ left: -SG * step() }); });
      next.addEventListener("click", function () { track.scrollBy({ left: SG * step() }); });
      return;
    }

    // ---- continuous drift
    slides.forEach(function (sl) {
      var c = sl.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      c.querySelectorAll("a,button").forEach(function (el) { el.tabIndex = -1; });
      track.appendChild(c);
    });
    track.querySelectorAll("img").forEach(function (im) { im.draggable = false; });

    var x = 0, setW = 1, last = 0, SPEED = innerWidth < 700 ? 26 : 34;   // px per second
    var userPaused = false, hovering = false, focused = false, visible = false, heldUntil = 0, glide = null;
    function measure() { setW = Math.abs(track.children[slides.length].offsetLeft - track.children[0].offsetLeft) || 1; }
    function wrapX() { x = ((x % setW) + setW) % setW; }
    function paint() { track.style.transform = "translate3d(" + (-SG * x).toFixed(2) + "px,0,0)"; }
    function hold(ms) { heldUntil = performance.now() + (ms || 3500); }
    function paintPause() {
      pause.innerHTML = userPaused ? PLAY_SVG : PAUSE_SVG;
      pause.setAttribute("aria-label", userPaused ? T.resume : T.pause);
      wrap.classList.toggle("paused", userPaused);
    }
    function nudge(dir) {                           // arrows: glide one card, then keep drifting
      hold(4000);
      glide = { from: x, to: x + dir * step(), t0: performance.now(), dur: 650 };
    }
    pause.addEventListener("click", function () { userPaused = !userPaused; paintPause(); });
    prev.addEventListener("click", function () { nudge(-1); });
    next.addEventListener("click", function () { nudge(1); });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); nudge(SG); }
      if (e.key === "ArrowLeft") { e.preventDefault(); nudge(-SG); }
    });
    wrap.addEventListener("carousel:hold", function (e) { hold(e.detail); });
    wrap.addEventListener("mouseenter", function () { hovering = true; });
    wrap.addEventListener("mouseleave", function () { hovering = false; hold(800); });
    wrap.addEventListener("focusin", function (e) { focused = e.target !== pause; });
    wrap.addEventListener("focusout", function () { focused = false; });

    // drag / swipe (vertical page scroll stays native via touch-action: pan-y)
    var drag = null, moved = false;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag = { sx: e.clientX, sy: e.clientY, x0: x, id: e.pointerId, on: false, vx: 0, lx: e.clientX, lt: performance.now() };
      moved = false; glide = null;
    });
    track.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (!drag.on) {
        if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) return;
        drag.on = moved = true; track.setPointerCapture(e.pointerId); wrap.classList.add("dragging");
      }
      var now = performance.now();
      drag.vx = (e.clientX - drag.lx) / Math.max(1, now - drag.lt); drag.lx = e.clientX; drag.lt = now;
      x = drag.x0 - SG * dx; wrapX(); paint(); hold(3000);
    });
    function endDrag() {
      if (!drag) return;
      if (drag.on) {                                // a little momentum, then resume drifting
        var v = -SG * drag.vx * 260;
        glide = { from: x, to: x + v, t0: performance.now(), dur: 500 };
        hold(3000);
      }
      drag = null; wrap.classList.remove("dragging");
    }
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);

    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: .15 }).observe(wrap);
    else visible = true;
    window.addEventListener("resize", function () { measure(); wrapX(); paint(); });
    measure(); paintPause();

    function frame(t) {
      var dt = last ? Math.min(64, t - last) / 1000 : 0; last = t;
      if (glide) {
        var p = Math.min(1, (t - glide.t0) / glide.dur), ease = 1 - Math.pow(1 - p, 3);
        x = glide.from + (glide.to - glide.from) * ease;
        if (p >= 1) glide = null;
        wrapX(); paint();
      } else if (!drag && !userPaused && !hovering && !focused && visible && !document.hidden && t > heldUntil) {
        x += SPEED * dt; wrapX(); paint();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });

  /* ---- logo marquee: duplicate the row for a seamless loop ---- */
  (function () {
    var m = document.querySelector(".marquee"), t = m && m.querySelector(".marquee-track");
    if (!t || reduce) return;
    Array.prototype.slice.call(t.children).forEach(function (li) {
      var c = li.cloneNode(true); c.setAttribute("aria-hidden", "true");
      c.querySelector("img").alt = ""; t.appendChild(c);
    });
    m.style.setProperty("--dur", (t.children.length * 2.6) + "s");
    m.classList.add("run");
  })();

  /* ---- typed headline ---- */
  (function () {
    var g = document.querySelector(".hero h1 .grad");
    if (!g || reduce) return;
    var text = g.textContent, h1 = g.closest("h1");
    h1.setAttribute("aria-label", h1.textContent.replace(/\s+/g, " ").trim());
    g.classList.add("typed-wrap");
    g.innerHTML = '<span class="typed" aria-hidden="true"></span><span class="caret typing" aria-hidden="true"></span><span class="rest" aria-hidden="true"></span>';
    var typed = g.querySelector(".typed"), rest = g.querySelector(".rest"), caret = g.querySelector(".caret");
    rest.textContent = text;
    var n = 0;
    setTimeout(function step() {
      n++;
      typed.textContent = text.slice(0, n); rest.textContent = text.slice(n);
      if (n < text.length) setTimeout(step, text[n - 1] === " " ? 90 : 42 + Math.random() * 40);
      else caret.classList.remove("typing");
    }, 450);
  })();

  /* ---- count-up numbers ---- */
  function countUp(el) {
    var raw = el.textContent, m = raw.match(/^([^\d]*)(\d+(?:\.\d+)?)([\s\S]*)$/);
    if (!m || +m[2] === 0) return;
    var to = +m[2], dec = (m[2].split(".")[1] || "").length, t0 = null, dur = 1400;
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = m[1] + (to * e).toFixed(dec) + m[3];
      if (p < 1) requestAnimationFrame(frame); else el.textContent = raw;
    }
    el.textContent = m[1] + (0).toFixed(dec) + m[3];
    requestAnimationFrame(frame);
  }
  if (!reduce && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); } });
    }, { threshold: .6 });
    document.querySelectorAll(".stats .num, .facts b, .creds b").forEach(function (el) { co.observe(el); });
  }

  /* ---- reveal on scroll, staggered within each group ---- */
  if (!reduce && "IntersectionObserver" in window) {
    var groups = [
      [".sec > .eyebrow, .sec > h2, .sec > .sub", "reveal"],
      [".stats > div", "reveal"],
      [".promises > div", "reveal"],
      [".carousel", "reveal"],
      [".role", "reveal"], [".steps li", "reveal"], [".callout", "reveal"],
      [".voice", "reveal"], [".career li", "reveal"], [".about-l, .cta-box", "reveal"]
    ];
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
    groups.forEach(function (g) {
      var list = document.querySelectorAll(g[0]), parent = null, k = 0;
      list.forEach(function (el) {
        if (el.parentNode !== parent) { parent = el.parentNode; k = 0; }
        el.style.setProperty("--d", Math.min(k++ * 0.07, 0.5) + "s");
        el.classList.add(g[1]); ro.observe(el);
      });
    });
  }
})();
