// Statik site üreticisi: site.config.json + src/icerik.mjs → dist/
// Kullanım: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { URUNLER, BOLGELER, SSS_GENEL, SSS_EK, YORUMLAR, TUP_EK, TUP_REHBER } from "./src/icerik.mjs";

const c = JSON.parse(readFileSync("site.config.json", "utf8"));
const OUT = "dist";
const BUGUN = new Date().toISOString().slice(0, 10);

const surumler = {};
const v = (yol) => (surumler[yol] ??= `${yol}?v=${createHash("md5").update(readFileSync("public" + yol)).digest("hex").slice(0, 8)}`);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const url = (yol) => c.alanAdi + yol;
const adresSatiri = `${c.adres.mahalle}, ${c.adres.sokak}, ${c.adres.postaKodu} ${c.adres.ilce}/${c.adres.il}`;
const WA_GENEL = "Merhaba, su siparişi vermek istiyorum.";
const waLink = (metin = WA_GENEL) => `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(metin)}`;
const yolTarifi = `https://www.google.com/maps/dir/?api=1&destination=${c.konum.lat},${c.konum.lng}`;

// ---------- İkonlar (24x24, çizgi) ----------
const IK = {
  tel: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  damla: '<path d="M12 2.7s-6.5 7-6.5 11.8a6.5 6.5 0 0 0 13 0C18.5 9.7 12 2.7 12 2.7z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
  kalkan: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  kamyon: '<path d="M1 5h13v11H1zM14 9h4l3 3v4h-7"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="17.5" cy="18.5" r="2"/>',
  tekrar: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
  el: '<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>',
  pil: '<rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2M7 10l-1 2h4l-1 2"/>',
  bina: '<path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3"/>',
  takvim: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
  canta: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>',
  saat: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  ok: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  kapat: '<path d="M18 6 6 18M6 6l12 12"/>',
  posta: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  yildiz: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  gulen: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
  ig: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  arti: '<path d="M12 5v14M5 12h14"/>',
  eksi: '<path d="M5 12h14"/>',
  yol: '<path d="m3 11 19-9-9 19-2-8z"/>',
  alev: '<path d="M12 2c3 4 5 6.5 5 10a5 5 0 0 1-10 0c0-2 1-3.6 2.5-5 .3 2 1.2 3 2.5 3.2C11.6 8 11 5 12 2z"/>',
  sepet: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18"/><path d="M12 10v6M9 13h6"/>',
};
const ikon = (ad, cls = "") => `<svg class="ik${cls ? " " + cls : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IK[ad]}</svg>`;
const WA_SVG = '<svg class="ik" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3 .78.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.25-.12-1.46-.72-1.7-.8-.22-.08-.39-.12-.55.13-.17.24-.63.8-.78.96-.14.17-.29.19-.53.06a6.7 6.7 0 0 1-3.34-2.92c-.25-.43.25-.4.72-1.34.08-.16.04-.3-.02-.43l-.75-1.8c-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.7 2.7 0 0 0-.85 2.02 4.7 4.7 0 0 0 1 2.5 10.8 10.8 0 0 0 4.14 3.66c1.54.66 2.14.72 2.9.6.47-.07 1.46-.6 1.66-1.18.2-.58.2-1.07.15-1.18-.07-.1-.23-.16-.48-.28z"/></svg>';
const YILDIZLAR = `<span class="yildizlar" aria-hidden="true">${'<svg viewBox="0 0 24 24"><path fill="currentColor" d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></svg>'.repeat(5)}</span>`;

const logoBlok = (etiket = "a", beyaz = false) => `<${etiket} class="logo"${etiket === "a" ? ' href="/"' : ""}><img src="${v(`/logo-yatay${beyaz ? "-beyaz" : ""}.svg`)}" width="182" height="38" alt="Bayramoğlu Su Bayisi"></${etiket}>`;

