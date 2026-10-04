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

// 3. Filter galeri (Semua / Touring / Pendakian)
const tombolFilter = document.querySelectorAll("#filter button");
const semuaFoto = document.querySelectorAll(".foto");

tombolFilter.forEach(tombol => {
  tombol.addEventListener("click", () => {
    const pilihan = tombol.dataset.f;
    tombolFilter.forEach(t => t.classList.toggle("on", t === tombol));
    semuaFoto.forEach(foto => {
      const cocok = pilihan === "semua" || foto.dataset.k === pilihan;
      foto.classList.toggle("sembunyi", !cocok);
    });
  });
});

// 4. Lightbox: foto layar penuh + caption + sebelumnya/berikutnya
const lb = document.getElementById("lb");
const lbImg = document.getElementById("lb-img");
const lbCap = document.getElementById("lb-cap");
let daftar = [];
let posisi = 0;

function tampilkan() {
  const foto = daftar[posisi];
  lbImg.src = foto.querySelector("img").src;
  lbCap.innerHTML = foto.querySelector("figcaption").innerHTML;
}
function buka(foto) {
  // hanya foto yang terlihat (sesuai filter) dan gambarnya ada
  daftar = [...document.querySelectorAll(".foto:not(.sembunyi)")].filter(f => f.querySelector("img"));
  posisi = daftar.indexOf(foto);
  tampilkan();
  lb.hidden = false;
}
function tutup() { lb.hidden = true; }
function geser(arah) {
  posisi = (posisi + arah + daftar.length) % daftar.length;
  tampilkan();
}

semuaFoto.forEach(foto => {
  foto.addEventListener("click", () => {
    if (foto.querySelector("img")) buka(foto);
  });
});
document.querySelector(".lb-tutup").addEventListener("click", tutup);
document.querySelector(".lb-prev").addEventListener("click", () => geser(-1));
document.querySelector(".lb-next").addEventListener("click", () => geser(1));
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
