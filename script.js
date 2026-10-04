const root = document.documentElement;
const tombolTema = document.getElementById("tema");

// 1. Ganti tema (pilihan diingat di browser)
function aturTema(gelap) {
  root.dataset.theme = gelap ? "dark" : "light";
  tombolTema.textContent = gelap ? "☀️" : "🌙";
}
let gelap = false;
try { gelap = localStorage.getItem("tema") === "gelap"; } catch (e) {}
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

// 3. Galeri perjalanan: filter + tombol "Lihat semua"
const BATAS = 6; // jumlah kartu yang tampil sebelum "Lihat semua"
const tombolFilter = document.querySelectorAll("#filter button");
const unggulan = document.querySelector(".trip.unggulan");
const kartuBiasa = [...document.querySelectorAll(".masonry .trip")];
const tombolSemua = document.getElementById("semua");
let kategori = "semua";
let terbuka = false;

function tataGaleri() {
  const cocok = k => kategori === "semua" || k.dataset.k === kategori;
  unggulan.classList.toggle("sembunyi", !cocok(unggulan));

  let hitung = 0;
  kartuBiasa.forEach(k => {
    let tampil = false;
    if (cocok(k)) {
      hitung++;
      tampil = terbuka || hitung <= BATAS;
    }
    k.classList.toggle("sembunyi", !tampil);
  });

  const total = kartuBiasa.filter(cocok).length;
  tombolSemua.hidden = terbuka || total <= BATAS;
  tombolSemua.textContent = "Lihat semua (" + total + ") ↓";
}

tombolFilter.forEach(tombol => {
  tombol.addEventListener("click", () => {
    kategori = tombol.dataset.f;
    terbuka = false;
    tombolFilter.forEach(t => t.classList.toggle("on", t === tombol));
    tataGaleri();
  });
});
tombolSemua.addEventListener("click", () => {
  terbuka = true;
  tataGaleri();
});
tataGaleri();

// 4. Lightbox: tap kartu, geser semua foto gunung itu
const lb = document.getElementById("lb");
const lbImg = document.getElementById("lb-img");
const lbCap = document.getElementById("lb-cap");
const lbPrev = document.querySelector(".lb-prev");
const lbNext = document.querySelector(".lb-next");
let foto = [];
let judul = "";
let meta = "";
let posisi = 0;

function tampilkan() {
  lbImg.src = "foto/" + foto[posisi];
  const nomor = foto.length > 1 ? " · " + (posisi + 1) + " / " + foto.length : "";
  lbCap.innerHTML = "<b>" + judul + "</b>" + meta + nomor;
  lbPrev.hidden = lbNext.hidden = foto.length < 2;
}
function buka(kartu) {
  foto = kartu.dataset.foto.split(",");
  judul = kartu.dataset.judul;
  meta = kartu.querySelector(".info p").textContent;
  posisi = 0;
  tampilkan();
  lb.hidden = false;
}
function tutup() { lb.hidden = true; }
function geser(arah) {
  if (foto.length < 2) return;
  posisi = (posisi + arah + foto.length) % foto.length;
  tampilkan();
}

document.querySelectorAll(".trip").forEach(kartu => {
  kartu.addEventListener("click", () => {
    if (kartu.querySelector("img")) buka(kartu);
  });
});
document.querySelector(".lb-tutup").addEventListener("click", tutup);
lbPrev.addEventListener("click", () => geser(-1));
lbNext.addEventListener("click", () => geser(1));
lb.addEventListener("click", e => { if (e.target === lb) tutup(); });

document.addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") tutup();
  if (e.key === "ArrowLeft") geser(-1);
  if (e.key === "ArrowRight") geser(1);
});

// geser jari di HP
let awalX = 0;
lb.addEventListener("touchstart", e => { awalX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener("touchend", e => {
  const selisih = e.changedTouches[0].clientX - awalX;
  if (Math.abs(selisih) > 50) geser(selisih > 0 ? -1 : 1);
});

// 5. Detail project (dialog)
document.querySelectorAll(".lihat").forEach(tombol => {
  tombol.addEventListener("click", () => {
    document.getElementById(tombol.dataset.dialog).showModal();
  });
});
document.querySelectorAll("dialog.detail").forEach(d => {
  d.querySelector(".tutup").addEventListener("click", () => d.close());
  d.addEventListener("click", e => { if (e.target === d) d.close(); });
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

// 7. Bagian muncul halus saat di-scroll
bagian.forEach(el => el.classList.add("reveal"));
const pengamat = new IntersectionObserver(hasil => {
  hasil.forEach(item => {
    if (item.isIntersecting) {
      item.target.classList.add("show");
      pengamat.unobserve(item.target);
    }
  });
}, { threshold: 0.08 });
bagian.forEach(el => pengamat.observe(el));