// ---------- Görsel ----------
const FOTO = {
  "damacana-kaynak": [[480, 640, 960, 1200], 1200, 1000],
  "dogal-kaynak-suyu": [[800, 1600], 1600, 787],
  "kapiya-teslimat": [[640, 1200], 1200, 800],
  "hijyenik-dolum": [[640, 1200], 1200, 542],
  "mayadag-19l": [[320, 640, 760], 760, 570],
  "damacana-pompasi": [[320, 480, 800], 800, 1000],
  "seda-pet-su": [[320, 560], 560, 420],
  "baharlife-bardak-su": [[320, 640, 721], 721, 541],
  "tup-gaz": [[320, 640, 1200], 1200, 900],
  "servis-araci": [[640, 771], 771, 688],
  "tup-gaz-gercek": [[320, 640, 1200], 1200, 900],
  "tup-forklift-gercek": [[320, 640, 734], 734, 550],
  "tup-palmiye-gercek": [[320, 640, 1053], 1053, 790],
  "pet-15-foto": [[320, 640, 1200], 1200, 900],
  "orgaz-dedantor": [[320, 640, 900], 900, 675],
  "orgaz-kamp-ocagi": [[320, 640, 1200], 1200, 900],
  "desa-pompa": [[320, 640, 1200], 1200, 900],
  "kamp-ocagi-tupte": [[320, 640, 1200], 1200, 900],
  "tup-forklift": [[320, 640, 1200], 1200, 900],
  "tup-palmiye": [[320, 640, 1200], 1200, 900],
  "tup-ticari": [[320, 640, 1200], 1200, 900],
  "bayi-dukkan": [[800, 1600], 1600, 721],
};
const foto = (ad, alt, { sizes = "(min-width: 960px) 50vw, 100vw", oncelik = false, cls = "" } = {}) => {
  const [ws, w, h] = FOTO[ad];
  const set = ws.map((x) => `${v(`/foto/${ad}-${x}.webp`)} ${x}w`).join(", ");
  return `<img${cls ? ` class="${cls}"` : ""} src="${v(`/foto/${ad}-${ws[ws.length - 1]}.webp`)}" srcset="${set}" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}"${oncelik ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
};
const fotoUrl = (ad) => url(v(`/foto/${ad}-${FOTO[ad][0].at(-1)}.webp`));

// ---------- Bileşenler ----------
const NAV = [
  ["/hizmetlerimiz/", "Ürünler"],
  ["/hizmetlerimiz/tup-gaz/", "Tüp Gaz"],
  ["/hizmetlerimiz/ofis-isyeri-su-servisi/", "Kurumsal"],
  ["/hizmet-bolgeleri/", "Bölgeler"],
  ["/hakkimizda/", "Hakkımızda"],
  ["/sikca-sorulan-sorular/", "SSS"],
  ["/iletisim/", "İletişim"],
];

// İki GSM hattı her yerde bölgesiyle birlikte gösterilir. sira = "ikinci" → Kumburgaz hattı önce (Kumburgaz sayfası)
const HATLAR = [
  { tel: c.telefon, gorunen: c.telefonGorunen, bolge: "Celaliye · Kamiloba", kisa: "Celaliye" },
  { tel: c.ikinciTelefon, gorunen: c.ikinciTelefonGorunen, bolge: "Kumburgaz · Küme Evler", kisa: "Kumburgaz" },
];
const hatSirasi = (sira) => (sira === "ikinci" ? [HATLAR[1], HATLAR[0]] : HATLAR);
const araDugmeleri = (cls = "btn-cizgi", sira) => hatSirasi(sira).map((h) => `<a class="btn ${cls} btn-hat" href="tel:${h.tel}" data-track="call">${ikon("tel")}<span><b>${h.gorunen}</b><small>${h.bolge}</small></span></a>`).join("");

const ustBar = () => `
<div class="ustbar"><div class="kap ustbar-ic">
  <a href="${c.googleHaritaLinki}" target="_blank" rel="noopener">${ikon("pin")}<span>${esc(adresSatiri)}</span></a>
  <span class="ustbar-sag">
    ${HATLAR.map((h) => `<a href="tel:${h.tel}" data-track="call">${ikon("tel")}${h.bolge}: <b>${h.gorunen}</b></a>`).join("")}
    <a href="${c.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ikon("ig")}<span>@celaliyesubayisi</span></a>
  </span>
</div></div>`;

const baslik = (aktif) => `
<header class="ust" id="ust">
  <div class="kap ust-ic">
    ${logoBlok()}
    <nav class="nav" id="nav" aria-label="Ana menü">
      <ul>${NAV.map(([h, a]) => `<li><a href="${h}"${aktif === h ? ' aria-current="page"' : ""}>${a}</a></li>`).join("")}</ul>
      <div class="nav-mobil-alt">
        <a class="btn btn-wa btn-blok" href="${waLink()}" target="_blank" rel="noopener" data-track="whatsapp">${WA_SVG}WhatsApp'tan sipariş</a>
        ${araDugmeleri("btn-cizgi btn-blok")}
      </div>
    </nav>
    <div class="ust-cta">
      <div class="ust-hatlar">${ikon("tel")}<span>${HATLAR.map((h) => `<a href="tel:${h.tel}" data-track="call"><b>${h.gorunen}</b><small>${h.kisa}</small></a>`).join("")}</span></div>
      <a class="btn btn-ana btn-kucuk" href="/siparis/">Sipariş Ver</a>
      <button class="menu-dugme" id="menuDugme" aria-label="Menüyü aç" aria-expanded="false" aria-controls="nav">${ikon("menu", "ac")}${ikon("kapat", "kapa")}</button>
    </div>
  </div>
</header>`;

const altCubuk = (tel = c.telefon) => `
<div class="alt-cubuk" role="navigation" aria-label="Hızlı sipariş">
  ${hatSirasi(tel === c.ikinciTelefon ? "ikinci" : undefined).map((h) => `<a href="tel:${h.tel}" class="ac-ara" data-track="call">${ikon("tel")}<span><b>${h.kisa}</b><small>${h.gorunen}</small></span></a>`).join("")}
  <a href="${waLink()}" class="ac-wa" target="_blank" rel="noopener" data-track="whatsapp">${WA_SVG}<span>WhatsApp</span></a>
</div>`;

const altBilgi = () => `
<footer class="alt">
  <div class="kap alt-ust">
    <div class="alt-marka">
      ${logoBlok("div", true)}
      <p>${c.tecrubeYil} yıldır Büyükçekmece'de ${esc(c.kaynakSu)} dağıtımı. Damacana, bardak su, pet su, pompa ve tüp gaz; en kısa sürede kapınızda.</p>
      <div class="alt-sosyal">
        <a href="${c.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ikon("ig")}</a>
        <a href="${c.googleHaritaLinki}" target="_blank" rel="noopener" aria-label="Google Haritalar">${ikon("pin")}</a>
        <a href="${waLink()}" target="_blank" rel="noopener" aria-label="WhatsApp">${WA_SVG}</a>
      </div>
    </div>
    <div>
      <h2 class="alt-baslik">Ürünler</h2>
      <ul>${URUNLER.map((u) => `<li><a href="/hizmetlerimiz/${u.slug}/">${esc(u.ad)}</a></li>`).join("")}${TUP_EK.map((u) => `<li><a href="/hizmetlerimiz/${u.slug}/">${esc(u.ad)}</a></li>`).join("")}<li><a href="/hizmetlerimiz/ofis-isyeri-su-servisi/">Ofis ve İşyeri Su Servisi</a></li><li><a href="/toptan-su-tedarikcisi/">Toptan Su Tedarikçisi</a></li></ul>
    </div>
    <div>
      <h2 class="alt-baslik">Bölgeler</h2>
      <ul>${BOLGELER.map((b) => `<li><a href="/${b.slug}/">${esc(b.ad)} Su ve Tüp Gaz</a></li>`).join("")}<li><a href="/hizmet-bolgeleri/">Tüm bölgeler</a></li></ul>
    </div>
    <div>
      <h2 class="alt-baslik">İletişim</h2>
      <ul class="alt-iletisim">
        <li>${ikon("tel")}<span><a href="tel:${c.telefon}" data-track="call">${c.telefonGorunen}</a><small>Celaliye · Kamiloba · WhatsApp</small></span></li>
        <li>${ikon("tel")}<span><a href="tel:${c.ikinciTelefon}" data-track="call">${c.ikinciTelefonGorunen}</a><small>Kumburgaz · Küme Evler</small></span></li>
        <li>${ikon("tel")}<span><a href="tel:${c.sabitTelefon}" data-track="call">${c.sabitTelefonGorunen}</a><small>Sabit hat · Celaliye, Kamiloba</small></span></li>
        <li>${ikon("tel")}<span><a href="tel:${c.kumburgazSabitTelefon}" data-track="call">${c.kumburgazSabitTelefonGorunen}</a><small>Sabit hat · Kumburgaz, Küme Evler</small></span></li>
        <li>${ikon("posta")}<a href="mailto:${c.eposta}">${c.eposta}</a></li>
        <li>${ikon("pin")}<a href="${c.googleHaritaLinki}" target="_blank" rel="noopener">${esc(adresSatiri)}</a></li>
      </ul>
    </div>
  </div>
  <div class="kap alt-alt">
    <span>© ${new Date().getFullYear()} ${esc(c.marka)}</span>
    <span><a href="/hakkimizda/">Hakkımızda</a> · <a href="/sikca-sorulan-sorular/">SSS</a> · <a href="/gizlilik/">Gizlilik</a></span>
  </div>
</footer>`;

const kirinti = (liste) => `<nav class="kirinti" aria-label="Sayfa yolu"><ol><li><a href="/">Ana Sayfa</a></li>${liste.map(([ad, yol], i) => i === liste.length - 1 ? `<li aria-current="page">${esc(ad)}</li>` : `<li><a href="${yol}">${esc(ad)}</a></li>`).join("")}</ol></nav>`;

const sssBlok = (liste, baslikMetni = "Sıkça sorulan sorular", ust = "SSS") => `
<section class="bolum" id="sss"><div class="kap kap-dar">
  <div class="bolum-bas"><span class="ust-etiket">${ust}</span><h2>${baslikMetni}</h2></div>
  <div class="sss">${liste.map(([s, y], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(s)}${ikon("arti", "sss-ik")}</summary><p>${esc(y)}</p></details>`).join("")}</div>
</div></section>`;

const guvenSeridi = () => `
<ul class="guven">
  <li><strong>${c.tecrubeYil}+</strong><span>yıllık tecrübe</span></li>
  <li><strong>${c.aboneSayisi}</strong><span>abone müşteri</span></li>
  <li><strong>${c.googlePuan} ${ikon("yildiz", "yildiz-ik")}</strong><span>Google puanı</span></li>
  <li><strong>Hızlı</strong><span>kapıya teslimat</span></li>
</ul>`;

const urunKarti = (u) => `
<article class="urun-kart">
  <a class="urun-foto" href="/hizmetlerimiz/${u.slug}/" tabindex="-1" aria-hidden="true">${foto(u.foto, u.fotoAlt, { sizes: "(min-width: 1100px) 270px, (min-width: 640px) 45vw, 46vw" })}</a>
  <div class="urun-govde">
    <h3><a href="/hizmetlerimiz/${u.slug}/">${esc(u.ad)}</a></h3>
    <p>${esc(u.ozet)}</p>
    <div class="urun-alt">
      ${c.urunFiyatlari[u.id] ? `<span class="fiyat">${esc(c.urunFiyatlari[u.id])}</span>` : ""}
      <button type="button" class="btn btn-ekle" data-ekle="${u.id}" aria-label="${esc(u.ad)} siparişe ekle">${ikon("arti")}Siparişe ekle</button>
    </div>
  </div>
</article>`;

const urunIzgara = (haric) => `<div class="urun-izgara">${URUNLER.filter((u) => u.id !== haric).map(urunKarti).join("")}</div>`;

// Sipariş oluşturucu: seçimleri hazır WhatsApp mesajına çevirir; hiçbir veri sunucuya gönderilmez.
const TUP_MARKA = ["Marka fark etmez", "Milangaz", "Likitgaz", "Ergaz"];
const TUP_VARYANT = ["12 kg mutfak tüpü", "12 kg uzun tüp – ısıtıcı için", "24 kg ticari tüp", "45 kg sanayi tüpü", "2 kg piknik tüpü"];
// Sipariş formunda ürün kartı olmayan tüp satırları. varyantEtiket: seçilen çeşit mesajda ürün adı olarak yazılır.
const FORM_EK = [
  { id: "ozeltup", ad: "Forklift ve Özel Tüp", kisaAd: "Özel tüp", birim: "adet", foto: "tup-forklift-gercek", varyantlar: ["LiftMax forklift tüpü", "İzoMax pürmüz tüpü", "ProMaster 24 kg tüp"], varyantEtiket: true },
  { id: "kamp", ad: "Kamp Ürünleri", kisaAd: "Kamp", birim: "adet", foto: "kamp-ocagi-tupte", varyantlar: ["Kamp ocağı + 2 kg piknik tüpü", "Kamp ocağı (tüpsüz)", "Kamp lambası"], varyantEtiket: true },
  { id: "dedantor", ad: "LPG Dedantörü", kisaAd: "LPG dedantörü / regülatör", birim: "adet", foto: "orgaz-dedantor" },
  { id: "palmiye", ad: "Palmiye Isıtıcı", kisaAd: "Palmiye açık hava ısıtıcısı", birim: "adet", foto: "tup-palmiye-gercek" },
];
const siparisFormu = ({ mahalle = "", urun = "", varyant = "", baslikMetni = "Siparişinizi 30 saniyede hazırlayın", ust = "Online sipariş", tel = c.telefon, telGorunen = c.telefonGorunen } = {}) => `
<section class="bolum siparis-bolum" id="siparis"><div class="kap">
  <div class="bolum-bas"><span class="ust-etiket">${ust}</span><h2>${baslikMetni}</h2><p>Ürünü ve adresinizi seçin; siparişiniz hazır bir WhatsApp mesajına dönüşsün. Gönder'e dokunmanız yeterli.</p></div>
  <form class="siparis" id="siparisFormu" novalidate data-baslangic-urun="${urun}" data-baslangic-varyant="${esc(varyant)}"${mahalle ? " data-sabit-mahalle" : ""}>
    <div class="siparis-sol">
      <fieldset class="adim">
        <legend><span class="adim-no">1</span>Ne istersiniz?</legend>
        <div class="kalemler">
          ${[...URUNLER, ...FORM_EK].map((u) => `
          <div class="kalem" data-urun="${u.id}" data-ad="${esc(u.kisaAd)}" data-birim="${u.birim}"${u.varyantEtiket ? " data-varyant-etiket" : ""}>
            <img src="${v(`/foto/${u.foto}-kare.webp`)}" alt="" width="56" height="56" loading="lazy">
            <span class="kalem-ad"><b>${esc(u.ad)}</b>${(u.id === "tup" ? TUP_VARYANT : u.varyantlar) ? `<select class="varyant" data-varyant aria-label="${esc(u.kisaAd)} çeşidi">${(u.id === "tup" ? TUP_VARYANT : u.varyantlar).map((t) => `<option>${t}</option>`).join("")}</select>` : `<small>${u.birim}</small>`}${u.id === "tup" ? `<select class="varyant" data-varyant data-marka aria-label="Tüp markası">${TUP_MARKA.map((t) => `<option>${t}</option>`).join("")}</select>` : ""}</span>
            <span class="sayac">
              <button type="button" data-azalt aria-label="${esc(u.kisaAd)} azalt">${ikon("eksi")}</button>
              <output aria-live="polite" aria-label="${esc(u.kisaAd)} miktarı">0</output>
              <button type="button" data-arttir aria-label="${esc(u.kisaAd)} arttır">${ikon("arti")}</button>
            </span>
          </div>`).join("")}
        </div>
      </fieldset>
      <fieldset class="adim">
        <legend><span class="adim-no">2</span>Nereye getirelim?</legend>
        <div class="alanlar">
          <label class="alan"><span>Mahalle</span>
            <select name="mahalle" id="fMahalle">
              ${BOLGELER.map((b) => `<option${b.ad === mahalle ? " selected" : ""}>${b.ad}</option>`).join("")}
              <option value="diger">Büyükçekmece – diğer mahalle</option>
            </select>
          </label>
          <label class="alan alan-genis"><span>Açık adres</span>
            <textarea name="adres" id="fAdres" rows="2" placeholder="Sokak, bina no, daire · site adı / blok" autocomplete="street-address"></textarea>
            <small class="hata" id="adresHata" hidden>Teslimat için adresinizi yazın.</small>
          </label>
          <label class="alan"><span>Adınız <em>(isteğe bağlı)</em></span><input name="ad" id="fAd" autocomplete="name" placeholder="Kapıda kime sorulsun?"></label>
          <label class="alan"><span>Kat / asansör <em>(isteğe bağlı)</em></span><input name="kat" id="fKat" placeholder="Örn. 3. kat, asansör var"></label>
        </div>
      </fieldset>
      <fieldset class="adim">
        <legend><span class="adim-no">3</span>Ne zaman?</legend>
        <div class="secenekler" role="radiogroup">
          <label class="cip"><input type="radio" name="zaman" value="En kısa sürede" checked><span>En kısa sürede</span></label>
          <label class="cip"><input type="radio" name="zaman" value="Bugün, belirli saatte"><span>Bugün, belirli saatte</span></label>
          <label class="cip"><input type="radio" name="zaman" value="Yarın"><span>Yarın</span></label>
        </div>
        <label class="alan alan-saat" id="saatAlan" hidden><span>Saat</span><input type="time" name="saat" id="fSaat"></label>
        <label class="onay"><input type="checkbox" id="fDuzenli"><span><b>Düzenli teslimat istiyorum</b><small>Haftalık / iki haftada bir; her seferinde yeniden sipariş vermeyin.</small></span></label>
        <label class="alan alan-genis"><span>Not <em>(isteğe bağlı)</em></span><input name="not" id="fNot" placeholder="Örn. zile basmayın, kapıya bırakın"></label>
      </fieldset>
    </div>
    <aside class="siparis-ozet" aria-label="Sipariş özeti">
      <div class="ozet-kart">
        <h3>Sipariş özeti</h3>
        <ul class="ozet-liste" id="ozetListe"><li class="bos">Henüz ürün seçmediniz.</li></ul>
        <details class="mesaj-onizle"><summary>WhatsApp mesajını gör</summary><pre id="mesajOnizleme"></pre></details>
        <button type="submit" class="btn btn-wa btn-blok btn-buyuk" id="gonderDugme" data-track="whatsapp_siparis">${WA_SVG}WhatsApp'tan Gönder</button>
        <small class="hata" id="urunHata" hidden>En az bir ürün seçin.</small>
        <label class="onay onay-kucuk"><input type="checkbox" id="fHatirla"><span>Adresimi bu cihazda hatırla</span></label>
        <div class="ozet-ya"><span>ya da</span></div>
        <div class="ozet-hatlar">${araDugmeleri("btn-cizgi btn-blok", tel === c.ikinciTelefon ? "ikinci" : undefined)}</div>
        <p class="ozet-not">${ikon("kalkan")}Bilgileriniz sitede saklanmaz; mesaj doğrudan WhatsApp'a gider.</p>
      </div>
    </aside>
  </form>
</div></section>`;

const cagri = (metin = "Suyunuz bitmeden arayın.", alt = "Büyükçekmece genelinde hızlı teslimat.", [tel, telGorunen] = [c.telefon, c.telefonGorunen]) => `
<section class="cagri"><div class="kap cagri-ic">
  <div><h2>${metin}</h2><p>${alt}</p></div>
  <div class="cagri-dugmeler">
    ${araDugmeleri("btn-beyaz", tel === c.ikinciTelefon ? "ikinci" : undefined)}
    <a class="btn btn-wa btn-buyuk" href="${waLink()}" target="_blank" rel="noopener" data-track="whatsapp">${WA_SVG}WhatsApp</a>
  </div>
</div></section>`;

const haritaBlok = () => `
<div class="harita" id="harita">
  <button type="button" class="harita-yukle" data-lat="${c.konum.lat}" data-lng="${c.konum.lng}">
    <span class="harita-pin">${ikon("pin")}</span>
    <span class="harita-kart"><b>${esc(c.marka)}</b><span>${esc(adresSatiri)}</span><span class="harita-dugme">Haritayı göster</span></span>
  </button>
</div>`;

const adimlar = () => `
<section class="bolum"><div class="kap">
  <div class="bolum-bas"><span class="ust-etiket">Nasıl çalışır?</span><h2>Üç adımda suyunuz kapıda</h2></div>
  <ol class="adimlar">
    <li><span class="adimlar-no">1</span>${ikon("sepet")}<h3>Siparişinizi verin</h3><p>Arayın, WhatsApp'tan yazın ya da sitedeki formu doldurun. Hepsi bir dakikadan kısa sürer.</p></li>
    <li><span class="adimlar-no">2</span>${ikon("kamyon")}<h3>Hemen yola çıkar</h3><p>Siparişiniz servis planına eklenir; mahallenize giden aracımızla en kısa sürede yola çıkar.</p></li>
    <li><span class="adimlar-no">3</span>${ikon("gulen")}<h3>Kapınıza teslim</h3><p>Suyunuz taze ve temiz, kapınıza teslim edilir. Düzenli teslimatla bir daha düşünmenize gerek kalmaz.</p></li>
  </ol>
</div></section>`;

const nedenBiz = () => `
<section class="bolum bolum-acik"><div class="kap">
  <div class="bolum-bas"><span class="ust-etiket">Neden Bayramoğlu?</span><h2>Büyükçekmece'nin ${c.tecrubeYil} yıllık su bayisi</h2><p>Büyük bir zincir değil, Celaliye'den çıkıp komşularına su taşıyan yerel bir su bayisiyiz; mahallede herkesin bildiği sucu. Farkı buradan geliyor.</p></div>
  <div class="ozellikler">
    ${[
      ["damla", "Doğal kaynak suyu", `${c.kaynakSu}; dengeli mineral yapısıyla her gün içmek için.`],
      ["kalkan", "Hijyenik dolum", "Damacanalar dolum tesisinde el değmeden doldurulur, kapalı ve etiketli gelir."],
      ["kamyon", "Hızlı teslimat", "Celaliye, Kamiloba, Kumburgaz ve çevresine en kısa sürede teslim."],
      ["tekrar", "Düzenli teslimat", "Haftalık ya da iki haftada bir; suyunuz bitmeden yenisi gelsin."],
      ["bina", "İşletmelere özel", "Ofis, kafe, market ve etkinlikler için toplu ve düzenli sipariş."],
      ["gulen", "Güler yüzlü servis", `Google'da ${c.googlePuan} puan: müşterilerimiz hızımızı ve ilgimizi anlatıyor.`],
    ].map(([ik, b, p]) => `<div class="ozellik">${ikon(ik)}<h3>${b}</h3><p>${p}</p></div>`).join("")}
  </div>
</div></section>`;

const yorumlar = () => `
<section class="bolum"><div class="kap">
  <div class="bolum-bas bolum-bas-yan">
    <div><span class="ust-etiket">Müşteri yorumları</span><h2>Komşularımız ne diyor?</h2></div>
    <a class="google-rozet" href="${c.googleHaritaLinki}" target="_blank" rel="noopener"><b>${c.googlePuan}</b>${YILDIZLAR}<span>Google'da ${c.googleYorumSayisi} yorum</span></a>
  </div>
  <div class="yorumlar">${YORUMLAR.map(([ad, metin]) => `<figure class="yorum">${YILDIZLAR}<blockquote>“${esc(metin)}”</blockquote><figcaption><span class="avatar" aria-hidden="true">${ad[0]}</span>${esc(ad)}<small>Google yorumu</small></figcaption></figure>`).join("")}</div>
</div></section>`;

const bolgeKartlari = (haric) => `
<div class="bolge-izgara">${BOLGELER.filter((b) => b.slug !== haric).map((b) => `<a class="bolge-kart" href="/${b.slug}/">${ikon("pin")}<span><b>${b.ad}</b><small>Su ve tüp gaz</small></span>${ikon("ok", "ok-ik")}</a>`).join("")}</div>`;

// ---------- Şema ----------
const ISLETME_ID = url("/#isletme");
const isletmeSema = () => ({
  "@type": "LocalBusiness",
  "@id": ISLETME_ID,
  name: c.marka,
  alternateName: ["Bayramoğlu Su", c.resmiUnvan, "Celaliye Su Bayisi"],
  description: `Büyükçekmece'de ${c.kaynakSu} damacana, bardak su, pet su, pompa ve tüp gaz; hızlı teslimat.`,
  url: url("/"),
  telephone: c.telefon,
  email: c.eposta,
  image: [fotoUrl("damacana-kaynak"), fotoUrl("servis-araci"), fotoUrl("bayi-dukkan")],
  logo: url("/icon-512.png"),
  address: { "@type": "PostalAddress", streetAddress: c.adres.sokak, addressLocality: c.adres.ilce, addressRegion: c.adres.il, postalCode: c.adres.postaKodu, addressCountry: "TR" },
  geo: { "@type": "GeoCoordinates", latitude: c.konum.lat, longitude: c.konum.lng },
  hasMap: c.googleHaritaLinki,
  areaServed: [...BOLGELER.map((b) => ({ "@type": "Place", name: `${b.ad}, Büyükçekmece` })), { "@type": "City", name: "Büyükçekmece" }],
  sameAs: [c.instagram, c.googleHaritaLinki],
  contactPoint: [
    { "@type": "ContactPoint", telephone: c.telefon, contactType: "customer service", areaServed: "TR", availableLanguage: "Turkish", description: "Celaliye, Kamiloba · WhatsApp" },
    { "@type": "ContactPoint", telephone: c.ikinciTelefon, contactType: "customer service", areaServed: "TR", availableLanguage: "Turkish", description: "Kumburgaz, Küme Evler" },
    { "@type": "ContactPoint", telephone: c.sabitTelefon, contactType: "customer service", areaServed: "TR", availableLanguage: "Turkish", description: "Sabit hat, Celaliye ve Kamiloba" },
    { "@type": "ContactPoint", telephone: c.kumburgazSabitTelefon, contactType: "customer service", areaServed: "TR", availableLanguage: "Turkish", description: "Sabit hat, Kumburgaz ve Küme Evler" },
  ],
});
const kirintiSema = (liste) => ({
  "@type": "BreadcrumbList",
  itemListElement: [["Ana Sayfa", "/"], ...liste].map(([ad, yol], i) => ({ "@type": "ListItem", position: i + 1, name: ad, item: url(yol) })),
});
const sssSema = (liste) => ({ "@type": "FAQPage", mainEntity: liste.map(([s, y]) => ({ "@type": "Question", name: s, acceptedAnswer: { "@type": "Answer", text: y } })) });

