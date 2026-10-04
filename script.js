const root = document.documentElement;
const tombolTema = document.getElementById("tema");

// 0. Loader, animasi masuk hero, dan elemen muncul saat scroll
const kurangi = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// foto: pudar masuk setelah selesai dimuat
function pudar(im) {
  if (im.complete) return;
  im.classList.add("memuat");
  const ok = () => im.classList.remove("memuat");
  im.addEventListener("load", ok, { once: true });
  im.addEventListener("error", ok, { once: true });
}
document.querySelectorAll("img").forEach(pudar);

// elemen yang muncul bergantian saat di-scroll (disiapkan sekarang, diamati setelah loader)
const sasaran = [...document.querySelectorAll(
  "main > .stats, section h2, section .intro, .ringkas, .filter, #tentang p, .proyek, .penutup-project, " +
  ".baris, .belajar, .cerita, #semua, .kembali, .edu li, .kontak-baris, .penutup p"
)];
const perInduk = new Map();
const bisaReveal = "IntersectionObserver" in window && !kurangi;
if (bisaReveal) {
  sasaran.forEach(el => {
    const n = perInduk.get(el.parentElement) || 0;
    perInduk.set(el.parentElement, n + 1);
    el.style.setProperty("--d", Math.min(n, 3) * 0.08 + "s");
    el.classList.add("reveal");
  });
}
function aktifkanReveal() {
  if (!bisaReveal) return;
  const pengamat = new IntersectionObserver(hasil => {
    hasil.forEach(item => {
      if (!item.isIntersecting) return;
      const el = item.target;
      el.classList.add("show");
      pengamat.unobserve(el);
      // setelah selesai, lepas kelasnya agar efek hover bawaan kartu normal lagi
      setTimeout(() => { el.classList.remove("reveal", "show"); el.style.removeProperty("--d"); }, 1200);
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
  sasaran.forEach(el => pengamat.observe(el));
}

function mulai() {
  root.classList.remove("muat");
  root.classList.add("siap");
  try { sessionStorage.setItem("loader", "1"); } catch (e) {}
  aktifkanReveal();
}
const loader = document.getElementById("loader");
if (root.classList.contains("muat") && loader) {
  const awal = performance.now();
  const MIN = kurangi ? 0 : 600;   // tampil minimal, supaya tidak berkedip
  const MAX = 3000;                // paling lama, kalau sinyal lambat
  let beres = false;
  const tutupLoader = () => {
    if (beres) return;
    beres = true;
    loader.classList.add("selesai");
    setTimeout(mulai, kurangi ? 0 : 320);
  };
  const halamanSiap = () => setTimeout(tutupLoader, Math.max(MIN - (performance.now() - awal), 0));
  if (document.readyState === "complete") halamanSiap();
  else window.addEventListener("load", halamanSiap);
  setTimeout(tutupLoader, MAX);
} else {
  mulai();
}

// 1. Ganti tema (pilihan diingat di browser)
function aturTema(gelap) {
  root.dataset.theme = gelap ? "dark" : "light";
  tombolTema.textContent = gelap ? "☀️" : "🌙";
}
let gelap = true; // dark jadi default
try { gelap = localStorage.getItem("tema") !== "terang"; } catch (e) {}
aturTema(gelap);

tombolTema.addEventListener("click", () => {
  const baru = root.dataset.theme !== "dark";
  aturTema(baru);
  try { localStorage.setItem("tema", baru ? "gelap" : "terang"); } catch (e) {}
});

// 2. Menu hamburger (HP)
const menu = document.getElementById("menu");
document.getElementById("burger").addEventListener("click", () => {
  menu.classList.toggle("buka");
});
menu.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => menu.classList.remove("buka"));
});

// 3. Journey: filter, nomor cerita, dan tombol "Perjalanan lainnya"
const tombolFilter = document.querySelectorAll("#filter button");
const cerita = [...document.querySelectorAll(".cerita")];
const kartuBiasa = [...document.querySelectorAll(".masonry .trip")];
const tombolSemua = document.getElementById("semua");
const lainnya = document.getElementById("lainnya");
let kategori = "semua";
let terbuka = false;
const cocok = k => kategori === "semua" || k.dataset.k === kategori;
const dua = n => String(n).padStart(2, "0");

function tataGaleri() {
  const tampil = cerita.filter(cocok);
  cerita.forEach(c => { c.hidden = !cocok(c); });
  tampil.forEach((c, i) => {
    c.querySelector(".no-cerita").textContent = dua(i + 1) + " / " + dua(tampil.length);
  });
  kartuBiasa.forEach(k => k.classList.toggle("sembunyi", !cocok(k)));
  const total = kartuBiasa.filter(cocok).length;
  tombolSemua.hidden = total === 0;
  lainnya.hidden = total === 0 || !terbuka;
  tombolSemua.textContent = terbuka ? "Sembunyikan ↑" : "Perjalanan lainnya (" + total + ") ↓";
}
tombolFilter.forEach(tombol => {
  tombol.addEventListener("click", () => {
    kategori = tombol.dataset.f;
    tombolFilter.forEach(t => t.classList.toggle("on", t === tombol));
    tataGaleri();
  });
});
tombolSemua.addEventListener("click", () => {
  terbuka = !terbuka;
  tataGaleri();
});
tataGaleri();

// foto tegak (portrait) tampil sesuai bentuk aslinya
document.querySelectorAll(".foto-besar:not(.slider) img").forEach(im => {
  const cek = () => {
    if (im.naturalHeight > im.naturalWidth * 1.05) im.closest(".foto-besar").classList.add("tegak");
  };
  if (im.complete) cek(); else im.addEventListener("load", cek);
});

// 4. Lightbox: geser jari, titik indikator (panah hanya di laptop)
const lb = document.getElementById("lb");
const lbJalur = document.getElementById("lb-jalur");
const lbCap = document.getElementById("lb-cap");
const lbHitung = document.getElementById("lb-hitung");
const lbTitik = document.getElementById("lb-titik");
const lbPrev = document.querySelector(".lb-prev");
const lbNext = document.querySelector(".lb-next");
let foto = [];
let posisi = 0;
let kembali = null;          // dialog yang dibuka ulang saat lightbox ditutup
let sinkron = null;          // slider asal, disamakan posisinya saat lightbox ditutup
const slider = new Map();    // dialog -> kontrol slidernya

// kunci scroll halaman saat dialog / lightbox terbuka
function kunci(ya) { root.classList.toggle("kunci", ya); }

function perbaruiLb() {
  const n = foto.length;
  posisi = Math.min(Math.round(lbJalur.scrollLeft / (lbJalur.clientWidth || 1)), Math.max(n - 1, 0));
  lbHitung.hidden = lbTitik.hidden = lbPrev.hidden = lbNext.hidden = n < 2;
  lbHitung.textContent = (posisi + 1) + " / " + n;
  [...lbTitik.children].forEach((t, k) => t.classList.toggle("on", k === posisi));
}
function bukaFoto(daftar, idx, jdl, mt) {
  foto = daftar;
  posisi = idx;
  lbJalur.innerHTML = daftar.map(f => '<div class="lb-slide"><img src="foto/' + f + '" alt=""></div>').join("");
  lbTitik.innerHTML = "<i></i>".repeat(daftar.length);
  lbJalur.querySelectorAll("img").forEach(pudar);
  lbCap.innerHTML = "<b>" + jdl + "</b>" + mt;
  lb.hidden = false;
  kunci(true);
  lbJalur.scrollTo({ left: idx * lbJalur.clientWidth, behavior: "auto" });
  perbaruiLb();
}
function buka(kartu) {
  bukaFoto(kartu.dataset.foto.split(","), 0, kartu.dataset.judul, kartu.dataset.meta || kartu.querySelector(".info p").textContent);
}
function tutup() {
  if (lb.hidden || lb.classList.contains("keluar")) return;
  const beres = () => {
    lb.hidden = true;
    lb.classList.remove("keluar");
    if (kembali) {
      const d = kembali;
      kembali = null;
      d.showModal();
    } else {
      kunci(false);
    }
    if (sinkron) { sinkron(posisi); sinkron = null; }
  };
  if (kurangi) { beres(); return; }
  lb.classList.add("keluar");
  setTimeout(beres, 200);
}
function geser(arah) {
  lbJalur.scrollBy({ left: arah * lbJalur.clientWidth, behavior: "smooth" });
}

lbJalur.addEventListener("scroll", perbaruiLb, { passive: true });
document.querySelectorAll(".trip").forEach(kartu => {
  kartu.addEventListener("click", () => {
    if (kartu.querySelector("img")) buka(kartu);
  });
});
cerita.forEach(c => {
  c.querySelectorAll(".foto-besar:not(.slider)").forEach(el => {
    el.addEventListener("click", () => { if (c.querySelector("img")) buka(c); });
  });
});
document.querySelector(".lb-tutup").addEventListener("click", tutup);
lbPrev.addEventListener("click", () => geser(-1));
lbNext.addEventListener("click", () => geser(1));
lb.addEventListener("click", e => {
  if (e.target === lb || e.target.classList.contains("lb-slide")) tutup();
});
document.addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") tutup();
  if (e.key === "ArrowLeft") geser(-1);
  if (e.key === "ArrowRight") geser(1);
});

