# 🔋 BYD Türkiye EV Şarj İstasyonu Karar Destek Sistemi (KDS)

<p align="center">
  <img src="logo/byd-logo.png" alt="BYD Logo" width="200"/>
</p>

**BYD KDS**, Türkiye genelinde elektrikli araç (EV) şarj istasyonlarının optimal konumlandırılması için geliştirilmiş çok kriterli karar destek sistemidir. TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution) metodolojisini kullanarak 30 büyük Türkiye şehrini analiz eder ve yatırım önceliklendirmesi yapar.

---

## 📑 İçindekiler

- [Özellikler](#-özellikler)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Sistem Gereksinimleri](#-sistem-gereksinimleri)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Proje Yapısı](#-proje-yapısı)
- [Analiz Metodolojisi](#-analiz-metodolojisi)
- [Ekran Görüntüleri](#-ekran-görüntüleri)
- [Veri Kaynakları](#-veri-kaynakları)
- [Lisans](#-lisans)

---

## ✨ Özellikler

### 🎯 Ana Fonksiyonlar

| Özellik | Açıklama |
|---------|----------|
| **TOPSIS Analizi** | 10 farklı kriter kullanarak şehirleri skorlama ve sıralama |
| **Senaryo Yönetimi** | Agresif, Dengeli ve Temkinli yatırım stratejileri |
| **Tahmin Modelleri** | EV sayısı, talep ve büyüme tahminleri |
| **ROI Hesaplama** | Yatırım getirisi ve geri ödeme süresi analizi |
| **İnteraktif Harita** | Şehirlerin coğrafi görselleştirmesi |
| **Karşılaştırma Aracı** | Şehirler arası kriter karşılaştırması |

### 📊 Dashboard Özellikleri

- 🏆 Top 5 şehir sıralaması ve skorları
- 📈 Bölgesel performans analizi
- 📉 Trend grafikleri ve tahminler
- 🗺️ İnteraktif Türkiye haritası
- 📑 Detaylı şehir profilleri

---

## 🛠 Teknoloji Yığını

### Backend
| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| Node.js | ≥18.0.0 | Runtime |
| Express.js | 4.18 | Web framework |
| MySQL | 5.7+ | Veritabanı |
| JWT | 9.0 | Authentication |
| Winston | 3.11 | Logging |
| Jest | 29.7 | Testing |

### Frontend
| Teknoloji | Kullanım |
|-----------|----------|
| HTML5/CSS3 | UI yapısı |
| JavaScript (ES6+) | İstemci mantığı |
| Chart.js | Grafik ve görselleştirme |
| Leaflet.js | Harita entegrasyonu |

---

## 💻 Sistem Gereksinimleri

- **İşletim Sistemi:** macOS, Windows veya Linux
- **MAMP** (veya benzeri MySQL + Apache çözümü)
- **Node.js** v18 veya üzeri
- **Modern Tarayıcı** (Chrome, Firefox, Safari, Edge)

---

## 🚀 Kurulum

### 1. Depoyu Klonlayın

```bash
git clone https://github.com/your-username/byd-kds.git
cd byd-kds
```

### 2. MySQL Veritabanını Hazırlayın

```bash
# MAMP'ı başlatın ve MySQL sunucusunun çalıştığından emin olun

# Veritabanını oluşturun
/Applications/MAMP/Library/bin/mysql -u root -proot -e "CREATE DATABASE byd_kds CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;"

# Şemaları yükleyin
/Applications/MAMP/Library/bin/mysql -u root -proot byd_kds < database/schema.sql
/Applications/MAMP/Library/bin/mysql -u root -proot byd_kds < database/views.sql
/Applications/MAMP/Library/bin/mysql -u root -proot byd_kds < database/triggers.sql
/Applications/MAMP/Library/bin/mysql -u root -proot byd_kds < database/seed_districts.sql
```

### 3. Backend Kurulumu

```bash
cd backend

# .env dosyasını oluşturun
cp .env.example .env

# Bağımlılıkları yükleyin
npm install

# Örnek verileri yükleyin
node etl/scripts/seed-indicators.js

# Sunucuyu başlatın
npm run dev
```

### 4. Frontend Kurulumu

```bash
cd frontend

# Live Server ile çalıştırın
npx live-server --port=3001
```

### 5. Uygulamaya Erişin

```
http://localhost:3001/login.html
```

**Varsayılan Giriş Bilgileri:**
- 📧 Email: `admin@byd.com`
- 🔐 Şifre: `Admin123!`

---

## 📖 Kullanım

### TOPSIS Analizi Çalıştırma

1. Dashboard'a giriş yapın
2. "TOPSIS Çalıştır" butonuna tıklayın
3. Bir senaryo seçin:
   - **Agresif Büyüme:** EV potansiyeli ve nüfusa öncelik
   - **Dengeli Strateji:** Tüm kriterleri eşit değerlendirir
   - **Temkinli Yaklaşım:** Altyapı ve gelir güvenliğine odaklanır
4. Analiz adını girin ve çalıştırın

### ROI Hesaplama

1. Bir şehir seçin veya TOPSIS sonuçlarından bir şehire tıklayın
2. "ROI Hesapla" butonuna tıklayın
3. Parametreleri girin:
   - İstasyon sayısı
   - İstasyon başına CAPEX
   - Aylık OPEX
   - kWh başına fiyat
4. Geri ödeme süresini ve yatırım getirisini görüntüleyin

---

## 📡 API Dokümantasyonu

**Base URL:** `http://localhost:3000/api`

### Kimlik Doğrulama

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/auth/login` | POST | Kullanıcı girişi |
| `/auth/refresh` | POST | Token yenileme |
| `/auth/me` | GET | 🔒 Mevcut kullanıcı bilgisi |

### Şehirler

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/cities` | GET | 🔒 Şehir listesi |
| `/cities/:id` | GET | 🔒 Şehir detayı |
| `/cities/map` | GET | 🔒 Harita verisi |
| `/cities/summary` | GET | 🔒 Özet istatistikler |

### TOPSIS

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/topsis/run` | POST | 🔒👔 Analiz çalıştır |
| `/topsis/latest` | GET | 🔒 Son sonuçlar |
| `/topsis/runs` | GET | 🔒 Çalıştırma geçmişi |
| `/topsis/runs/:runId/sensitivity` | GET | 🔒 Duyarlılık analizi |

### Tahmin & ROI

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/forecast/run` | POST | 🔒👔 Tahmin çalıştır |
| `/roi/calculate` | POST | 🔒👔 ROI hesapla |
| `/roi/summary` | GET | 🔒 ROI özeti |

> 🔒 = Authentication gerekli | 👔 = admin/manager rolü gerekli

Detaylı API dokümantasyonu için: [docs/API.md](docs/API.md)

---

## 📁 Proje Yapısı

```
byd-kds/
├── 📂 backend/
│   ├── app.js                  # Express ana uygulaması
│   ├── .env.example            # Örnek environment dosyası
│   ├── package.json            # Backend bağımlılıkları
│   ├── 📂 src/
│   │   ├── 📂 config/          # DB, logger, cache yapılandırması
│   │   ├── 📂 middleware/      # Auth, error handling
│   │   └── 📂 modules/         # API modülleri
│   │       ├── auth/           # Kimlik doğrulama
│   │       ├── cities/         # Şehir yönetimi
│   │       ├── metrics/        # Metrik ve göstergeler
│   │       ├── topsis/         # TOPSIS analizi
│   │       ├── forecast/       # Tahmin modelleri
│   │       ├── scenarios/      # Senaryo yönetimi
│   │       └── roi/            # ROI hesaplamaları
│   └── 📂 etl/                 # Veri yükleme scriptleri
│
├── 📂 frontend/
│   ├── login.html              # Giriş sayfası
│   ├── dashboard.html          # Ana panel
│   ├── map.html                # Harita görünümü
│   ├── city.html               # Şehir detay sayfası
│   ├── topsis.html             # TOPSIS analizi
│   ├── compare.html            # Şehir karşılaştırma
│   ├── forecast.html           # Tahmin sayfası
│   ├── scenarios.html          # Senaryo yönetimi
│   ├── roi.html                # ROI hesaplama
│   └── 📂 src/                 # JavaScript modülleri
│
├── 📂 database/
│   ├── schema.sql              # Tablo tanımlamaları
│   ├── views.sql               # VIEW tanımlamaları
│   ├── triggers.sql            # Trigger tanımlamaları
│   └── seed_districts.sql      # İlçe verisi
│
├── 📂 docs/
│   ├── API.md                  # API dokümantasyonu
│   ├── RUNBOOK.md              # Kurulum kılavuzu
│   ├── DATA_SOURCES.md         # Veri kaynakları
│   └── TOPSIS_METHOD.md        # Metodoloji açıklaması
│
└── 📂 logo/                    # Proje logoları
```

---

## 📐 Analiz Metodolojisi

### TOPSIS Yöntemi

TOPSIS, çok kriterli karar verme problemlerinde alternatifleri **ideal çözüme yakınlık** esasına göre sıralar.

#### Değerlendirme Kriterleri

| Kod | Kriter | Yön | Açıklama |
|-----|--------|-----|----------|
| `POP_DENSITY` | Nüfus Yoğunluğu | ↑ | Potansiyel müşteri yoğunluğu |
| `EV_COUNT` | EV Sayısı | ↑ | Mevcut elektrikli araç sayısı |
| `EV_DENSITY` | EV Yoğunluğu | ↑ | 10.000 kişi başına EV |
| `ENERGY_CAPACITY` | Enerji Kapasitesi | ↑ | Elektrik altyapısı |
| `CHARGING_STATIONS` | Mevcut İstasyonlar | ↓ | Rekabet durumu |
| `AVG_INCOME` | Ortalama Gelir | ↑ | Satın alma gücü |
| `TOURISM_INDEX` | Turizm Endeksi | ↑ | Ziyaretçi potansiyeli |
| `HIGHWAY_ACCESS` | Otoyol Erişimi | ↑ | Ulaşım kolaylığı |
| `ELECTRICITY_PRICE` | Elektrik Fiyatı | ↓ | İşletme maliyeti |
| `GRID_RELIABILITY` | Şebeke Güvenilirliği | ↑ | Kesintisiz hizmet |

> ↑ = Fayda kriteri (yüksek değer tercih edilir)
> ↓ = Maliyet kriteri (düşük değer tercih edilir)

Detaylı metodoloji için: [docs/TOPSIS_METHOD.md](docs/TOPSIS_METHOD.md)

---

## 🖼 Ekran Görüntüleri

*Ekran görüntüleri buraya eklenecek*

---

## 📊 Veri Kaynakları

| Kaynak | Veri Türü | Lisans |
|--------|-----------|--------|
| [TÜİK](https://data.tuik.gov.tr) | Nüfus, Gelir, Araç | Kamu verisi |
| [EPDK](https://www.epdk.gov.tr) | Elektrik fiyatları | Kamu verisi |
| [TEİAŞ](https://www.teias.gov.tr) | Enerji kapasitesi | Kamu verisi |
| [Ulaştırma Bakanlığı](https://www.uab.gov.tr) | EV tescil | Kamu verisi |
| [KGM](https://www.kgm.gov.tr) | Otoyol verileri | Kamu verisi |

Detaylı bilgi için: [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md)

---

## 📝 Lisans

Bu proje **PROPRIETARY** lisansı altında dağıtılmaktadır.

© 2024 BYD Türkiye - Tüm hakları saklıdır.

---

<p align="center">
  <strong>🚗⚡ Elektrikli Geleceğe Güç Veriyoruz</strong>
</p>