// ---------- Sayfa iskeleti ----------
const sayfa = (p) => {
  const kanonik = url(p.yol);
  const graf = [isletmeSema(), ...(p.sema || [])];
  if (p.kirinti) graf.push(kirintiSema(p.kirinti));
  if (p.sss) graf.push(sssSema(p.sss));
  const ogResim = url(v("/og.jpg"));
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(p.baslik)}</title>
<meta name="description" content="${esc(p.aciklama)}">
<link rel="canonical" href="${kanonik}">
${p.noindex ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<meta name="theme-color" content="#0a3d6b">
<meta property="og:type" content="website">
<meta property="og:locale" content="tr_TR">
<meta property="og:site_name" content="${esc(c.marka)}">
<meta property="og:title" content="${esc(p.baslik)}">
<meta property="og:description" content="${esc(p.aciklama)}">
<meta property="og:url" content="${kanonik}">
<meta property="og:image" content="${ogResim}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
${c.googleDogrulama ? `<meta name="google-site-verification" content="${c.googleDogrulama}">` : ""}
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/font/plus-jakarta-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
${p.onYukle ? `<link rel="preload" as="image" href="${v(`/foto/${p.onYukle}-1200.webp`)}" imagesrcset="${FOTO[p.onYukle][0].map((x) => `${v(`/foto/${p.onYukle}-${x}.webp`)} ${x}w`).join(", ")}" imagesizes="(min-width: 960px) 50vw, 100vw" fetchpriority="high">` : ""}
<style>${CSS}</style>
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graf })}</script>
${c.ga4 ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${c.ga4}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${c.ga4}");</script>` : ""}
</head>
<body${p.govdeSinif ? ` class="${p.govdeSinif}"` : ""}>
<a class="atla" href="#icerik">İçeriğe geç</a>
${ustBar()}
${baslik(p.aktif)}
<main id="icerik">
${p.govde}
</main>
${altBilgi()}
${altCubuk(p.telefon)}
<script>${JS}</script>
</body>
</html>`;
};

// Alt sayfa başlığı
const sayfaBasi = ({ kirinti: k, ust, h1, h1Vurgu, giris, foto: f, fotoAlt, dugmeler = true, waMetin, tel = c.telefon, telGorunen = c.telefonGorunen }) => `
<section class="sayfa-bas${f ? " sayfa-bas-foto" : ""}"><div class="kap sayfa-bas-ic">
  <div class="sayfa-bas-metin">
    ${kirinti(k)}
    ${ust ? `<span class="ust-etiket">${ust}</span>` : ""}
    <h1>${esc(h1)}${h1Vurgu ? ` <span>${esc(h1Vurgu)}</span>` : ""}</h1>
    <p class="giris">${esc(giris)}</p>
    ${dugmeler ? `<div class="dugmeler">
      <a class="btn btn-wa btn-buyuk" href="${waLink(waMetin)}" target="_blank" rel="noopener" data-track="whatsapp">${WA_SVG}WhatsApp'tan sipariş</a>
      ${araDugmeleri("btn-cizgi", tel === c.ikinciTelefon ? "ikinci" : undefined)}
    </div>` : ""}
  </div>
  ${f ? `<div class="sayfa-bas-foto-kutu">${foto(f, fotoAlt, { oncelik: true, sizes: "(min-width: 960px) 44vw, 100vw" })}</div>` : ""}
</div></section>`;

// ---------- Sayfalar ----------
const sayfalar = [];

// Ana sayfa
sayfalar.push({
  yol: "/",
  baslik: "Büyükçekmece Su Bayisi ve Su Siparişi | Bayramoğlu",
  aciklama: `Büyükçekmece su bayisi: Mayadağ damacana su, bardak su, pet su ve tüp gaz. Celaliye, Kamiloba, Kumburgaz'a hızlı teslimat. ${c.tecrubeYil} yıllık sucu.`,
  onYukle: "damacana-kaynak",
  govdeSinif: "anasayfa",
  sema: [{ "@type": "WebSite", "@id": url("/#site"), name: c.marka, alternateName: "Büyükçekmece Su Siparişi", url: url("/"), inLanguage: "tr-TR", publisher: { "@id": ISLETME_ID } },
    { "@type": "WebPage", "@id": url("/#sayfa"), url: url("/"), name: "Büyükçekmece Su Siparişi", isPartOf: { "@id": url("/#site") }, about: { "@id": ISLETME_ID }, primaryImageOfPage: fotoUrl("damacana-kaynak"), dateModified: BUGUN }],
  sss: SSS_GENEL,
  govde: `
<section class="kahraman"><div class="kap kahraman-ic">
  <div class="kahraman-metin">
    <span class="rozet"><span class="nabiz" aria-hidden="true"></span>Celaliye'den ${c.tecrubeYil} yıldır · Hızlı teslimat</span>
    <h1>Büyükçekmece su ve tüp siparişi <span>en kısa sürede kapınızda.</span></h1>
    <p class="giris">Mayadağ 19 litre damacana, bardak su, 0,5 L ve 1,5 L pet su ve tüp gaz (Milangaz, Likitgaz, Ergaz). Ev ve iş yerinize hızlı, hijyenik ve güler yüzlü teslimat.</p>
    <div class="dugmeler">
      <a class="btn btn-wa btn-buyuk" href="#siparis" data-kaydir>${WA_SVG}Hemen sipariş ver</a>
      ${araDugmeleri("btn-cizgi")}
    </div>
    <a class="kahraman-puan" href="${c.googleHaritaLinki}" target="_blank" rel="noopener">${YILDIZLAR}<b>${c.googlePuan}</b><span>Google Haritalar'da müşteri puanı</span></a>
  </div>
  <div class="kahraman-gorsel">
    <div class="kahraman-foto">${foto("damacana-kaynak", "Doğal kaynak suyu ile dolu 19 litre damacana", { oncelik: true })}</div>
    <div class="yuzen yuzen-1">${ikon("kamyon")}<span><b>Hızlı teslimat</b><small>kapınıza kadar</small></span></div>
    <div class="yuzen yuzen-2">${ikon("damla")}<span><b>Mayadağ</b><small>Doğal Kaynak Suyu</small></span></div>
  </div>
</div>
<div class="kap">${guvenSeridi()}</div>
</section>

<section class="bolum" id="urunler"><div class="kap">
  <div class="bolum-bas bolum-bas-yan">
    <div><span class="ust-etiket">Ürünlerimiz</span><h2>Su ve tüp gaz, tek adresten</h2></div>
    <a class="bag" href="/hizmetlerimiz/">Tüm ürünler ${ikon("ok")}</a>
  </div>
  ${urunIzgara()}
</div></section>

${siparisFormu()}
${adimlar()}
${nedenBiz()}

<section class="bolum tup-bant"><div class="kap ikili">
  <div class="ikili-foto">${foto("tup-gaz-gercek", "12 kg mutfak tüpü", { sizes: "(min-width: 960px) 45vw, 100vw" })}</div>
  <div class="ikili-metin">
    <span class="ust-etiket">Tüp gaz · Milangaz · Likitgaz · Ergaz</span>
    <h2>Tüpünüz bitti mi? Suyunuzla birlikte gelsin.</h2>
    <p>Milangaz, Likitgaz ve Ergaz 12 kg mutfak tüpünü kapınıza getiriyoruz; damacana siparişinizle aynı teslimatta da gelebilir. İşletmeler için 24 kg ticari ve 45 kg sanayi tüpü, Milangaz LiftMax forklift tüpü ve Palmiye açık hava ısıtıcısı da bizde.</p>
    <div class="tup-linkler">
      <a href="/hizmetlerimiz/tup-gaz/">${ikon("alev")}Mutfak tüpü</a>
      <a href="/hizmetlerimiz/ticari-sanayi-tupu/">${ikon("bina")}Ticari / sanayi</a>
      <a href="/hizmetlerimiz/forklift-tupu/">${ikon("kamyon")}Forklift tüpü</a>
      <a href="/hizmetlerimiz/palmiye-isitici/">${ikon("alev")}Palmiye ısıtıcı</a>
    </div>
    <div class="dugmeler">
      <a class="btn btn-wa btn-buyuk" href="${waLink("Merhaba, tüp gaz siparişi vermek istiyorum. Tüp: 12 kg / Adres: ")}" target="_blank" rel="noopener" data-track="whatsapp_tup">${WA_SVG}WhatsApp'tan tüp iste</a>
      ${araDugmeleri("btn-cizgi")}
    </div>
  </div>
</div></section>

<section class="bolum"><div class="kap ikili">
  <div class="ikili-foto">${foto("servis-araci", "Bayramoğlu Su servis aracı: Mayadağ Doğal Kaynak Suyu", { sizes: "(min-width: 960px) 45vw, 100vw" })}</div>
  <div class="ikili-metin">
    <span class="ust-etiket">Ofis ve işyerleri</span>
    <h2>İşletmenizin suyu hiç bitmesin</h2>
    <p>Ofis, kafe, market, okul ya da atölye… Haftalık damacana ihtiyacınızı ve bardak-pet su tüketiminizi söyleyin, teslim gününü birlikte planlayalım. Her seferinde yeniden aramanıza gerek kalmaz.</p>
    <ul class="tik-liste"><li>Haftalık veya iki haftalık düzenli teslimat</li><li>Toplantı ve misafirler için bardak su</li><li>Etkinlik ve organizasyonlar için toplu pet su</li></ul>
    <a class="btn btn-ana" href="/hizmetlerimiz/ofis-isyeri-su-servisi/">Kurumsal su servisi ${ikon("ok")}</a>
  </div>
</div></section>

${yorumlar()}

<section class="bolum bolum-acik" id="bolgeler"><div class="kap ikili ikili-ters">
  <div class="ikili-metin">
    <span class="ust-etiket">Hizmet bölgeleri</span>
    <h2>Büyükçekmece'de teslimat yaptığımız yerler</h2>
    <p>Büyükçekmece'de size en yakın damacana su bayisi arıyorsanız: bayimiz Celaliye, Uludere Sokak'ta. Buradan Celaliye, Kamiloba, Kumburgaz ve Büyükçekmece'nin çevre mahallelerine her gün servis çıkıyor. Mahalleniz listede yoksa arayın, hemen söyleyelim.</p>
    ${bolgeKartlari()}
  </div>
  <div>${haritaBlok()}</div>
</div></section>

${sssBlok(SSS_GENEL)}
${cagri()}
`,
});