// 5. Slider foto (Journey + detail project) dan dialog project
document.querySelectorAll(".slider").forEach(el => {
  const jalur = el.querySelector(".jalur");
  const hitung = el.querySelector(".hitung");
  const titik = el.querySelector(".titik");
  const tombol = el.querySelectorAll(".s-nav");
  const gambar = () => [...jalur.querySelectorAll("img")];

  function perbarui() {
    const n = gambar().length;
    const i = Math.min(Math.round(jalur.scrollLeft / (jalur.clientWidth || 1)), Math.max(n - 1, 0));
    el.hidden = n === 0;
    hitung.hidden = titik.hidden = n < 2;
    tombol.forEach(b => { b.hidden = n < 2; });
    hitung.textContent = (i + 1) + " / " + n;
    if (titik.children.length !== n) titik.innerHTML = "<i></i>".repeat(n);
    [...titik.children].forEach((t, k) => t.classList.toggle("on", k === i));
  }
  function pergi(i) {
    jalur.scrollTo({ left: i * jalur.clientWidth, behavior: "auto" });
    perbarui();
  }

  jalur.addEventListener("scroll", perbarui, { passive: true });
  el.querySelector(".s-prev").addEventListener("click", () => jalur.scrollBy({ left: -jalur.clientWidth, behavior: "smooth" }));
  el.querySelector(".s-next").addEventListener("click", () => jalur.scrollBy({ left: jalur.clientWidth, behavior: "smooth" }));
  gambar().forEach(im => im.addEventListener("error", () => setTimeout(perbarui)));

  jalur.addEventListener("click", e => {
    const im = e.target.closest("img");
    if (!im) return;
    const daftar = gambar();
    const d = el.closest("dialog");
    const c = el.closest(".cerita");
    sinkron = pergi;
    if (d) { kembali = d; d.close(); }
    bukaFoto(
      daftar.map(x => x.getAttribute("src").replace("foto/", "")),
      daftar.indexOf(im),
      d ? d.querySelector("h3").textContent : c.dataset.judul,
      d ? "" : c.dataset.meta
    );
  });

  const d = el.closest("dialog");
  if (d) slider.set(d, { perbarui, pergi });
  perbarui();
});

