// CHIMERA landing page: the gallery's lightbox and the little Altar. No libraries, no tracking.
// Without JavaScript the gallery links open the full pictures and the Altar shows WATER IS ICE.

(() => {
  "use strict";

  // ---------- Lightbox ----------
  const dialog = document.getElementById("lightbox");
  const links = Array.from(document.querySelectorAll("[data-lightbox]"));
  if (dialog && links.length && typeof dialog.showModal === "function") {
    const img = dialog.querySelector(".lb-stage img");
    const cap = dialog.querySelector(".lb-cap");
    const count = dialog.querySelector(".lb-count");
    let index = 0;
    let opener = null;

    const show = (i) => {
      index = (i + links.length) % links.length;
      const a = links[index];
      const thumb = a.querySelector("img");
      img.src = a.getAttribute("href");
      img.alt = thumb ? thumb.alt : "";
      cap.textContent = a.dataset.caption || (thumb ? thumb.alt : "");
      count.textContent = `${index + 1} / ${links.length}`;
      // Fetch the neighbours so stepping through is instant.
      [index + 1, index - 1].forEach((n) => {
        const next = links[(n + links.length) % links.length];
        const pre = new Image();
        pre.src = next.getAttribute("href");
      });
    };

    links.forEach((a, i) => {
      a.addEventListener("click", (e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        opener = a;
        show(i);
        dialog.showModal();
        dialog.querySelector(".lb-close").focus();
      });
    });

    dialog.querySelector(".lb-prev").addEventListener("click", () => show(index - 1));
    dialog.querySelector(".lb-next").addEventListener("click", () => show(index + 1));
    dialog.querySelector(".lb-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); show(index + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); show(index - 1); }
    });
    // A click on the dark around the picture closes it.
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog || e.target.classList.contains("lb-stage")) dialog.close();
    });
    // Swipe on phones.
    let x0 = null;
    dialog.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    dialog.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    dialog.addEventListener("close", () => {
      img.removeAttribute("src");
      if (opener) opener.focus();
    });
  }

  // ---------- The Altar: push a word, read the law ----------
  // What each word means is the game's own text (data/words.json).
  const NOUNS = {
    WATER: "Water: a cell's state.",
    ENEMY: "Everything that is the Corruption's.",
    WAVE: "The Corruption's units that came with a wave.",
    BOSS: "The massive ones: bosses, capital units.",
    PLAYER: "Everything that is yours: units and structures.",
    TURRET: "Defences: structures that fire.",
    GATE: "Gates between the map's sections.",
  };
  const OBJECTS = {
    ICE: { g: "noun", text: "Ice: water ground units walk on." },
    WEAK: { g: "death", text: "Breaks at the first hit or a hard knock." },
    SLEEP: { g: "space", text: "Does nothing: no moving, firing or making." },
    SAFE: { g: "you", text: "Can't be destroyed: damage stops at 1 health." },
    FAST: { g: "tempo", text: "Its clock runs half as fast again." },
    STOP: { g: "body", text: "Nothing gets into it or past it." },
    YOU: { g: "you", text: "Your life and your control: you command it." },
  };
  // A few sentences worth a line of their own.
  const SAYS = {
    "WATER IS ICE": "The lake freezes over and your army walks straight across it.",
    "ENEMY IS WEAK": "Every enemy in reach breaks at the first hit.",
    "ENEMY IS SAFE": "The Corruption's favourite: nothing of theirs can be destroyed. Break the sentence first.",
    "WAVE IS SLEEP": "The attack halts where it stands, its guns quiet.",
    "WAVE IS WEAK": "The incoming attack breaks at the first hit.",
    "ENEMY IS SLEEP": "Every enemy in reach stops dead: no moving, no firing, no making.",
    "ENEMY IS FAST": "A gift to the other side: their clock runs half as fast again.",
    "PLAYER IS FAST": "Your units and structures run half as fast again, for as long as the sentence holds.",
    "TURRET IS SAFE": "Defences in reach can't be destroyed. Whose defences? Everyone's.",
    "BOSS IS SLEEP": "Even the biggest ones stand still.",
    "PLAYER IS YOU": "The law that lets you play at all. With nothing that is YOU for 30 seconds, the mission is lost.",
    "PLAYER IS WEAK": "Rules take no sides. This is one the Corruption would love to write.",
    "PLAYER IS SAFE": "Nothing of yours can be destroyed, for as long as the sentence holds. Guard the Altar.",
    "GATE IS STOP": "One of the world's laws: gates hold. Break it and the way is open.",
    "TURRET IS FAST": "Every defence in reach, theirs as well as yours, runs half as fast again.",
    "WATER IS STOP": "The water becomes a wall nothing can cross.",
  };

  const altar = document.getElementById("altar");
  if (altar) {
    const subj = altar.querySelector('[data-slot="subject"]');
    const obj = altar.querySelector('[data-slot="object"]');
    const out = altar.querySelector(".altar-out");
    const nouns = Object.keys(NOUNS);
    const objects = Object.keys(OBJECTS);
    let s = nouns.indexOf("WATER");
    let o = objects.indexOf("ICE");

    const render = () => {
      const S = nouns[s];
      const O = objects[o];
      subj.textContent = S;
      obj.textContent = O;
      obj.dataset.g = OBJECTS[O].g;
      subj.setAttribute("aria-label", `First word: ${S}. Press to push the next word in.`);
      obj.setAttribute("aria-label", `Last word: ${O}. Press to push the next word in.`);
      const sentence = `${S} IS ${O}`;
      const line = SAYS[sentence] || `${S}: ${NOUNS[S]} ${O}: ${OBJECTS[O].text}`;
      out.innerHTML = "";
      const b = document.createElement("b");
      b.textContent = sentence;
      out.append(b, document.createElement("br"), document.createTextNode(line));
    };

    subj.addEventListener("click", () => { s = (s + 1) % nouns.length; render(); });
    obj.addEventListener("click", () => { o = (o + 1) % objects.length; render(); });
    render();
  }
})();
