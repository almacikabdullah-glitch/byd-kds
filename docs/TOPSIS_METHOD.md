# TOPSIS Metodoloji Raporu

## 1. Giriş

TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution), çok kriterli karar verme problemlerinde alternatifleri sıralamak için kullanılan popüler bir yöntemdir. Bu projede, 30 Türkiye şehrini EV şarj istasyonu yatırımı için değerlendirmek amacıyla uygulanmıştır.

## 2. Karar Problemi

**Amaç:** BYD Türkiye'nin elektrikli araç şarj istasyonu yatırımı için en uygun şehirleri belirlemek.

**Alternatifler:** 30 büyük Türkiye şehri

**Kriterler:** 10 adet değerlendirme kriteri

## 3. Kriter Tanımları

| Kod | Kriter | Kategori | Birim | Yön |
|-----|--------|----------|-------|-----|
| POP_DENSITY | Nüfus Yoğunluğu | Demografik | kişi/km² | Fayda (+) |
| EV_COUNT | EV Sayısı | Ulaşım | adet | Fayda (+) |
| EV_DENSITY | EV Yoğunluğu | Ulaşım | adet/10k | Fayda (+) |
| ENERGY_CAPACITY | Enerji Kapasitesi | Altyapı | index | Fayda (+) |
| CHARGING_STATIONS | Mevcut Şarj İst. | Rekabet | adet | Maliyet (-) |
| AVG_INCOME | Ortalama Gelir | Ekonomik | TL | Fayda (+) |
| TOURISM_INDEX | Turizm Endeksi | Ekonomik | index | Fayda (+) |
| HIGHWAY_ACCESS | Otoyol Erişimi | Altyapı | index | Fayda (+) |
| ELECTRICITY_PRICE | Elektrik Fiyatı | Enerji | TL/kWh | Maliyet (-) |
| GRID_RELIABILITY | Şebeke Güvenilirliği | Altyapı | index | Fayda (+) |

## 4. Algoritma Adımları

### Adım 1: Karar Matrisi (X)

30 şehir × 10 kriter boyutunda matris oluşturulur:

```
X = [xij] where i = 1..30, j = 1..10
```

### Adım 2: Vektör Normalizasyonu

Her bir değer, sütun vektörünün Euclidean normu ile bölünerek normalize edilir:

```
r_ij = x_ij / sqrt(Σ x_ij²)
```

Bu yöntem, farklı birimlerdeki kriterleri karşılaştırılabilir hale getirir.

### Adım 3: Ağırlıklı Normalize Matris (V)

Normalize değerler, kriter ağırlıkları ile çarpılır:

```
v_ij = w_j × r_ij
```

Ağırlık toplamı her zaman 1'e eşittir: `Σ w_j = 1`

### Adım 4: İdeal Çözümler

**Pozitif İdeal Çözüm (A+):**
- Fayda kriterleri için: `a_j+ = max(v_ij)`
- Maliyet kriterleri için: `a_j+ = min(v_ij)`

**Negatif İdeal Çözüm (A-):**
- Fayda kriterleri için: `a_j- = min(v_ij)`
- Maliyet kriterleri için: `a_j- = max(v_ij)`

### Adım 5: Uzaklık Hesaplama

**Pozitif ideale uzaklık:**
```
S_i+ = sqrt(Σ (v_ij - a_j+)²)
```

**Negatif ideale uzaklık:**
```
S_i- = sqrt(Σ (v_ij - a_j-)²)
```

### Adım 6: Relatif Yakınlık (C*)

Her alternatif için skorr:

```
C_i* = S_i- / (S_i+ + S_i-)
```

C* değeri 0-1 arasındadır. 1'e yakın değerler daha iyi alternatifleri gösterir.

## 5. Senaryo Ağırlıkları

### Agresif Büyüme
EV potansiyeline ve nüfusa öncelik verir.

| Kriter | Ağırlık |
|--------|---------|
| POP_DENSITY | 0.15 |
| EV_COUNT | 0.25 |
| EV_DENSITY | 0.20 |
| ENERGY_CAPACITY | 0.10 |
| CHARGING_STATIONS | 0.08 |
| AVG_INCOME | 0.10 |
| TOURISM_INDEX | 0.05 |
| HIGHWAY_ACCESS | 0.05 |
| ELECTRICITY_PRICE | 0.01 |
| GRID_RELIABILITY | 0.01 |

### Dengeli Strateji
Tüm kriterleri dengeli değerlendirir.

| Kriter | Ağırlık |
|--------|---------|
| POP_DENSITY | 0.10 |
| EV_COUNT | 0.15 |
| EV_DENSITY | 0.15 |
| ENERGY_CAPACITY | 0.10 |
| CHARGING_STATIONS | 0.10 |
| AVG_INCOME | 0.12 |
| TOURISM_INDEX | 0.08 |
| HIGHWAY_ACCESS | 0.10 |
| ELECTRICITY_PRICE | 0.05 |
| GRID_RELIABILITY | 0.05 |

### Temkinli Yaklaşım
Altyapı ve gelir güvenliğine öncelik verir.

| Kriter | Ağırlık |
|--------|---------|
| POP_DENSITY | 0.08 |
| EV_COUNT | 0.12 |
| EV_DENSITY | 0.12 |
| ENERGY_CAPACITY | 0.18 |
| CHARGING_STATIONS | 0.12 |
| AVG_INCOME | 0.15 |
| TOURISM_INDEX | 0.05 |
| HIGHWAY_ACCESS | 0.08 |
| ELECTRICITY_PRICE | 0.05 |
| GRID_RELIABILITY | 0.05 |

## 6. Duyarlılık Analizi

Her kriterin ağırlığı %±10 değiştirildiğinde, ilk 5 şehrin sıralaması nasıl değişiyor analiz edilir. Bu, karar vericilere hangi kriterlerin sonucu en çok etkilediğini gösterir.

## 7. Sınırlılıklar

1. Kriter ağırlıkları subjektiftir ve uzman görüşüne dayanır
2. Bazı göstergeler proxy değerlerden türetilmiştir
3. Veriler farklı dönemlere ait olabilir

## 8. Referanslar

- Hwang, C.L.; Yoon, K. (1981). Multiple Attribute Decision Making: Methods and Applications
- Chen, S.J.; Hwang, C.L. (1992). Fuzzy Multiple Attribute Decision Making
