# Veri Kaynakları ve Atıflar

## Resmi Veri Kaynakları

### 1. TÜİK - Türkiye İstatistik Kurumu
**URL:** https://data.tuik.gov.tr

| Veri | Açıklama | Erişim |
|------|----------|--------|
| Nüfus | İl/ilçe nüfus verileri | API + CSV |
| Gelir | Kişi başı gelir istatistikleri | CSV |
| Araç | Tescilli araç sayıları | CSV |

**Lisans:** Kamu verisi, atıf zorunlu

---

### 2. EPDK - Enerji Piyasası Düzenleme Kurumu
**URL:** https://www.epdk.gov.tr

| Veri | Açıklama | Erişim |
|------|----------|--------|
| Elektrik Fiyatları | Bölgesel tarife verileri | PDF/CSV |
| Dağıtım Kayıpları | Şebeke kayıp oranları | Rapor |

---

### 3. TEİAŞ - Türkiye Elektrik İletim AŞ
**URL:** https://www.teias.gov.tr

| Veri | Açıklama | Erişim |
|------|----------|--------|
| Kapasite | İletim kapasitesi | Rapor |
| Yük Verisi | Bölgesel yük analizi | CSV |

---

### 4. Ulaştırma Bakanlığı
**URL:** https://www.uab.gov.tr

| Veri | Açıklama | Erişim |
|------|----------|--------|
| EV Tescil | Elektrikli araç kayıtları | CSV |
| Araç Trendi | Yıllık satış istatistikleri | Rapor |

---

### 5. KGM - Karayolları Genel Müdürlüğü  
**URL:** https://www.kgm.gov.tr

| Veri | Açıklama | Erişim |
|------|----------|--------|
| Otoyol | Güzergah verileri | CSV/Harita |
| Trafik | Trafik yoğunluğu | Rapor |

---

## Proxy ve Türetilmiş Veriler

Bazı göstergeler doğrudan mevcut olmadığından, aşağıdaki proxy yöntemler kullanılmıştır:

| Gösterge | Proxy Yöntemi | Güvenilirlik |
|----------|---------------|--------------|
| EV Yoğunluğu | EV Sayısı / Nüfus × 10.000 | Yüksek |
| Enerji Kapasitesi | Bölgesel endeks (0-1) | Orta |
| Şebeke Güvenilirliği | Kesinti verilerinden türetilmiş | Orta |
| Turizm Endeksi | Ziyaretçi/nüfus oranı | Orta |

---

## Veri Kalite Notları

1. **Güncellik:** Veriler 2023-2024 dönemi referans alınmıştır
2. **Eksiklik:** Bazı küçük şehirlerde veri eksikliği olabilir
3. **Tutarlılık:** Farklı kaynaklardan gelen veriler normalize edilmiştir

---

## Atıf Formatı

```
TÜİK (2024). Adrese Dayalı Nüfus Kayıt Sistemi Sonuçları.
EPDK (2024). Elektrik Piyasası Sektör Raporu.
```
