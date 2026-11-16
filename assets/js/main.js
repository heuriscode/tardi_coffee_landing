// =============== Edit these ===============
const CONTACT_EMAIL = "hello@tardicoffee.com.au";
// Paste your form endpoint here (e.g. "https://formspree.io/f/abcdwxyz").
// Leave empty and the enquiry form falls back to opening the visitor's email app.
const FORM_ENDPOINT = "";
// Only for Web3Forms: paste your access key here (Formspree doesn't need one).
const FORM_ACCESS_KEY = "";

const FLAVOURS = [
  { id: "classic",     name: "Classic",     price: 15, tint: "var(--cream)", note: "The straight shot. Chocolatey, juicy Ugandan espresso — just add milk." },
  { id: "vanilla",     name: "Vanilla",     price: 16, tint: "var(--pink)",  note: "Espresso with vanilla. Your iced vanilla latte, minus the queue." },
  { id: "chai-aramel", name: "Chai-aramel", price: 16, tint: "var(--sage)",  note: "Chai spice meets caramel. Warm, sweet, a little bit cheeky." },
  { id: "tira-miss-u", name: "Tira-miss-u", price: 18, tint: "var(--ice)",   note: "Cocoa, cream and coffee — tiramisu in a cup. Hard not to miss." },
  { id: "coldbrew",    name: "Cold brew",   price: 12, tint: "var(--lilac)", note: "Slow-steeped cold brew concentrate — 10 serves. Half fill your cup, top with water or milk." }
];
const SHOTS = 10;
// ===========================================

const $ = (s, el = document) => el.querySelector(s);
const money = n => "$" + (Number.isInteger(n) ? n : n.toFixed(2));
document.getElementById("yr").textContent = new Date().getFullYear();
document.querySelectorAll(".js-email").forEach(a => { a.href = "mailto:" + CONTACT_EMAIL; a.textContent = CONTACT_EMAIL; });

// ---- star field (deterministic, CSS-animated) ----
(function stars() {
  const box = $(".sky .stars"); if (!box) return;
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const n = Math.min(220, Math.round(innerWidth * innerHeight / 6000));
  const frag = document.createDocumentFragment();
  for (let i = 0; i < n; i++) {
    const s = document.createElement("i"); s.className = "star";
    s.style.cssText = `left:${rnd() * 100}%;top:${rnd() * 100}%;--s:${(rnd() * 2.2 + .8).toFixed(1)}px;--d:${[2, 3, 6][i % 3]}s;--o:-${(rnd() * 6).toFixed(2)}s;opacity:${(.4 + rnd() * .6).toFixed(2)}`;
    frag.appendChild(s);
  }
  box.appendChild(frag);
})();

// ---- mobile menu ----
const menuBtn = $(".menu-btn"), menu = $("#menu");
menuBtn.addEventListener("click", () => menuBtn.setAttribute("aria-expanded", menu.classList.toggle("open")));
menu.addEventListener("click", e => { if (e.target.tagName === "A") { menu.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false); } });