// Ürünler / hizmetler
sayfalar.push({
  yol: "/hizmetlerimiz/",
  aktif: "/hizmetlerimiz/",
  baslik: "Ürünler | Damacana, Pet Su, Bardak Su ve Tüp Gaz",
  aciklama: "Mayadağ 19 L damacana, bardak su, 0,5 L ve 1,5 L pet su, pompa ve tüp gaz. Büyükçekmece'ye hızlı teslimat. Bayramoğlu Su Bayisi.",
  kirinti: [["Ürünler", "/hizmetlerimiz/"]],
  govde: `
${sayfaBasi({ kirinti: [["Ürünler", "/hizmetlerimiz/"]], ust: "Ürünler ve hizmetler", h1: "Büyükçekmece su siparişi", h1Vurgu: "ne lazımsa, kapınızda.", giris: `${c.kaynakSu} 19 litre damacana, bardak su, 0,5 L ve 1,5 L pet su, damacana pompası ve Milangaz, Likitgaz ve Ergaz tüp gaz. Ev, ofis ve işletmeler için tek adresten.` })}
<section class="bolum bolum-sikisik"><div class="kap">${urunIzgara()}</div></section>
<section class="bolum bolum-acik"><div class="kap ikili">
  <div class="ikili-foto">${foto("hijyenik-dolum", "Dolum tesisinde kapaklanmış damacanalar", { sizes: "(min-width: 960px) 45vw, 100vw" })}</div>
  <div class="ikili-metin">
    <span class="ust-etiket">Kalite</span>
    <h2>Dolumdan kapınıza, temiz ve kapalı</h2>
    <p>Damacanalarımız dolum tesisinde el değmeden doldurulur, kapaklanır ve etiketlenir. Deposundan aracına, aracından kapınıza kadar kapalı ve temiz şekilde taşınır.</p>
    <a class="btn btn-ana" href="/hizmetlerimiz/ofis-isyeri-su-servisi/">İşletmeler için ${ikon("ok")}</a>
  </div>
</div></section>
${siparisFormu({ ust: "Sipariş", baslikMetni: "Seçin, gönderin, gelsin" })}
${cagri()}`,
});

