# Bayramoğlu logosunu vektör olarak üretir: python tools/logo.py
# Amblem eski 102x60 px logodan ölçülerek yeniden çizildi; yazı Audiowide (OFL) harf yollarından.
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

KOK = Path(__file__).resolve().parent.parent
FONT = TTFont(KOK / "tools" / "font" / "Audiowide-Regular.ttf")

# Amblem: 50 x 38 birim (orijinalde x 26..76)
def amblem(id_="a"):
    return f'''<defs>
<linearGradient id="{id_}h" gradientUnits="userSpaceOnUse" x1="0" y1="1" x2="0" y2="37"><stop offset="0" stop-color="#0b3a7c"/><stop offset=".27" stop-color="#0d3f86"/><stop offset=".275" stop-color="#079fe4"/><stop offset=".72" stop-color="#079fe4"/><stop offset=".725" stop-color="#0298cf"/><stop offset="1" stop-color="#0294c8"/></linearGradient>
<linearGradient id="{id_}e" gradientUnits="userSpaceOnUse" x1="1" y1="0" x2="31" y2="0"><stop offset="0" stop-color="#3f93d8"/><stop offset=".6" stop-color="#4fb0ee"/><stop offset="1" stop-color="#3a80c9"/></linearGradient>
</defs>
<path fill="url(#{id_}h)" fill-rule="evenodd" d="M32.5 1a18 18 0 1 1 0 36a18 18 0 1 1 0-36zM35.5 8.6a10.4 10.4 0 1 0 0 20.8a10.4 10.4 0 1 0 0-20.8z"/>
<path fill="url(#{id_}e)" stroke="#fff" stroke-width="1.3" stroke-linejoin="round" paint-order="stroke" d="M1 1H21V8H7V15.5H25V9H31V14.8L27.6 19L31 23.2V29H25V22H7V30H21V37H1Z"/>'''

def yazi(metin, boy, x0=0, y0=0, dar=0.76, aralik=-0.02):
    """Metni SVG yol verisine çevirir. boy: büyük harf yüksekliği (birim)."""
    gs = FONT.getGlyphSet(); cmap = FONT.getBestCmap()
    cap = FONT["OS/2"].sCapHeight or FONT["head"].unitsPerEm * 0.7
    s = boy / cap
    x = 0; parca = []
    for ch in metin:
        ad = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[ad].draw(TransformPen(pen, (s * dar, 0, 0, -s, x0 + x, y0 + boy)))
        parca.append(pen.getCommands())
        x += gs[ad].width * s * dar + boy * aralik
    return "".join(parca), x

def yaz(ad, icerik, w, h):
    (KOK / "public" / ad).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.1f} {h:.1f}">{icerik}</svg>\n', encoding="utf-8")
    print(ad, f"{w:.1f}x{h:.1f}")

# Dikey (orijinal düzen): amblem üstte, yazı altta
d, gen = yazi("BAYRAMOĞLU", 11, 0, 0)
ofs = (gen - 50) / 2
for renk, ad in [("#111", "logo-dikey.svg"), ("#fff", "logo-dikey-beyaz.svg")]:
    yaz(ad, f'<g transform="translate({ofs:.2f} 0)">{amblem()}</g><path fill="{renk}" stroke="{renk}" stroke-width=".9" stroke-linejoin="round" transform="translate(0 44)" d="{d}"/>', gen, 57)

# Yatay (site başlığı): amblem solda, yazı sağda
d2, gen2 = yazi("BAYRAMOĞLU", 14, 0, 0)
for renk, ad in [("#0a2b4d", "logo-yatay.svg"), ("#fff", "logo-yatay-beyaz.svg")]:
    yaz(ad, f'{amblem()}<path fill="{renk}" stroke="{renk}" stroke-width="1.1" stroke-linejoin="round" transform="translate(58 12)" d="{d2}"/>', 58 + gen2 + 1, 38)

# Yalnız amblem (favicon)
yaz("favicon.svg", amblem(), 51, 38)
