# Gerçek Mayadağ etiketini işletmenin fotoğrafından (kaynak/mayadag-damacana-gercek.jpg) alır,
# silindirden açıp düzleştirir, sonra kahraman fotoğrafındaki damacanaya kavisine uygun yerleştirir.
# Çıktı: kaynak/dogal-etiketli.png  (tools/gorsel.py bunu kullanır)
# Kullanım: python tools/etiket.py
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

KOK = Path(__file__).resolve().parent.parent
K = KOK / "kaynak"


def parabol(noktalar):
    x, y = zip(*noktalar)
    return np.poly1d(np.polyfit(x, y, 2))


# --- 1) Etiketi düzleştir -------------------------------------------------
foto = Image.open(K / "mayadag-damacana-gercek.jpg").convert("RGB")
CX, R = 272, 243                      # öndeki damacananın ekseni ve yarıçapı (px)
X1, X2 = 89, 426                      # etiketin sol / sağ kenarı
ust = parabol([(95, 1158), (245, 1190), (420, 1170)])     # etiketin üst kenarı
alt = parabol([(95, 1326), (245, 1343), (420, 1309)])     # lacivert şeridin alt kenarı
t1, t2 = np.arcsin((X1 - CX) / R), np.arcsin((X2 - CX) / R)

W, H, N = 1000, 500, 40
mesh = []
for i in range(N):
    u0, u1 = i / N, (i + 1) / N
    xa = CX + R * np.sin(t1 + u0 * (t2 - t1))
    xb = CX + R * np.sin(t1 + u1 * (t2 - t1))
    kutu = (round(u0 * W), 0, round(u1 * W), H)
    # QUAD sırası: sol-üst, sol-alt, sağ-alt, sağ-üst
    mesh.append((kutu, (xa, ust(xa), xa, alt(xa), xb, alt(xb), xb, ust(xb))))
etiket = foto.transform((W, H), Image.MESH, mesh, Image.BICUBIC)
# fotoğraf gölgede çekilmiş: netleştir, parlaklığı ve kontrastı açık hava sahnesine yaklaştır
from PIL import ImageEnhance
etiket = etiket.filter(ImageFilter.UnsharpMask(radius=2, percent=90, threshold=2))
etiket = ImageEnhance.Brightness(etiket).enhance(1.12)
etiket = ImageEnhance.Contrast(etiket).enhance(1.12)
etiket.save(K / "etiket-duz.png")

# --- 2) Kahraman fotoğrafına yerleştir -------------------------------------
if __name__ == "__main__":
    hedef = Image.open(K / "dogal.webp").convert("RGB")
    h = np.asarray(hedef).astype(np.float32)
    e = np.asarray(etiket).astype(np.float32)
    CX2, R2 = 2021, 281                   # hedef damacananın ekseni ve yarıçapı
    ET_W = 0.78                           # etiket genişliği = çapın %78'i (açı olarak)
    Y_UST, Y_ALT = 802, 1004              # etiketin orta hattaki üst/alt kenarı
    SARKMA = 10                           # kenarlarda etiket bu kadar px yukarı kalkar (bakış açısı)
    tm = np.arcsin(ET_W)
    x0, x1 = int(CX2 - R2 * ET_W) - 1, int(CX2 + R2 * ET_W) + 2
    cikti = h.copy()
    for x in range(x0, x1):
        s = (x + 0.5 - CX2) / R2
        if abs(s) >= ET_W:
            continue
        th = np.arcsin(s)
        u = (th + tm) / (2 * tm)                      # etiket üzerindeki yatay konum 0..1
        kalk = SARKMA * (s / ET_W) ** 2
        yu, ya = Y_UST - kalk, Y_ALT - kalk
        isik = 0.86 + 0.18 * np.cos(th) ** 1.5         # kenarlara doğru kararma
        parlama = 38 * np.exp(-((th + 0.42) / 0.10) ** 2) + 14 * np.exp(-((th - 0.55) / 0.07) ** 2)  # dikey yansıma
        for y in range(int(yu), int(ya) + 1):
            v = (y + 0.5 - yu) / (ya - yu)
            if not 0 <= v <= 1:
                continue
            ex, ey = min(W - 1, u * (W - 1)), min(H - 1, v * (H - 1))
            ix, iy = int(ex), int(ey)
            fx, fy = ex - ix, ey - iy
            ix2, iy2 = min(ix + 1, W - 1), min(iy + 1, H - 1)
            p = (e[iy, ix] * (1 - fx) * (1 - fy) + e[iy, ix2] * fx * (1 - fy) + e[iy2, ix] * (1 - fx) * fy + e[iy2, ix2] * fx * fy)
            # kenar yumuşatma (1 px)
            a = min(1.0, (y + 0.5 - yu), (ya - y + 0.5), 1.0)
            cikti[y, x] = cikti[y, x] * (1 - a) + np.minimum(255, p * isik + parlama) * a
    # damlacık parıltılarını etiketin üstüne geri ekle (orijinal parlaklığın yüksek frekanslı kısmı)
    lum = hedef.convert("L")
    bulanik = np.asarray(lum.filter(ImageFilter.GaussianBlur(6))).astype(np.float32)
    parilti = np.clip(np.asarray(lum).astype(np.float32) - bulanik - 14, 0, None) * 0.55
    maske = np.zeros(h.shape[:2], np.float32)
    maske[int(Y_UST - SARKMA - 2):Y_ALT + 2, x0:x1] = 1
    cikti = np.clip(cikti + (parilti * maske)[..., None], 0, 255)
    sonuc = Image.fromarray(cikti.astype(np.uint8))
    sonuc.save(K / "dogal-etiketli.png")
    sonuc.crop((1640, 620, 2420, 1120)).save(K / "etiket-kontrol.png")
    print("tamam")