// Ürün sayfaları
const tupRehberBlok = () => `
<section class="bolum bolum-acik" id="tup-cesitleri"><div class="kap">
  <div class="bolum-bas"><span class="ust-etiket">Tüp rehberi</span><h2>Hangi tüp size uygun?</h2><p>Milangaz, Likitgaz ve Ergaz tüplerinden ihtiyacınıza uygun olanı seçin. Marka ve stok durumu için arayın ya da WhatsApp'tan yazın.</p></div>
  <div class="tup-rehber">${TUP_REHBER.map(([ad, acik, link]) => `<${link ? `a href="${link}"` : "div"} class="tup-kart">${ikon("alev")}<b>${esc(ad)}</b><span>${esc(acik)}</span>${link ? `<em>İncele ${ikon("ok")}</em>` : ""}</${link ? "a" : "div"}>`).join("")}</div>
</div></section>`;

const TUM_URUN_SAYFALARI = [...URUNLER, ...TUP_EK.map((u) => ({ ...u, tupEk: true }))];
for (const u of TUM_URUN_SAYFALARI) {
  const yol = `/hizmetlerimiz/${u.slug}/`;
  const k = u.tupEk ? [["Ürünler", "/hizmetlerimiz/"], ["Tüp Gaz", "/hizmetlerimiz/tup-gaz/"], [u.ad, yol]] : [["Ürünler", "/hizmetlerimiz/"], [u.ad, yol]];
  const waMetin = u.waMetin || `Merhaba, ${u.kisaAd} siparişi vermek istiyorum. Adet: `;
  const tupSayfasi = u.tupEk || u.id === "tup";
  sayfalar.push({
    yol, aktif: tupSayfasi ? "/hizmetlerimiz/tup-gaz/" : "/hizmetlerimiz/", baslik: u.baslik, aciklama: u.aciklama, kirinti: k, sss: u.sss, onYukle: null,
    sema: [{ "@type": "Service", name: u.ad, serviceType: u.hizmetTuru || "Su teslimatı", description: u.ozet, provider: { "@id": ISLETME_ID }, areaServed: BOLGELER.map((b) => `${b.ad}, Büyükçekmece`), image: fotoUrl(u.foto), url: url(yol) }],
    govde: `
${sayfaBasi({ kirinti: k, ust: tupSayfasi ? (u.id === "tup" ? "Tüp gaz · Milangaz · Likitgaz · Ergaz" : `Tüp gaz · ${u.marka || "Milangaz"}`) : "Ürün", h1: u.h1, h1Vurgu: u.h1Vurgu, giris: u.giris, foto: u.foto, fotoAlt: u.fotoAlt, waMetin })}
<section class="bolum bolum-sikisik"><div class="kap"><h2 class="gizli">Öne çıkanlar</h2><div class="ozellikler ozellikler-4">${u.maddeler.map(([ik, b, p]) => `<div class="ozellik">${ikon(ik)}<h3>${esc(b)}</h3><p>${esc(p)}</p></div>`).join("")}</div></div></section>
${u.hesaplayici ? `
<section class="bolum bolum-acik"><div class="kap ikili">
  <div class="ikili-metin">
    <span class="ust-etiket">Hesaplayıcı</span>
    <h2>Bir damacana size kaç gün yeter?</h2>
    <p>Kişi başı günde yaklaşık 2 litre içme ve yemek suyu varsayımıyla hesaplanır. Çay, kahve ve yemekte kullanım arttıkça süre kısalır.</p>
  </div>
  <div class="hesap" id="hesap">
    <label for="kisi">Evde kaç kişi yaşıyor? <output id="kisiDeger">3</output></label>
    <input type="range" id="kisi" min="1" max="8" value="3">
    <div class="hesap-sonuc"><div><b id="gunSonuc">~3 gün</b><span>bir damacana yeter</span></div><div><b id="haftaSonuc">~2–3</b><span>damacana / hafta</span></div></div>
    <button type="button" class="btn btn-ana btn-blok" id="hesapEkle">${ikon("tekrar")}Düzenli teslimat planla</button>
  </div>
</div></section>` : ""}
${u.tupRehber ? tupRehberBlok() : ""}
${u.adimlar ? `
<section class="bolum"><div class="kap ikili">
  <div class="ikili-metin">
    <span class="ust-etiket">Adım adım</span>
    <h2>Mutfak tüpü nasıl değiştirilir?</h2>
    <p>Tüpü biz getiriyoruz, takmak birkaç dakikanızı alır. Emin olamazsanız teslimatta sorun.</p>
  </div>
  <ol class="adim-liste">${u.adimlar.map((a) => `<li>${esc(a)}</li>`).join("")}</ol>
</div></section>` : ""}
<section class="bolum${u.adimlar ? " bolum-acik" : ""}"><div class="kap kap-dar metin-blok">
  ${u.bolumler.map(([b, p]) => `<h2>${esc(b)}</h2><p>${esc(p)}</p>`).join("")}
</div></section>
${siparisFormu({ urun: u.formUrun || u.id, varyant: u.varyant || "", ust: "Sipariş", baslikMetni: `${u.ad} siparişi` })}
${u.tupEk ? `
<section class="bolum bolum-acik"><div class="kap">
  <div class="bolum-bas"><span class="ust-etiket">Tüp gaz</span><h2>Diğer tüp çözümleri</h2></div>
  <div class="bolge-izgara">${[URUNLER.find((x) => x.id === "tup"), ...TUP_EK].filter((x) => x.slug !== u.slug).map((x) => `<a class="bolge-kart" href="/hizmetlerimiz/${x.slug}/">${ikon("alev")}<span><b>${esc(x.ad)}</b><small>${x.id === "tup" ? "Milangaz · Likitgaz · Ergaz" : x.marka || "Milangaz"}</small></span>${ikon("ok", "ok-ik")}</a>`).join("")}</div>
</div></section>` : `
<section class="bolum bolum-acik"><div class="kap">
  <div class="bolum-bas"><span class="ust-etiket">Diğer ürünler</span><h2>Siparişinize ekleyin</h2></div>
  ${urunIzgara(u.id)}
</div></section>`}
${sssBlok(u.sss)}
${cagri()}`,
  });
}

