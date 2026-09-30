# Bayramoğlu Su Bayisi — buyukcekmecesusiparisi.com.tr

Eski WordPress + Elementor sitesinin yerine yazılan statik site. Hosting ücreti yok (Vercel), bakım yükü yok.

## Kullanım

```bash
node build.mjs            # dist/ üretir
node tools/kontrol.mjs    # başlık/açıklama uzunluğu, tek h1, JSON-LD, kırık bağlantı kontrolü
node tools/serve.mjs      # http://localhost:4174
python tools/gorsel.py    # kaynak/ içindeki fotoğrafları public/foto/ altına webp olarak boyutlandırır
```

- İşletme bilgileri (telefon, adres, puan, fiyatlar, GA4, Search Console): `site.config.json`
- Ürün, bölge, SSS ve yorum metinleri: `src/icerik.mjs`
- Tasarım: `src/style.css` · Etkileşim (sipariş oluşturucu, menü, harita, hesaplayıcı): `src/main.js`
- Paylaşım görseli ve ikon şablonları: `tools/og.html`, `tools/icon.html` (Edge headless ile ekran görüntüsü alınarak üretildi)

## Sayfalar (20 + 404)

| Adres | Not |
|---|---|
| `/` | Eski ana sayfa adresi korunuyor |
| `/hizmetlerimiz/` | Eski adres korunuyor |
| `/hizmetlerimiz/19-litre-damacana-su/`, `/damacana-su-pompasi/`, `/bardak-su/`, `/pet-su/`, `/tup-gaz/` | Ürün sayfaları; damacanada "kaç gün yeter" hesaplayıcısı |
| `/hizmetlerimiz/forklift-tupu/`, `/palmiye-isitici/`, `/ticari-sanayi-tupu/` | Tüp alt sayfaları (`TUP_EK`); tüp rehberi `TUP_REHBER` — Milangaz resmî sitesinden, stok bayiden teyit edilmeli |
| `/hizmetlerimiz/ofis-isyeri-su-servisi/` | Kurumsal / düzenli teslimat |
| `/hizmet-bolgeleri/`, `/celaliye-su-siparisi/`, `/kamiloba-su-siparisi/`, `/kumburgaz-su-siparisi/` | Eski sitede adı geçen bölgeler |
| `/siparis/` | Reklam ve paylaşım için doğrudan sipariş sayfası |
| `/hakkimizda/`, `/iletisim/` | Eski adresler korunuyor |
| `/sikca-sorulan-sorular/`, `/gizlilik/` | |

Sipariş formu hiçbir veriyi sunucuya göndermez; seçimleri hazır bir WhatsApp mesajına çevirir.
"Adresimi hatırla" yalnızca ziyaretçinin tarayıcısına (localStorage) yazar.

## Logo ve görseller

- Logo (`public/logo-*.svg`, `favicon.svg`) eski 102x60 px PNG'den ölçülerek `python tools/logo.py` ile vektör olarak yeniden çizildi.
  Yazı Audiowide (OFL) harf yollarından, daraltılıp kalınlaştırılarak. Orijinal vektör dosyası gelirse onunla değiştirilmeli.
- `servis-araci` ve `bayi-dukkan` fotoğrafları işletmenin Google profiline kendi yüklediği fotoğraflardır (Ağu 2026).
- 1,5 L pet su görseli Unsplash'ten (ücretsiz ticari lisans, etiketsiz): https://unsplash.com/photos/blue-lid-clear-plastic-bottle-Z2NCX2qIIjg. Mayadağ etiketi YAPIŞTIRILMADI — satılan 1,5 L Mayadağ değil.
- Tüp gaz görseli markasız bir illüstrasyondur (`tools/tup.html`); Milangaz reklam görselleri kullanılmadı.
- Hattın bölgesi afişten: 0542 787 08 48 Celaliye–Kamiloba (WhatsApp), 0533 395 01 39 Kumburgaz–Küme Evler, sabit 0212 885 57 87.
  Kumburgaz sayfasındaki arama düğmeleri 0533'ü arar.

## Eski siteden farklar / kararlar

- Kullanıcı isteğiyle (23.09.2026) "aynı gün" teslimat vaadi kullanılmıyor; "en kısa sürede" / "hızlı teslimat" yazılıyor.

- Eski sitedeki "Mayadağ 15 L" etiketli ana görsel yapay zekâ üretimiydi (etikette "15 L", bozuk yazılar). Kullanılmadı.
- Eski sitedeki "Müşteri puanı 4.9" yerine gerçek Google puanı (5,0 · 5 yorum, 23.09.2026) yazıldı.
- "2.800+ abone" eski sitedeki sayaçtan (2874) alındı — işletmeden teyit edilmeli.
- Fiyat, çalışma saati, depozito, ödeme yöntemi, koli içerikleri bilinmediği için yazılmadı.
  Gelince `site.config.json` → `urunFiyatlari` / `calismaSaatleri` doldurulur.
- Yeni bölge sayfası yalnızca teslimat yapıldığı teyit edilen mahalle için eklenmeli (`src/icerik.mjs` → `BOLGELER`).
- Bardak su = Baharlife, 0,5 L pet su = Seda (kullanıcı markaları geri istedi, 23.09.2026); gerçek stok fotoğrafları. 1,5 L pet suyun markası bilinmiyor, yazılmıyor.
- Teyit bekleyen: tüp çeşitlerinden hangilerinin stokta olduğu.

## Yayına alma

1. ✅ Alan adı Natro hesabına (müşteri no 901160) iç transferle geldi (23.09.2026). **Bitiş: 23.10.2026** — en geç 20 Ekim'de yenilenmeli.
   Hak sahibi hâlâ eski firmadaki kişi görünüyor; Natro üzerinden hak sahibi değişikliği yapılmalı.
2. ✅ Vercel projesi `buyukcekmece-su` (https://buyukcekmece-su.vercel.app), alan adı + www eklendi.
   Yayın: `npx vercel deploy --prod --scope yunus-emre-s-projects3`
3. ✅ Natro'da ad sunucuları `ns1.vercel-dns.com` / `ns2.vercel-dns.com` yapıldı (23.09.2026); TRABIS'e yansıması bekleniyor.
4. E-posta: `info@buyukcekmecesusiparisi.com.tr` eski sunucuda barınıyor; DNS değişince çalışmayı bırakır.
   Kullanılıyorsa Natro e-posta ya da yönlendirme kurulmalı, kullanılmıyorsa config'den kaldırılmalı.
5. Search Console'a mülk eklenir, `sitemap.xml` gönderilir; GA4 kimliği `site.config.json`'a yazılır.
