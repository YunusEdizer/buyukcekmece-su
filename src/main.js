(function () {
  var WA = "__WA__";
  var d = document;
  var $ = function (s, k) { return (k || d).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || d).querySelectorAll(s)); };
  var depo = {
    al: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    yaz: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    sil: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  function olay(ad, veri) { if (window.gtag) window.gtag("event", ad, veri || {}); }

  // Mobil menü
  var dugme = $("#menuDugme"), ust = $("#ust");
  if (dugme) dugme.addEventListener("click", function () {
    var acik = ust.classList.toggle("menu-acik");
    dugme.setAttribute("aria-expanded", acik);
    dugme.setAttribute("aria-label", acik ? "Menüyü kapat" : "Menüyü aç");
    d.documentElement.classList.toggle("kilit", acik);
  });

  // Kaydırınca başlığa gölge
  var gol = function () { ust && ust.classList.toggle("golgeli", window.scrollY > 8); };
  window.addEventListener("scroll", gol, { passive: true }); gol();

  // Arama / WhatsApp tıklama ölçümü
  d.addEventListener("click", function (e) {
    var a = e.target.closest("[data-track]");
    if (a) olay(a.getAttribute("data-track"), { konum: location.pathname });
  });

  // Harita: tıklanınca yüklenir (hız ve gizlilik için)
  $$(".harita-yukle").forEach(function (b) {
    b.addEventListener("click", function () {
      var f = d.createElement("iframe");
      f.src = "https://www.google.com/maps?q=" + b.dataset.lat + "," + b.dataset.lng + "&z=15&hl=tr&output=embed";
      f.title = "Bayramoğlu Su Bayisi konumu"; f.loading = "lazy"; f.referrerPolicy = "no-referrer-when-downgrade";
      b.parentNode.replaceChild(f, b);
    });
  });

  // ---------- Sipariş oluşturucu ----------
  var form = $("#siparisFormu");
  if (form) {
    var kalemler = $$(".kalem", form);
    var miktar = {};
    var adres = $("#fAdres"), mahalle = $("#fMahalle"), ad = $("#fAd"), kat = $("#fKat"), not = $("#fNot"), saat = $("#fSaat");
    var duzenli = $("#fDuzenli"), hatirla = $("#fHatirla");
    var liste = $("#ozetListe"), onizle = $("#mesajOnizleme");

    // Satır etiketi: "Tüp gaz (12 kg mutfak tüpü, Likitgaz)"; çeşidi ürün adı olan satırlarda yalnızca çeşit yazılır
    function etiket(k) {
      var v = $$("[data-varyant]", k).map(function (s) { return s.value; }).filter(function (x) { return x !== "Marka fark etmez"; });
      if (k.hasAttribute("data-varyant-etiket") && v.length) return v.shift() + (v.length ? " (" + v.join(", ") + ")" : "");
      return k.dataset.ad + (v.length ? " (" + v.join(", ") + ")" : "");
    }

    function ciz() {
      kalemler.forEach(function (k) {
        var n = miktar[k.dataset.urun] || 0;
        $("output", k).textContent = n;
        k.classList.toggle("secili", n > 0);
        $("[data-azalt]", k).disabled = n === 0;
      });
      var secili = kalemler.filter(function (k) { return miktar[k.dataset.urun] > 0; });
      liste.innerHTML = secili.length ? secili.map(function (k) {
        return "<li><span>" + etiket(k) + "</span><b>" + miktar[k.dataset.urun] + " " + k.dataset.birim + "</b></li>";
      }).join("") : '<li class="bos">Henüz ürün seçmediniz.</li>';
      onizle.textContent = mesaj();
      if (secili.length) $("#urunHata").hidden = true;
    }

    function mesaj() {
      var TUP = ["tup", "ozeltup", "kamp", "dedantor", "palmiye"];
      var tup = TUP.some(function (k) { return miktar[k] > 0; }), su = Object.keys(miktar).some(function (k) { return TUP.indexOf(k) < 0 && miktar[k] > 0; });
      var s = ["Merhaba, " + (tup && su ? "su ve tüp gaz" : tup ? "tüp gaz" : "su") + " siparişi vermek istiyorum.", ""];
      kalemler.forEach(function (k) { var n = miktar[k.dataset.urun]; if (n) s.push("• " + etiket(k) + ": " + n + " " + k.dataset.birim); });
      s.push("");
      var m = mahalle.value === "diger" ? "Büyükçekmece (diğer mahalle)" : mahalle.value;
      s.push("Mahalle: " + m);
      if (adres.value.trim()) s.push("Adres: " + adres.value.trim());
      if (kat.value.trim()) s.push("Kat: " + kat.value.trim());
      if (ad.value.trim()) s.push("İsim: " + ad.value.trim());
      var z = ($("input[name=zaman]:checked", form) || {}).value || "En kısa sürede";
      if (z === "Bugün, belirli saatte" && saat.value) z = "Bugün saat " + saat.value;
      s.push("Teslimat: " + z);
      if (duzenli.checked) s.push("Düzenli teslimat istiyorum (haftalık / 2 haftada bir).");
      if (not.value.trim()) s.push("Not: " + not.value.trim());
      return s.join("\n");
    }

    function ekle(id, n) {
      miktar[id] = Math.max(0, Math.min(99, (miktar[id] || 0) + n));
      ciz();
    }

    kalemler.forEach(function (k) {
      $("[data-arttir]", k).addEventListener("click", function () { ekle(k.dataset.urun, 1); });
      $("[data-azalt]", k).addEventListener("click", function () { ekle(k.dataset.urun, -1); });
    });

    // Ürün kartlarındaki "Siparişe ekle"
    $$("[data-ekle]").forEach(function (b) {
      b.addEventListener("click", function () {
        ekle(b.dataset.ekle, 1);
        b.classList.add("eklendi");
        setTimeout(function () { b.classList.remove("eklendi"); }, 1200);
        olay("siparise_ekle", { urun: b.dataset.ekle });
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    $$("input[name=zaman]", form).forEach(function (r) {
      r.addEventListener("change", function () { $("#saatAlan").hidden = r.value !== "Bugün, belirli saatte" || !r.checked; ciz(); });
    });
    form.addEventListener("input", ciz);
    form.addEventListener("change", ciz);

    // Kayıtlı adres
    var kayit = depo.al("bs_adres");
    if (kayit) {
      try {
        var k = JSON.parse(kayit);
        adres.value = k.adres || ""; kat.value = k.kat || ""; ad.value = k.ad || "";
        if (k.mahalle && !form.closest("[data-sabit-mahalle]")) mahalle.value = k.mahalle;
        hatirla.checked = true;
      } catch (e) {}
    }
    hatirla.addEventListener("change", function () { if (!hatirla.checked) depo.sil("bs_adres"); });

    // Sayfaya özel başlangıç ürünü
    var bas = form.dataset.baslangicUrun;
    if (bas) miktar[bas] = 1;
    var basV = form.dataset.baslangicVaryant, vs = bas && $('.kalem[data-urun="' + bas + '"] [data-varyant]:not([data-marka])', form);
    if (basV && vs) vs.value = basV;
    // Hesaplayıcıdan gelen istek
    ciz();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var toplam = Object.keys(miktar).reduce(function (t, k) { return t + miktar[k]; }, 0);
      if (!toplam) { $("#urunHata").hidden = false; kalemler[0].scrollIntoView({ behavior: "smooth", block: "center" }); return; }
      if (adres.value.trim().length < 5) { $("#adresHata").hidden = false; adres.focus(); return; }
      $("#adresHata").hidden = true;
      if (hatirla.checked) depo.yaz("bs_adres", JSON.stringify({ adres: adres.value.trim(), kat: kat.value.trim(), ad: ad.value.trim(), mahalle: mahalle.value }));
      olay("whatsapp_siparis", { adet: toplam });
      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(mesaj()), "_blank", "noopener");
    });
    adres.addEventListener("input", function () { if (adres.value.trim().length >= 5) $("#adresHata").hidden = true; });
  }

  // ---------- Damacana hesaplayıcı ----------
  var kisi = $("#kisi");
  if (kisi) {
    var hesapla = function () {
      var n = +kisi.value, gun = 19 / (2 * n), hafta = 7 / gun;
      $("#kisiDeger").textContent = n;
      $("#gunSonuc").textContent = "~" + (gun >= 2 ? Math.floor(gun) + (gun % 1 >= 0.5 ? "–" + Math.ceil(gun) : "") : "1–2") + " gün";
      var a = Math.floor(hafta), b = Math.ceil(hafta);
      $("#haftaSonuc").textContent = "~" + (a === b || a === 0 ? b : a + "–" + b);
      kisi.style.setProperty("--dolu", ((n - 1) / 7 * 100) + "%");
    };
    kisi.addEventListener("input", hesapla); hesapla();
    $("#hesapEkle").addEventListener("click", function () {
      var hafta = Math.max(1, Math.round(7 / (19 / (2 * +kisi.value))));
      var k = $('.kalem[data-urun="damacana"]');
      var d2 = $("#fDuzenli");
      if (k && d2) {
        var o = $("output", k);
        var mevcut = +o.textContent;
        for (var i = mevcut; i < hafta; i++) $("[data-arttir]", k).click();
        d2.checked = true; d2.dispatchEvent(new Event("change", { bubbles: true }));
        $("#siparisFormu").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  // Sayfa içi yumuşak kaydırma
  $$("[data-kaydir]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var h = $(a.getAttribute("href"));
      if (h) { e.preventDefault(); h.scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
  });
})();