// Kurumsal
{
  const yol = "/hizmetlerimiz/ofis-isyeri-su-servisi/";
  const k = [["Ürünler", "/hizmetlerimiz/"], ["Ofis ve İşyeri Su Servisi", yol]];
  const sss = [
    ["Düzenli teslimat nasıl çalışıyor?", "Haftalık damacana ve bardak-pet su ihtiyacınızı söylersiniz; teslim gününü birlikte belirleriz. Her hafta aynı gün suyunuz gelir, ihtiyacınız değişirse bir mesajla güncelleriz."],
    ["Fatura ve ödeme nasıl oluyor?", "Kurumsal siparişlerde fatura ve ödeme detaylarını sipariş sırasında telefonda ya da WhatsApp'ta birlikte netleştiriyoruz."],
    ["Etkinlik için acil su lazım, yetişir mi?", "En kısa sürede teslim ediyoruz. Miktar ve saat bilgisini ne kadar erken iletirseniz planlama o kadar kolay olur."],
  ];
  sayfalar.push({
    yol, aktif: yol, kirinti: k, sss,
    baslik: "Ofis ve İşyeri Su Servisi | Büyükçekmece Düzenli Teslimat",
    aciklama: "Büyükçekmece'de ofis, kafe, market ve okullara düzenli damacana, bardak su ve pet su teslimatı. Haftalık plan, hızlı teslimat, tek telefonla.",
    sema: [{ "@type": "Service", name: "Ofis ve işyeri su servisi", serviceType: "Kurumsal su teslimatı", provider: { "@id": ISLETME_ID }, areaServed: "Büyükçekmece", url: url(yol) }],
    govde: `
${sayfaBasi({ kirinti: k, ust: "Kurumsal", h1: "Ofis ve işyeri su servisi", h1Vurgu: "suyunuz hiç bitmesin.", giris: "Ofis, kafe, market, okul, atölye ve sağlık kuruluşları için düzenli damacana, bardak su ve pet su teslimatı. İhtiyacınızı bir kez söyleyin, gerisini biz takip edelim.", foto: "servis-araci", fotoAlt: "Bayramoğlu Su servis aracı", waMetin: "Merhaba, işyerimiz için düzenli su teslimatı istiyoruz. Firma / adres: " })}
<section class="bolum bolum-sikisik"><div class="kap"><h2 class="gizli">Öne çıkanlar</h2><div class="ozellikler ozellikler-4">
  ${[["tekrar", "Haftalık plan", "Sabit gün ve miktar; kimsenin su takibi yapmasına gerek kalmaz."], ["kamyon", "Acil ek sipariş", "Beklenmedik ihtiyaçta en kısa sürede ek teslimat."], ["bina", "Her ölçekte işletme", "Tek kişilik ofisten kalabalık iş yerine kadar."], ["takvim", "Etkinlik desteği", "Toplantı, açılış ve organizasyonlar için bardak ve pet su."]].map(([ik, b, p]) => `<div class="ozellik">${ikon(ik)}<h3>${b}</h3><p>${p}</p></div>`).join("")}
</div></div></section>
<section class="bolum bolum-acik"><div class="kap ikili">
  <div class="ikili-metin">
    <span class="ust-etiket">Nasıl başlarız?</span>
    <h2>İki mesajda düzenli teslimat</h2>
    <ol class="numarali">
      <li><b>Bize yazın:</b> firma adı, adres ve kabaca haftalık tüketiminiz (kaç damacana, bardak/pet su).</li>
      <li><b>Günü seçin:</b> haftanın hangi günü teslim istediğinizi söyleyin.</li>
      <li><b>Hepsi bu:</b> her hafta suyunuz gelir; değişiklik için tek mesaj yeter.</li>
    </ol>
    <a class="btn btn-wa btn-buyuk" href="${waLink("Merhaba, işyerimiz için düzenli su teslimatı istiyoruz.\nFirma: \nAdres: \nHaftalık ihtiyaç: ")}" target="_blank" rel="noopener" data-track="whatsapp">${WA_SVG}Kurumsal teklif iste</a>
    <p class="kucuk-not">Toptan alım mı düşünüyorsunuz? <a href="/toptan-su-tedarikcisi/">Toptan su tedarikçisi sayfamıza</a> göz atın.</p>
  </div>
  <div class="ikili-foto">${foto("baharlife-bardak-su", "Bardak su kolileri", { sizes: "(min-width: 960px) 45vw, 100vw" })}</div>
</div></section>
<section class="bolum"><div class="kap">
  <div class="bolum-bas"><span class="ust-etiket">Ürünler</span><h2>İşletmeler için ürünler</h2></div>
  ${urunIzgara()}
</div></section>
${sssBlok(sss)}
${cagri("İşletmeniz için düzenli su planlayalım.", "Tek mesajla başlayın; her hafta belirlediğimiz gün kapınızda.")}`,
  });
}

// Bölge hub
sayfalar.push({
  yol: "/hizmet-bolgeleri/",
  aktif: "/hizmet-bolgeleri/",
  kirinti: [["Hizmet Bölgeleri", "/hizmet-bolgeleri/"]],
  baslik: "Hizmet Bölgeleri | Büyükçekmece Su Bayisi ve Teslimat",
  aciklama: "Bayramoğlu Su Bayisi'nin su teslimatı yaptığı bölgeler: Celaliye, Kamiloba, Kumburgaz ve Büyükçekmece çevresi. Mahallenizi seçin, siparişinizi verin.",
  govde: `
${sayfaBasi({ kirinti: [["Hizmet Bölgeleri", "/hizmet-bolgeleri/"]], ust: "Hizmet bölgeleri", h1: "Büyükçekmece'de su teslimatı", h1Vurgu: "mahallenizi seçin.", giris: "Size en yakın su bayisi: Celaliye, Uludere Sokak'taki bayimiz. Buradan Celaliye, Kamiloba, Kumburgaz ve Büyükçekmece'nin çevre mahallelerine her gün servis çıkıyor." })}
<section class="bolum bolum-sikisik"><div class="kap ikili">
  <div class="ikili-metin">
    ${bolgeKartlari()}
    <p class="kucuk-not">Mahalleniz listede yok mu? <a href="tel:${c.telefon}">${c.telefonGorunen}</a> (Celaliye · Kamiloba) ya da <a href="tel:${c.ikinciTelefon}">${c.ikinciTelefonGorunen}</a> (Kumburgaz · Küme Evler) numarasını arayın, teslimat yapıp yapamadığımızı hemen söyleyelim.</p>
  </div>
  <div>${haritaBlok()}</div>
</div></section>
${siparisFormu()}
${cagri()}`,
});

