// 1. Ganti tema (ingat pilihan pengunjung)
const body = document.body;
const tombolTema = document.getElementById("tema");

function aturTema(terang) {
  body.classList.toggle("terang", terang);
  tombolTema.textContent = terang ? "🌙" : "☀️";
}

aturTema(localStorage.getItem("tema") === "terang");

tombolTema.addEventListener("click", () => {
  const terang = !body.classList.contains("terang");
  aturTema(terang);
  localStorage.setItem("tema", terang ? "terang" : "gelap");
});

// 2. Menu hamburger (HP)
const menu = document.getElementById("menu");
document.getElementById("burger").addEventListener("click", () => {
  menu.classList.toggle("buka");
});
menu.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => menu.classList.remove("buka"));
});

// 3. Animasi muncul saat scroll
const target = document.querySelectorAll("main section");
target.forEach(el => el.classList.add("reveal"));

const pengamat = new IntersectionObserver(daftar => {
  daftar.forEach(item => {
    if (item.isIntersecting) {
      item.target.classList.add("show");
      pengamat.unobserve(item.target);
    }
  });
}, { threshold: 0.1 });

target.forEach(el => pengamat.observe(el));

// 4. Lightbox galeri
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

document.querySelectorAll(".galeri img").forEach(gambar => {
  gambar.addEventListener("click", () => {
    lightboxImg.src = gambar.src;
    lightbox.classList.add("aktif");
  });
});
lightbox.addEventListener("click", () => lightbox.classList.remove("aktif"));
// 5. Angka statistik naik dari 0
document.querySelectorAll("[data-angka]").forEach(el => {
  const tujuan = +el.dataset.angka;
  const hitung = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    let n = 0;
    const jalan = setInterval(() => {
      n++;
      el.textContent = n;
      if (n >= tujuan) clearInterval(jalan);
    }, 120);
    hitung.disconnect();
  });
  hitung.observe(el);
});
