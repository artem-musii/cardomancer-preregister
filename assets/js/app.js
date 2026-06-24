/* ============================================================
   Cardomancer — landing page behaviour (vanilla, no deps)
   1. Chroma-key: composite the black-background hero videos
      onto transparent canvases with anti-aliased edges.
   2. Hero modal: open a cardomancer's bio + looping portrait.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 1. Chroma-key compositing ---------- */
  function initChroma(canvas) {
    if (canvas.__chromaInit) return;
    var video = canvas.previousElementSibling;
    if (!video || video.tagName !== "VIDEO") return;

    canvas.__chromaInit = true;
    var ctx = canvas.getContext("2d", { willReadFrequently: true });
    var w = canvas.width;
    var h = canvas.height;

    video.muted = true;
    video.loop = true;
    video.addEventListener("ended", function () {
      try { video.currentTime = 0; } catch (e) {}
      video.play().catch(function () {});
    });
    video.addEventListener("pause", function () {
      if (!video.ended && !document.hidden) video.play().catch(function () {});
    });

    function draw() {
      if (video.readyState >= 2 && video.videoWidth) {
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(video, 0, 0, w, h);
        try {
          var id = ctx.getImageData(0, 0, w, h);
          var d = id.data;
          var n = w * h;
          var mask = new Uint8Array(n);
          for (var p = 0; p < n; p++) {
            var i = p * 4;
            var m = Math.max(d[i], d[i + 1], d[i + 2]);
            mask[p] = m < 22 ? 0 : 1; // near-black → transparent
          }
          for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
              var pp = y * w + x;
              var ii = pp * 4;
              if (!mask[pp]) { d[ii + 3] = 0; continue; }
              var mm = Math.max(d[ii], d[ii + 1], d[ii + 2]);
              if (mm < 95) { // soften the edge against transparency
                var edge =
                  (x > 0 && !mask[pp - 1]) ||
                  (x < w - 1 && !mask[pp + 1]) ||
                  (y > 0 && !mask[pp - w]) ||
                  (y < h - 1 && !mask[pp + w]);
                if (edge) d[ii + 3] = Math.round(Math.min(1, mm / 95) * 255);
              }
            }
          }
          ctx.putImageData(id, 0, 0);
        } catch (e) {}
      }
      canvas.__raf = requestAnimationFrame(draw);
    }
    draw();
  }

  function setupChroma() {
    document.querySelectorAll("canvas[data-chroma]").forEach(function (cv) {
      initChroma(cv);
      var v = cv.previousElementSibling;
      if (v && v.tagName === "VIDEO") {
        var pr = v.play();
        if (pr && pr.catch) pr.catch(function () {});
      }
    });
  }

  /* ---------- 2. Hero modal ---------- */
  var HEROES = {
    lira:  { name: "LIRA",  suit: "HEARTS · HEAL",    video: "./assets/lira-battle.webm",  accent: "#E85A7A", bio: "Heir to a dynasty of healers whose cards pull the dying back from the edge of fate. She walks the halls of Elythar — and the story — at your side." },
    kai:   { name: "KAI",   suit: "DIAMONDS · GUARD", video: "./assets/kai-battle.webm",   accent: "#E8C36B", bio: "The \"not-chosen.\" Kai awoke his gift in one desperate act — rewriting his own doomed fate. His past is a flashback you will play." },
    taren: { name: "TAREN", suit: "SPADES · HIDE",    video: "./assets/taren-battle.webm", accent: "#b39bff", bio: "The one the cards cannot show. A reclusive guardian to his sister — until her abduction drags him into a war over fate itself." }
  };

  var modal = document.getElementById("heroModal");
  var elVideo = document.getElementById("heroModalVideo");
  var elCanvas = document.getElementById("heroModalCanvas");
  var elName = document.getElementById("heroModalName");
  var elSuit = document.getElementById("heroModalSuit");
  var elBio = document.getElementById("heroModalBio");

  function openHero(key) {
    var hero = HEROES[key];
    if (!hero || !modal) return;
    elName.textContent = hero.name;
    elSuit.textContent = hero.suit;
    elSuit.style.color = hero.accent;
    elBio.textContent = hero.bio;
    elVideo.src = hero.video;
    modal.hidden = false;
    elVideo.play().catch(function () {});
    initChroma(elCanvas);
  }

  function closeHero() {
    if (!modal) return;
    modal.hidden = true;
    try { elVideo.pause(); } catch (e) {}
  }

  document.querySelectorAll(".hero-card[data-hero]").forEach(function (card) {
    card.addEventListener("click", function () { openHero(card.getAttribute("data-hero")); });
  });

  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal || e.target.hasAttribute("data-close")) closeHero();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeHero();
    });
  }

  /* ---------- boot ---------- */
  setupChroma();
  // keep videos playing after tab switches / autoplay hiccups
  setInterval(setupChroma, 1500);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) setupChroma();
  });
})();