// Bölge sayfaları
for (const b of BOLGELER) {
  const yol = `/${b.slug}/`;
  const k = [["Hizmet Bölgeleri", "/hizmet-bolgeleri/"], [`${b.ad} Su Siparişi`, yol]];
  const sss = [
    [`${b.ad}'${b.ek.e} ne kadar sürede teslimat yapıyorsunuz?`, `${b.ad} siparişlerini en kısa sürede kapınıza getiriyoruz. Belirli bir saat istiyorsanız siparişte belirtin.`],
    [`${b.ad}'${b.ek.de} hangi ürünleri getiriyorsunuz?`, `${c.kaynakSu} 19 L damacana, bardak su, 0,5 L ve 1,5 L pet su, damacana pompası ve Milangaz, Likitgaz ve Ergaz tüp gaz.`],
    [`${b.ad}'${b.ek.e} tüp gaz getiriyor musunuz?`, `Evet. Milangaz, Likitgaz ve Ergaz 12 kg mutfak tüpünü ${b.ad}'${b.ek.e} kapıya getiriyoruz; su siparişinizle aynı teslimatta da gelebilir. İşletmeler için ticari, sanayi ve forklift tüpü de sağlıyoruz.`],
    [`${b.ad}'${b.ek.de} düzenli teslimat alabilir miyim?`, "Evet. Haftalık ya da iki haftada bir düzenli teslimat planlayabiliriz; her seferinde yeniden sipariş vermenize gerek kalmaz."],
  ];
  sayfalar.push({
    yol, aktif: "/hizmet-bolgeleri/", kirinti: k, sss, baslik: b.baslik, aciklama: b.aciklama, telefon: b.telefon === "ikinci" ? c.ikinciTelefon : undefined,
    sema: [{ "@type": "Service", name: `${b.ad} su ve tüp gaz siparişi`, serviceType: "Su ve tüp gaz teslimatı", provider: { "@id": ISLETME_ID }, areaServed: { "@type": "Place", name: `${b.ad}, Büyükçekmece, İstanbul` }, url: url(yol) }],
    govde: `
${sayfaBasi({ kirinti: k, ust: `${b.ad} · Büyükçekmece`, h1: `${b.ad} su bayisi`, h1Vurgu: "su ve tüp gaz, en kısa sürede kapınızda.", giris: b.giris, foto: "damacana-kaynak", fotoAlt: `${b.ad} için 19 litre damacana su`, waMetin: `Merhaba, ${b.ad}'${b.ek.de}n su siparişi vermek istiyorum. Adres: `, ...(b.telefon === "ikinci" ? { tel: c.ikinciTelefon, telGorunen: c.ikinciTelefonGorunen } : {}) })}
<section class="bolum bolum-sikisik"><div class="kap kap-dar metin-blok">
  ${b.paragraflar.map((p) => `<p>${esc(p)}</p>`).join("")}
</div></section>
${siparisFormu({ mahalle: b.ad, ust: b.ad, baslikMetni: `${b.ad} su siparişi: 30 saniyede hazırlayın`, ...(b.telefon === "ikinci" ? { tel: c.ikinciTelefon, telGorunen: c.ikinciTelefonGorunen } : {}) })}
<section class="bolum bolum-acik"><div class="kap">
  <div class="bolum-bas"><span class="ust-etiket">Ürünler</span><h2>${b.ad}'${b.ek.e} getirdiğimiz ürünler</h2></div>
  ${urunIzgara()}
</div></section>
${sssBlok(sss)}
<section class="bolum bolum-sikisik"><div class="kap">
  <div class="bolum-bas"><span class="ust-etiket">Diğer bölgeler</span><h2>Çevre mahallelere de geliyoruz</h2></div>
  ${bolgeKartlari(b.slug)}
</div></section>
${cagri(`${b.ad}'${b.ek.de} suyunuz bitmeden arayın.`, undefined, b.telefon === "ikinci" ? [c.ikinciTelefon, c.ikinciTelefonGorunen] : undefined)}`,
  });
}

// Sipariş sayfası (reklam ve paylaşım için doğrudan hedef)
sayfalar.push({
  yol: "/siparis/",
  kirinti: [["Sipariş", "/siparis/"]],
  baslik: "Online Su Siparişi | Bayramoğlu Su Bayisi Büyükçekmece",
  aciklama: "Damacana, tüp gaz, bardak ve pet su siparişinizi 30 saniyede hazırlayın, WhatsApp'tan gönderin. Büyükçekmece'de hızlı kapıya teslimat.",
  govde: `
${sayfaBasi({ kirinti: [["Sipariş", "/siparis/"]], ust: "Online sipariş", h1: "Su siparişi ver", h1Vurgu: "30 saniyede hazır.", giris: "Ürünleri ve adresinizi seçin; siparişiniz hazır bir WhatsApp mesajına dönüşsün. İsterseniz doğrudan arayın.", dugmeler: false })}
${siparisFormu({ ust: "3 adım", baslikMetni: "Siparişiniz" })}
${adimlar()}
${cagri()}`,
});

// Toptan su tedarikçisi: toptan / perakende ve tedarikçi aramaları için
{
  const yol = "/toptan-su-tedarikcisi/";
  const k = [["Toptan Su Tedarikçisi", yol]];
  const sss = [
    ["Hem toptan hem perakende satış yapıyor musunuz?", "Evet. Eviniz için tek damacana da, işletmeniz için koli koli bardak ve pet su da alabilirsiniz."],
    ["Toptan fiyat nasıl belirleniyor?", "Miktar, ürün ve teslim sıklığına göre değişir. İhtiyacınızı WhatsApp'tan yazın ya da arayın, size özel fiyatı iletelim."],
    ["Fatura kesiyor musunuz?", "Kurumsal ve toptan siparişlerde fatura ve ödeme detaylarını sipariş sırasında birlikte netleştiriyoruz."],
    ["Düzenli tedarik planlayabilir miyiz?", "Evet. Haftalık ya da aylık tüketiminize göre sabit gün ve miktarla teslimat planlıyoruz; stok takibini biz yaparız."],
  ];
  const kalemler = [
    ["damla", "Damacana su tedarikçisi", "Mayadağ 19 L doğal kaynak suyu; ofis, okul, fabrika ve yurtlara düzenli damacana teslimatı.", "/hizmetlerimiz/19-litre-damacana-su/"],
    ["bina", "Bardak su tedarikçisi", "Toplantı, kafe, düğün ve organizasyonlar için koli koli bardak su.", "/hizmetlerimiz/bardak-su/"],
    ["canta", "Pet şişe su tedarikçisi", "0,5 L ve 1,5 L pet şişe su; market, büfe, spor salonu ve etkinliklere paket paket.", "/hizmetlerimiz/pet-su/"],
    ["el", "Damacana su pompası tedarikçisi", "Manuel ve şarjlı damacana pompaları; tek adet ya da toplu.", "/hizmetlerimiz/damacana-su-pompasi/"],
  ];
  sayfalar.push({
    yol, aktif: "/hizmetlerimiz/ofis-isyeri-su-servisi/", kirinti: k, sss,
    baslik: "Toptan Su Tedarikçisi Büyükçekmece | Damacana, Pet",
    aciklama: "Büyükçekmece'de toptan ve perakende su satış yeri: damacana su, bardak su, pet şişe su ve damacana pompası tedarikçisi. İşletmelere düzenli teslimat.",
    sema: [{ "@type": "Service", name: "Toptan su tedariki", serviceType: "Toptan ve perakende su satışı", provider: { "@id": ISLETME_ID }, areaServed: "Büyükçekmece", url: url(yol) }],
    govde: `
${sayfaBasi({ kirinti: k, ust: "Toptan ve perakende", h1: "Toptan su tedarikçisi", h1Vurgu: "damacana, bardak ve pet su.", giris: "Büyükçekmece'de toptan ve perakende su satış yeri arıyorsanız doğru yerdesiniz. Tek damacanadan koli koli bardak ve pet suya kadar; işletmenizin su tedarikçisi olalım.", foto: "servis-araci", fotoAlt: "Bayramoğlu Su servis aracı", waMetin: "Merhaba, toptan su almak istiyoruz. Firma / ürün / miktar: " })}
<section class="bolum bolum-sikisik"><div class="kap">
  <div class="bolum-bas"><span class="ust-etiket">Ne tedarik ediyoruz?</span><h2>İşletmenizin ihtiyacı olan her şey</h2></div>
  <div class="tup-rehber">${kalemler.map(([ik, b, p, l]) => `<a href="${l}" class="tup-kart">${ikon(ik)}<b>${b}</b><span>${p}</span><em>İncele ${ikon("ok")}</em></a>`).join("")}<a href="/hizmetlerimiz/tup-gaz/" class="tup-kart">${ikon("alev")}<b>Tüp gaz</b><span>Milangaz, Likitgaz ve Ergaz mutfak, ticari ve sanayi tüpü; forklift tüpü, dedantör ve kamp ocağı.</span><em>İncele ${ikon("ok")}</em></a></div>
</div></section>
<section class="bolum bolum-acik"><div class="kap ikili">
  <div class="ikili-metin">
    <span class="ust-etiket">Nasıl çalışıyoruz?</span>
    <h2>Toptan alımda üç adım</h2>
    <ol class="numarali">
      <li><b>İhtiyacınızı yazın:</b> ürün, yaklaşık miktar ve teslim adresi.</li>
      <li><b>Fiyat ve planı netleştirelim:</b> miktara göre fiyat ve teslim günü.</li>
      <li><b>Düzenli teslim:</b> belirlediğimiz günlerde kapınızda; değişiklik için tek mesaj yeter.</li>
    </ol>
    <a class="btn btn-wa btn-buyuk" href="${waLink("Merhaba, toptan su almak istiyoruz.\nFirma: \nÜrün / miktar: \nAdres: ")}" target="_blank" rel="noopener" data-track="whatsapp_toptan">${WA_SVG}Toptan fiyat iste</a>
  </div>
  <div class="ikili-foto">${foto("bayi-dukkan", "Bayramoğlu Ticaret bayisi ve damacana stoğu", { sizes: "(min-width: 960px) 45vw, 100vw" })}</div>
</div></section>
${sssBlok(sss)}
${cagri("İşletmeniz için su tedarikçisi mi arıyorsunuz?", "Toptan ve perakende; tek mesajla başlayın.")}`,
  });
}

// Hakkımızda
sayfalar.push({
  yol: "/hakkimizda/",
  aktif: "/hakkimizda/",
  kirinti: [["Hakkımızda", "/hakkimizda/"]],
  baslik: "Hakkımızda | 25 Yıllık Büyükçekmece Su Bayisi",
  aciklama: `Bayramoğlu Su Bayisi ${c.tecrubeYil} yıldır Celaliye'den Büyükçekmece'ye ${c.kaynakSu} dağıtıyor. Hikâyemiz, çalışma şeklimiz ve değerlerimiz.`,
  sema: [{ "@type": "AboutPage", name: "Hakkımızda", url: url("/hakkimizda/"), about: { "@id": ISLETME_ID } }],
  govde: `
${sayfaBasi({ kirinti: [["Hakkımızda", "/hakkimizda/"]], ust: "Hakkımızda", h1: `${c.tecrubeYil} yıldır Büyükçekmece'nin`, h1Vurgu: "su bayisiyiz.", giris: `Bayramoğlu Su Bayisi, ${c.tecrubeYil} yılı aşkın süredir Celaliye'den Büyükçekmece'ye su taşıyan yerel bir su bayisi. Mahallede herkesin bildiği, kapısını çaldığı sucu.`, foto: "dogal-kaynak-suyu", fotoAlt: "Doğada kaynak suyu damacanası" })}
<section class="bolum bolum-sikisik"><div class="kap">${guvenSeridi()}</div></section>
<section class="bolum bolum-sikisik"><div class="kap ikili">
  <div class="ikili-foto">${foto("servis-araci", "Bayramoğlu Su servis aracı: Mayadağ Doğal Kaynak Suyu", { sizes: "(min-width: 960px) 45vw, 100vw" })}</div>
  <div class="ikili-metin">
    <span class="ust-etiket">Nasıl çalışıyoruz?</span>
    <h2>Bayiden kapınıza, en kısa sürede</h2>
    <p>Her gün Celaliye, Uludere Sokak'taki bayimizden servis aracımızla mahallelere çıkıyoruz. Telefon ve WhatsApp'tan gelen siparişler servis planına eklenir, en kısa sürede kapınıza teslim edilir.</p>
    <p>${esc(c.kaynakSu)} dağıtıyoruz; su, Çatalca Kalfaköy'deki kaynaktan geliyor. Damacanalar dolum tesisinde el değmeden doldurulur ve kapaklanır; bizim işimiz onları kapalı ve temiz şekilde, zamanında size ulaştırmak. Tüp gazınızı da aynı teslimatta getirebiliyoruz.</p>
  </div>
</div></section>
<section class="bolum bolum-sikisik"><div class="kap">
  <figure class="genis-foto">${foto("bayi-dukkan", "Bayramoğlu Ticaret bayisi, Celaliye Uludere Sokak: Mayadağ afişleri ve damacanalar", { sizes: "(min-width: 1200px) 1160px, 100vw" })}<figcaption>${ikon("pin")}Bayimiz: ${esc(adresSatiri)}</figcaption></figure>
</div></section>
<section class="bolum bolum-sikisik"><div class="kap kap-dar metin-blok">
  <h2>Neye önem veriyoruz?</h2>
  <ul class="tik-liste">
    <li><b>Söz verdiğimiz saatte gelmek.</b> Su, bittiği an lazım olan bir şey; gecikmeyi sevmeyiz.</li>
    <li><b>Temizlik.</b> Damacanalar kapalı ve etiketli taşınır, açıkta bekletilmez.</li>
    <li><b>Güler yüz.</b> Yıllardır bizimle çalışan müşterilerimizi komşumuz gibi görüyoruz.</li>
  </ul>
</div></section>
${yorumlar()}
${cagri()}`,
});

// SSS
{
  const liste = [...SSS_GENEL, ...SSS_EK];
  sayfalar.push({
    yol: "/sikca-sorulan-sorular/",
    aktif: "/sikca-sorulan-sorular/",
    kirinti: [["Sıkça Sorulan Sorular", "/sikca-sorulan-sorular/"]],
    sss: liste,
    baslik: "Sıkça Sorulan Sorular | Su Siparişi ve Teslimat",
    aciklama: "Su ve tüp gaz siparişi, teslimat süresi, hizmet bölgeleri, düzenli teslimat, damacana saklama ve pompa hakkında merak ettikleriniz.",
    govde: `
${sayfaBasi({ kirinti: [["Sıkça Sorulan Sorular", "/sikca-sorulan-sorular/"]], ust: "Yardım", h1: "Sıkça sorulan sorular", giris: "Sipariş, teslimat ve ürünlerle ilgili en çok sorulanlar. Cevabını bulamadığınız bir şey olursa arayın ya da WhatsApp'tan yazın." })}
${sssBlok(liste, "Merak ettikleriniz", "SSS")}
${cagri("Başka bir sorunuz mu var?", "Arayın ya da WhatsApp'tan yazın; hemen cevaplayalım.")}`,
  });
}

// İletişim
sayfalar.push({
  yol: "/iletisim/",
  aktif: "/iletisim/",
  kirinti: [["İletişim", "/iletisim/"]],
  baslik: "İletişim | Bayramoğlu Su Bayisi Celaliye, Büyükçekmece",
  aciklama: `Bayramoğlu Su Bayisi iletişim: ${c.telefonGorunen} (WhatsApp) · ${c.ikinciTelefonGorunen} · ${c.sabitTelefonGorunen}. Adres: ${c.adres.mahalle}, ${c.adres.sokak}, Büyükçekmece.`,
  sema: [{ "@type": "ContactPage", name: "İletişim", url: url("/iletisim/"), about: { "@id": ISLETME_ID } }],
  govde: `
${sayfaBasi({ kirinti: [["İletişim", "/iletisim/"]], ust: "İletişim", h1: "Bize ulaşın", giris: "Sipariş, soru ya da kurumsal talep için en hızlı yol telefon ve WhatsApp. Bayimize uğramak isterseniz adresimiz aşağıda.", dugmeler: false })}
<section class="bolum bolum-sikisik"><div class="kap">
  <div class="iletisim-kartlar">
    <a class="iletisim-kart" href="tel:${c.telefon}" data-track="call">${ikon("tel")}<small>Celaliye · Kamiloba</small><b>${c.telefonGorunen}</b></a>
    <a class="iletisim-kart iletisim-wa" href="${waLink()}" target="_blank" rel="noopener" data-track="whatsapp">${WA_SVG}<small>WhatsApp</small><b>${c.telefonGorunen}</b></a>
    <a class="iletisim-kart" href="tel:${c.ikinciTelefon}" data-track="call">${ikon("tel")}<small>Kumburgaz · Küme Evler</small><b>${c.ikinciTelefonGorunen}</b></a>
    <a class="iletisim-kart" href="tel:${c.sabitTelefon}" data-track="call">${ikon("tel")}<small>Sabit · Celaliye, Kamiloba</small><b>${c.sabitTelefonGorunen}</b></a>
    <a class="iletisim-kart" href="tel:${c.kumburgazSabitTelefon}" data-track="call">${ikon("tel")}<small>Sabit · Kumburgaz, Küme Evler</small><b>${c.kumburgazSabitTelefonGorunen}</b></a>
  </div>
</div></section>
<section class="bolum bolum-sikisik"><div class="kap ikili">
  <div class="ikili-metin">
    <span class="ust-etiket">Adres</span>
    <h2>Bayimiz Celaliye'de</h2>
    <address>${esc(c.marka)} · ${esc(c.resmiUnvan)}<br>${esc(c.adres.mahalle)} Mah., ${esc(c.adres.sokak)}<br>${c.adres.postaKodu} ${esc(c.adres.ilce)} / ${esc(c.adres.il)}<br><a href="mailto:${c.eposta}">${c.eposta}</a></address>
    <div class="dugmeler">
      <a class="btn btn-ana" href="${yolTarifi}" target="_blank" rel="noopener">${ikon("yol")}Yol tarifi al</a>
      <a class="btn btn-cizgi" href="${c.instagram}" target="_blank" rel="noopener">${ikon("ig")}Instagram</a>
    </div>
    <figure class="genis-foto genis-foto-kucuk">${foto("bayi-dukkan", "Bayramoğlu Ticaret bayisinin önü, Celaliye", { sizes: "(min-width: 960px) 45vw, 100vw" })}</figure>
  </div>
  <div>${haritaBlok()}</div>
</div></section>
${siparisFormu()}`,
});

// Gizlilik
sayfalar.push({
  yol: "/gizlilik/",
  kirinti: [["Gizlilik", "/gizlilik/"]],
  baslik: "Gizlilik ve Kişisel Veriler | Bayramoğlu Su Bayisi",
  aciklama: "Bayramoğlu Su Bayisi web sitesinde kişisel verilerin nasıl işlendiği: sipariş formu, WhatsApp, tarayıcıda saklanan adres bilgisi ve iletişim.",
  govde: `
${sayfaBasi({ kirinti: [["Gizlilik", "/gizlilik/"]], h1: "Gizlilik ve kişisel veriler", giris: "Bu sayfa, sitemizi kullanırken bilgilerinizin nasıl işlendiğini sade bir dille anlatır.", dugmeler: false })}
<section class="bolum bolum-sikisik"><div class="kap kap-dar metin-blok">
  <h2>Sipariş formu</h2>
  <p>Sitedeki sipariş formu bilgilerinizi sunucumuza göndermez ve kaydetmez. Formu doldurduğunuzda tarayıcınızda bir WhatsApp mesajı hazırlanır; mesajı göndermek sizin onayınızla, WhatsApp üzerinden olur. Gönderdiğiniz mesajdaki ad, adres ve telefon bilgileri yalnızca siparişinizi teslim etmek için kullanılır.</p>
  <h2>Cihazınızda saklanan bilgi</h2>
  <p>"Adresimi bu cihazda hatırla" kutusunu işaretlerseniz adresiniz yalnızca kendi tarayıcınızda (yerel depolama) saklanır; bize ya da üçüncü kişilere gönderilmez. Kutunun işaretini kaldırdığınızda silinir.</p>
  ${c.ga4 ? "<h2>Ziyaret istatistikleri</h2><p>Sitenin nasıl kullanıldığını anlamak için Google Analytics kullanıyoruz. Bu araç çerez kullanabilir; tarayıcı ayarlarınızdan çerezleri engelleyebilirsiniz.</p>" : ""}
  <h2>İletişim</h2>
  <p>Kişisel verilerinizle ilgili her türlü talep için <a href="tel:${c.telefon}">${c.telefonGorunen}</a> numarasından ya da <a href="mailto:${c.eposta}">${c.eposta}</a> adresinden bize ulaşabilirsiniz.</p>
</div></section>`,
});

// 404
const sayfa404 = {
  yol: "/404", noindex: true,
  baslik: "Sayfa bulunamadı | Bayramoğlu Su Bayisi",
  aciklama: "Aradığınız sayfa bulunamadı. Ana sayfadan su siparişi verebilir ya da bizi arayabilirsiniz.",
  govde: `
<section class="sayfa-bas"><div class="kap sayfa-bas-ic"><div class="sayfa-bas-metin">
  <span class="ust-etiket">404</span>
  <h1>Bu sayfa bulunamadı <span>ama suyunuz bulunur.</span></h1>
  <p class="giris">Aradığınız sayfa taşınmış ya da kaldırılmış olabilir.</p>
  <div class="dugmeler"><a class="btn btn-ana btn-buyuk" href="/">Ana sayfa</a><a class="btn btn-wa btn-buyuk" href="/siparis/">${WA_SVG}Sipariş ver</a></div>
</div></div></section>`,
};

// ---------- CSS / JS ----------
const CSS = (readFileSync("src/font.css", "utf8") + readFileSync("src/style.css", "utf8"))
  .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{}:;,>])\s*/g, "$1").replace(/;}/g, "}").trim();
const JS = readFileSync("src/main.js", "utf8")
  .replace(/^\s*\/\/.*$/gm, "").replace(/\n\s+/g, "\n").trim()
  .replace("__WA__", c.whatsapp);

// ---------- Yaz ----------
mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT)) rmSync(join(OUT, f), { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync("public", OUT, { recursive: true });

for (const p of sayfalar) {
  const dizin = join(OUT, p.yol);
  mkdirSync(dizin, { recursive: true });
  writeFileSync(join(dizin, "index.html"), sayfa(p));
}
writeFileSync(join(OUT, "404.html"), sayfa(sayfa404));

writeFileSync(join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sayfalar.filter((p) => !p.noindex).map((p) => `  <url><loc>${url(p.yol)}</loc><lastmod>${BUGUN}</lastmod></url>`).join("\n")}
</urlset>
`);
writeFileSync(join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${url("/sitemap.xml")}\n`);
writeFileSync(join(OUT, "site.webmanifest"), JSON.stringify({ name: c.marka, short_name: c.markaKisa, start_url: "/", display: "standalone", background_color: "#ffffff", theme_color: "#0a3d6b", lang: "tr", icons: [{ src: "/favicon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png" }] }));

console.log(`${sayfalar.length} sayfa + 404 → ${OUT}/`);