document.querySelectorAll(".lihat").forEach(tombol => {
  tombol.addEventListener("click", () => {
    const d = document.getElementById(tombol.dataset.dialog);
    d.showModal();
    kunci(true);
    const sl = slider.get(d);
    if (sl) sl.perbarui();
  });
});
function tutupDialog(d) {
  if (!d.open || d.classList.contains("keluar")) return;
  if (kurangi) { d.close(); return; }
  d.classList.add("keluar");
  setTimeout(() => { d.classList.remove("keluar"); d.close(); }, 200);
}
document.querySelectorAll("dialog.detail").forEach(d => {
  d.querySelector(".tutup").addEventListener("click", () => tutupDialog(d));
  d.addEventListener("click", e => { if (e.target === d) tutupDialog(d); });
  d.addEventListener("cancel", e => { e.preventDefault(); tutupDialog(d); });
  d.addEventListener("close", () => { if (lb.hidden) kunci(false); });
});

// 6. Garis progres, tombol atas, dan menu aktif saat scroll
const progres = document.getElementById("progres");
const atas = document.getElementById("atas");
const bagian = [...document.querySelectorAll("main section")];

window.addEventListener("scroll", () => {
  const total = root.scrollHeight - window.innerHeight;
  progres.style.width = (window.scrollY / total) * 100 + "%";
  atas.classList.toggle("tampil", window.scrollY > 400);

  let sekarang = "";
  bagian.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) sekarang = s.id;
  });
  menu.querySelectorAll("a").forEach(a => {
    a.classList.toggle("aktif", a.getAttribute("href") === "#" + sekarang);
  });
});
atas.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