// ---- flavour picker: label slides off, new one slides in ----
const stage = $(".label-stage"), list = $(".flavours"), note = $(".flavour-note");
let idx = 0, busy = false;
FLAVOURS.forEach((f, i) => {
  const b = document.createElement("button");
  b.setAttribute("role", "radio"); b.style.setProperty("--sw", f.tint);
  b.innerHTML = `${f.name}<em>${f.price ? money(f.price) : '<span class="tbc">$[TBC]</span>'}<small>${f.price ? money(f.price / SHOTS) + " / shot" : SHOTS + " serves"}</small></em>`;
  b.addEventListener("click", () => show(i));
  list.appendChild(b);
});
function paint() {
  const f = FLAVOURS[idx];
  [...list.children].forEach((b, i) => b.setAttribute("aria-checked", i === idx));
  note.textContent = f.note;
  $(".js-price").innerHTML = f.price ? money(f.price) : '<span class="tbc">$[TBC]</span>';
  $(".js-per").textContent = f.price ? money(f.price / SHOTS) + " a shot" : "price coming soon";
}
function show(i, dir) {
  i = (i + FLAVOURS.length) % FLAVOURS.length;
  if (i === idx || busy) return;
  dir = dir || (i > idx ? 1 : -1);
  busy = true; idx = i; paint();
  const old = $("img.current", stage), f = FLAVOURS[i];
  const img = new Image();
  img.src = `assets/img/label-${f.id}.webp`; img.alt = `Tardi ${f.name} label`;
  img.className = dir > 0 ? "in" : "in-left";
  stage.appendChild(img);
  const go = () => requestAnimationFrame(() => requestAnimationFrame(() => {
    old.className = dir > 0 ? "out-left" : "out-right";
    img.className = "current";
    setTimeout(() => { old.remove(); busy = false; }, 560);
  }));
  img.decode ? img.decode().then(go, go) : img.onload = go;
}
$(".label-nav .next").addEventListener("click", () => show(idx + 1, 1));
$(".label-nav .prev").addEventListener("click", () => show(idx - 1, -1));
let x0 = null;
stage.addEventListener("pointerdown", e => x0 = e.clientX);
stage.addEventListener("pointerup", e => { if (x0 !== null && Math.abs(e.clientX - x0) > 40) show(idx + (e.clientX < x0 ? 1 : -1), e.clientX < x0 ? 1 : -1); x0 = null; });
stage.addEventListener("click", () => show(idx + 1, 1));
paint();
FLAVOURS.forEach(f => { const p = new Image(); p.src = `assets/img/label-${f.id}.webp`; }); // preload

// ---- enquiry forms (events + wholesale) ----
document.querySelectorAll("form.enquiry").forEach(form => {
  const est = form.querySelector(".estimate"), status = form.querySelector(".form-status"), kind = form.dataset.kind;
  const f = n => form.elements[n];
  const opts = () => [...form.querySelectorAll("input[name=opt]:checked")].map(i => i.value);
  const summary = () => {
    const o = opts();
    if (!o.length) { est.textContent = "Pick at least one option."; return; }
    est.textContent = kind === "Event" ? `${+f("guests").value || "?"} guests · ${o.join(" + ")}` : `${f("venue_type").value} · ${o.join(" + ")}`;
  };
  form.addEventListener("input", summary); summary();
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!opts().length) return;
    if (!f("name").value.trim() || !f("email").value || !f("email").checkValidity()) {
      status.textContent = "Please add your name and a valid email so we can reply."; return;
    }
    const subject = `${kind} enquiry — ${f("org").value || f("name").value}`;
    const data = { enquiry: kind };
    for (const el of form.elements) if (el.name && el.name !== "opt" && el.value) data[el.name] = el.value;
    data.interested_in = opts().join(", ");
    data._subject = subject;
    if (FORM_ACCESS_KEY) Object.assign(data, { access_key: FORM_ACCESS_KEY, subject, replyto: f("email").value });
    if (FORM_ENDPOINT) {
      status.textContent = "Sending…";
      try {
        const r = await fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
        if (!r.ok) throw new Error(r.status);
        form.reset(); summary();
        status.textContent = "Thanks — we've got it and will be in touch shortly.";
      } catch (err) {
        status.textContent = `Couldn't send just now — please email ${CONTACT_EMAIL}.`;
      }
      return;
    }
    const body = Object.entries(data).filter(([k]) => k[0] !== "_" && !["access_key", "subject", "replyto"].includes(k)).map(([k, v]) => `${k}: ${v}`).join("\n");
    location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = `Opening your email app… if nothing happens, email ${CONTACT_EMAIL}.`;
  });
});

// ---- open a collapsed section when something links into it ----
function openFor(hash) {
  if (!hash || hash.length < 2) return;
  const el = document.getElementById(decodeURIComponent(hash.slice(1)));
  const d = el && (el.matches("details.fold") ? el : el.querySelector("details.fold") || el.closest("details.fold"));
  if (d && !d.open) d.open = true;
}
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]');
  if (a) openFor(a.getAttribute("href"));
});
addEventListener("hashchange", () => openFor(location.hash));
openFor(location.hash);
