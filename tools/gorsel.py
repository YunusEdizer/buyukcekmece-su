# Kaynak görselleri web için boyutlandırır: python tools/gorsel.py
# kaynak/*.{jpg,png,webp} → public/foto/<ad>-<genislik>.webp
from pathlib import Path
from PIL import Image

KOK = Path(__file__).resolve().parent.parent
HEDEF = KOK / "public" / "foto"
HEDEF.mkdir(parents=True, exist_ok=True)

# kaynak dosya: (yeni ad, genişlikler, kırpma oranı en/boy veya None)
LISTE = {
    # dogal-etiketli.png = dogal.webp + gerçek Mayadağ etiketi (tools/etiket.py)
    # Kahraman: damacana sağda kalacak şekilde 6:5 kırpılır (sol üst x, genişlik oranı)
    "dogal-etiketli.png#kahraman": ("damacana-kaynak", [480, 640, 960, 1200], (1024, 6 / 5)),
    "dogal-etiketli.png": ("dogal-kaynak-suyu", [800, 1600], None),
    "teslimat.jpg": ("kapiya-teslimat", [640, 1200], 3 / 2),
    "dolum.jpg": ("hijyenik-dolum", [640, 1200], None),
    "pompa.webp": ("damacana-pompasi", [320, 480, 800], 4 / 5),
    # Gerçek ürün fotoğrafları (işletmenin kendi çekimleri, 23.09.2026)
    "mayadag-19l.jpg": ("mayadag-19l", [320, 640, 760], None),
    # Bardak ve pet su: bayideki gerçek stok fotoğrafları (Google profili, Ağu 2026)
    "bardak-su-gercek.jpg": ("baharlife-bardak-su", [320, 640, 721], None),
    "pet-su-sisele.jpg": ("seda-pet-su", [320, 560], None),
    # İşletmenin Google profiline kendi yüklediği gerçek fotoğraflar (Ağu 2026)
    "tup.png": ("tup-gaz", [320, 640, 1200], 4 / 3),  # tools/tup.html illüstrasyonu
    "tup-forklift.png": ("tup-forklift", [320, 640, 1200], 4 / 3),  # tools/tup-cesit.html#forklift
    "tup-palmiye.png": ("tup-palmiye", [320, 640, 1200], 4 / 3),
    "tup-ticari.png": ("tup-ticari", [320, 640, 1200], 4 / 3),
    # Tüp: Google profilindeki gerçek görsellerden kırpılmış (Ağu 2026)
    "tup-ev-gercek.jpg": ("tup-gaz-gercek", [320, 640, 1200], None),
    "tup-forklift-gercek.jpg": ("tup-forklift-gercek", [320, 640, 734], None),
    "tup-palmiye-gercek.jpg": ("tup-palmiye-gercek", [320, 640, 1053], None),
    # 1,5 L: Unsplash (ücretsiz ticari lisans, markasız) — unsplash.com/photos/blue-lid-clear-plastic-bottle-Z2NCX2qIIjg
    "pet-15-kirp.jpg": ("pet-15-foto", [320, 640, 1200], None),
    "dedantor-kirp.jpg": ("orgaz-dedantor", [320, 640, 900], None),  # dükkânda çekilmiş gerçek fotoğraf
    "kamp-ocagi-kirp.jpg": ("orgaz-kamp-ocagi", [320, 640, 1200], None),
    "pompa-desa-kirp.jpg": ("desa-pompa", [320, 640, 1200], None),  # Google profili, işletmenin fotoğrafı
    "kamp-ocagi-tupte-kirp.jpg": ("kamp-ocagi-tupte", [320, 640, 1200], None),
    "servis-araci.jpg": ("servis-araci", [640, 771], None),
    "dukkan.jpg": ("bayi-dukkan", [800, 1600], None),
}


def kirp(im, oran):
    g, y = im.size
    if abs(g / y - oran) < 0.01:
        return im
    if g / y > oran:
        yeni = round(y * oran)
        sol = (g - yeni) // 2
        return im.crop((sol, 0, sol + yeni, y))
    yeni = round(g / oran)
    ust = (y - yeni) // 2
    return im.crop((0, ust, g, ust + yeni))


for kaynak, (ad, genislikler, oran) in LISTE.items():
    im = Image.open(KOK / "kaynak" / kaynak.split("#")[0]).convert("RGB")
    if isinstance(oran, tuple):
        sol, o = oran
        im = im.crop((sol, 0, sol + round(im.height * o), im.height))
    elif oran:
        im = kirp(im, oran)
    for w in genislikler:
        w = min(w, im.width)
        k = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        yol = HEDEF / f"{ad}-{w}.webp"
        k.save(yol, "WEBP", quality=78, method=6)
        print(f"{yol.name:36} {k.size[0]}x{k.size[1]}  {yol.stat().st_size // 1024} KB")


# Sipariş formu küçük resimleri: kare, 112 px (56 px @2x)
for kaynak, ad in [("tup-forklift-gercek.jpg", "tup-forklift-gercek"), ("kamp-ocagi-tupte-kirp.jpg", "kamp-ocagi-tupte"), ("tup-palmiye-gercek.jpg", "tup-palmiye-gercek"), ("dedantor-kirp.jpg", "orgaz-dedantor"), ("kamp-ocagi-kirp.jpg", "orgaz-kamp-ocagi"), ("tup-ev-gercek.jpg", "tup-gaz-gercek"), ("pet-15-kirp.jpg", "pet-15-foto"), ("mayadag-19l-kare.jpg", "mayadag-19l"), ("pompa-desa-kirp.jpg", "desa-pompa"), ("pet-su-sisele.jpg", "seda-pet-su"), ("bardak-su-gercek.jpg", "baharlife-bardak-su")]:
    im = kirp(Image.open(KOK / "kaynak" / kaynak).convert("RGB"), 1).resize((112, 112), Image.LANCZOS)
    yol = HEDEF / f"{ad}-kare.webp"
    im.save(yol, "WEBP", quality=80, method=6)
    print(f"{yol.name:36} 112x112  {yol.stat().st_size // 1024} KB")
