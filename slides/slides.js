/* =========================================================================
   Evals for AI Agents — workshop slide deck
   Vanilla JS. No dependencies.

   Two views share this script:
     1. Audience view (index.html, default)
        — keyboard nav, broadcasts navigation, listens for presenter
     2. Iframe inside presenter.html, loaded with ?passive=1
        — no keyboard, no broadcasting; controlled by parent via window.deckGo

   Sync: BroadcastChannel('deck-sync')
     {type: 'goto',          slide: N}    — navigate to slide N (1-indexed)
     {type: 'request-state'}              — ask any window for current slide
     {type: 'state',         slide: N}    — response to request-state
   ========================================================================= */

(function () {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const counter = document.getElementById("counter");
  const helpOverlay = document.getElementById("help-overlay");

  const params = new URLSearchParams(location.search);
  const passive = params.has("passive");
  if (passive) document.body.classList.add("passive");

  let current = 0;
  let buffered = "";
  let presenterWindow = null;

  // Sync channel — only when not passive (iframes inside presenter don't broadcast)
  const myId = Math.random().toString(36).slice(2);
  let channel = null;
  if (!passive && "BroadcastChannel" in window) {
    channel = new BroadcastChannel("deck-sync");
    channel.onmessage = (e) => {
      if (!e.data || e.data.from === myId) return;
      if (e.data.type === "goto") {
        applyGoto(e.data.slide - 1);
      } else if (e.data.type === "request-state") {
        channel.postMessage({ from: myId, type: "state", slide: current + 1 });
      }
      // ping is just a heartbeat — receiving it means a peer is alive
    };
    // Heartbeat so the presenter window's link indicator can see us
    setInterval(() => channel.postMessage({ from: myId, type: "ping" }), 2000);
  }

  function clamp(n) {
    return Math.max(0, Math.min(slides.length - 1, n));
  }

  function render() {
    slides.forEach((s, i) => s.classList.toggle("active", i === current));
    if (counter) counter.textContent = `${current + 1} / ${slides.length}`;
    updateReel();
    if (!passive) window.location.hash = `#${current + 1}`;
  }

  // ===== Focus Reel — vertical camera-zoom progress rail =====
  // Build from chapter slides: title, intro, dividers, thank-you.
  // Each becomes a clickable stop. State updates on every render().

  let reelStops = [];

  function buildReel() {
    const stopsEl = document.getElementById("reel-stops");
    if (!stopsEl) return;

    reelStops = [];
    slides.forEach((slide, idx) => {
      let label = null;
      if (idx === 0) {
        label = "Open";
      } else if (slide.dataset.section === "Intro") {
        label = "Intro";
      } else if (slide.classList.contains("divider")) {
        const h2 = slide.querySelector("h2");
        label = h2 ? h2.textContent.trim() : "Section";
      } else if (idx === slides.length - 1) {
        label = "Close";
      } else if (slide.dataset.reelStop) {
        label = slide.dataset.reelStop;
      }
      if (label !== null) reelStops.push({ idx, label });
    });

    stopsEl.innerHTML = reelStops
      .map(
        (s) =>
          `<li><button class="reel-stop" data-target="${s.idx + 1}" aria-label="${s.label}, slide ${s.idx + 1}">
             <span class="reel-tick" aria-hidden="true"></span>
             <span class="reel-label">${s.label}</span>
           </button></li>`
      )
      .join("");

    stopsEl.querySelectorAll(".reel-stop").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = parseInt(btn.dataset.target, 10);
        if (!isNaN(target)) go(target - 1);
      });
    });
  }

  function updateReel() {
    if (passive) return;
    const stopEls = document.querySelectorAll(".reel-stop");
    if (stopEls.length === 0) return;

    // Find the last stop whose slide index is ≤ current — that's the active one.
    let activeIdx = 0;
    for (let i = 0; i < reelStops.length; i++) {
      if (reelStops[i].idx <= current) activeIdx = i;
    }

    stopEls.forEach((el, i) => {
      el.classList.toggle("passed", i < activeIdx);
      el.classList.toggle("current", i === activeIdx);
    });

    // Drive the white "fill" rail from rail-top → center of current stop.
    // Measure directly from the DOM so the formula never drifts from actual layout.
    const fillEl = document.getElementById("reel-fill");
    const stopsEl = document.getElementById("reel-stops");
    if (fillEl && stopsEl) {
      const activeLi = stopsEl.children[activeIdx];
      if (activeLi) {
        // offsetTop is relative to .reel-track (the nearest position:relative ancestor).
        // Center of active stop = offsetTop + half its height.
        // Rail/fill starts at that same coordinate for stop 0 (top: set in CSS).
        // Fill height = center_of_active - center_of_first_stop.
        const firstLi = stopsEl.children[0];
        const firstCenter = firstLi ? firstLi.offsetTop + firstLi.offsetHeight / 2 : 28;
        const activeCenter = activeLi.offsetTop + activeLi.offsetHeight / 2;
        fillEl.style.height = Math.max(0, activeCenter - firstCenter) + "px";
      }
    }
  }

  // Internal goto — does NOT broadcast (used when receiving updates)
  function applyGoto(n) {
    current = clamp(n);
    render();
  }

  // Public goto — used by keyboard or external callers; DOES broadcast
  function go(n) {
    current = clamp(n);
    render();
    if (channel) {
      channel.postMessage({ from: myId, type: "goto", slide: current + 1 });
    }
  }

  // Expose for cross-frame control (presenter.html drives iframes via this)
  window.deckGo = (oneIndexed) => applyGoto(oneIndexed - 1);
  window.deckTotal = () => slides.length;
  window.deckCurrent = () => current + 1;

  function next() { go(current + 1); }
  function prev() { go(current - 1); }

  function toggleHelp() {
    if (helpOverlay) helpOverlay.classList.toggle("visible");
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  function openPresenter() {
    // If an old presenter window is still open, just focus it
    if (presenterWindow && !presenterWindow.closed) {
      presenterWindow.focus();
      return;
    }
    const url = `presenter.html#${current + 1}`;
    presenterWindow = window.open(
      url,
      "deck-presenter",
      "width=1200,height=780,resizable=yes,scrollbars=no"
    );
    if (!presenterWindow) {
      alert(
        "Couldn't open presenter window — your browser blocked the popup.\n\n" +
        "Allow popups for this page, then press P again."
      );
    }
  }

  // ===== Keyboard (skipped entirely in passive mode) =====
  if (!passive) {
    document.addEventListener("keydown", (e) => {
      // Allow typing inside inputs/textareas to pass through
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      // Numeric jump: digits buffer, Enter commits
      if (/^[0-9]$/.test(e.key)) { buffered += e.key; return; }
      if (e.key === "Enter") {
        if (buffered) { go(parseInt(buffered, 10) - 1); buffered = ""; }
        return;
      }
      buffered = "";

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
        case " ":
          e.preventDefault(); next(); break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          e.preventDefault(); prev(); break;
        case "Home":
          e.preventDefault(); go(0); break;
        case "End":
          e.preventDefault(); go(slides.length - 1); break;
        case "f":
        case "F":
          e.preventDefault(); toggleFullscreen(); break;
        case "p":
        case "P":
        case "n":          // muscle-memory alias from old "N for notes"
        case "N":
          e.preventDefault(); openPresenter(); break;
        case "?":
        case "/":
          e.preventDefault(); toggleHelp(); break;
        case "Escape":
          if (helpOverlay) helpOverlay.classList.remove("visible");
          break;
      }
    });

    // Touch swipe
    let touchStartX = null;
    document.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    document.addEventListener("touchend", (e) => {
      if (touchStartX == null) return;
      const dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) > 50) (dx < 0 ? next() : prev());
      touchStartX = null;
    });
  }

  // ===== Initial state from URL hash =====
  function initFromHash() {
    const m = window.location.hash.match(/#(\d+)/);
    if (m) current = clamp(parseInt(m[1], 10) - 1);
    render();
  }
  if (!passive) window.addEventListener("hashchange", initFromHash);

  // Build the reel before the first render so updateReel() can populate state.
  if (!passive) buildReel();
  initFromHash();
})();
