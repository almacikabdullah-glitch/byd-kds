# BYD Türkiye KDS - Kurulum ve Çalıştırma Kılavuzu

## Gereksinimler

- **MAMP** (MySQL + Apache) - [Download](https://www.mamp.info/)
- **Node.js** v18+ - [Download](https://nodejs.org/)
- **Modern Tarayıcı** (Chrome, Firefox, Safari)

---

## 1. MAMP MySQL Kurulumu

### 1.1 MAMP'ı Başlat
```bash
# MAMP uygulamasını aç ve "Start Servers" butonuna tıkla
# MySQL Port: 8889 (varsayılan)
```

### 1.2 phpMyAdmin'e Eriş
```
http://localhost:8888/phpMyAdmin5/
```

### 1.3 Veritabanını Oluştur

**Seçenek A: phpMyAdmin ile**
1. Sol menüden "Yeni" tıkla
2. Veritabanı adı: `byd_kds`
3. Karşılaştırma: `utf8mb4_turkish_ci`
4. "Oluştur" butonuna tıkla

**Seçenek B: Terminal ile**
```bash
/Applications/MAMP/Library/bin/mysql -u root -proot -e "CREATE DATABASE byd_kds CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;"
```

---

## 2. Veritabanı Şemasını Yükle

### 2.1 Tabloları Oluştur
```bash
cd /Users/abdullahalmacik/Repo/byd-kds

# Ana şema
/Applications/MAMP/Library/bin/mysql -u root -proot byd_kds < database/schema.sql

# VIEW'ler
/Applications/MAMP/Library/bin/mysql -u root -proot byd_kds < database/views.sql

# TRIGGER'lar
/Applications/MAMP/Library/bin/mysql -u root -proot byd_kds < database/triggers.sql

# İlçe verileri
/Applications/MAMP/Library/bin/mysql -u root -proot byd_kds < database/seed_districts.sql
```

### 2.2 Doğrulama
```bash
/Applications/MAMP/Library/bin/mysql -u root -proot byd_kds -e "SHOW TABLES;"
```

Beklenen çıktı: 16 tablo (users, cities, districts, indicators, indicator_values, vb.)

---

## 3. Backend Kurulumu

### 3.1 Bağımlılıkları Yükle
```bash
cd /Users/abdullahalmacik/Repo/byd-kds/backend

# .env dosyasını oluştur
cp .env.example .env

# Bağımlılıkları yükle
npm install
```

### 3.2 .env Dosyasını Düzenle
```env
NODE_ENV=development
PORT=3000

# MAMP MySQL
DB_HOST=localhost
DB_PORT=8889
DB_USER=root
DB_PASSWORD=root
DB_NAME=byd_kds

# JWT
JWT_SECRET=byd-kds-super-secret-key-2024
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3001
```

### 3.3 Örnek Veriyi Yükle
```bash
cd /Users/abdullahalmacik/Repo/byd-kds/backend
node etl/scripts/seed-indicators.js
```

### 3.4 Varsayılan Kullanıcı Şifresini Güncelle
```bash
# bcrypt hash oluştur (Admin123!)
/Applications/MAMP/Library/bin/mysql -u root -proot byd_kds -e "
UPDATE users SET password_hash = '\$2b\$10\$xJ5nJ5nJ5nJ5nJ5nJ5nJ5OxJ5nJ5nJ5nJ5nJ5nJ5nJ5nJ5nJ5nJ5a' WHERE email = 'admin@byd.com';
"
```

> **Not:** Gerçek hash node ile oluşturulmalı. Backend başlarken otomatik güncellenir.

### 3.5 Backend'i Başlat
```bash
cd /Users/abdullahalmacik/Repo/byd-kds/backend
npm run dev
```

Beklenen çıktı:
```
✅ MySQL veritabanına bağlantı başarılı
🚀 BYD KDS Backend API http://localhost:3000 adresinde çalışıyor
```

### 3.6 Health Check
```bash
curl http://localhost:3000/api/health
```

---

## 4. Frontend Kurulumu

### 4.1 Live Server ile Çalıştır
```bash
cd /Users/abdullahalmacik/Repo/byd-kds/frontend
npx live-server --port=3001
```

### 4.2 Tarayıcıda Aç
```
http://localhost:3001/login.html
```

---

## 5. İlk TOPSIS Analizi

### 5.1 Giriş Yap
- Email: `admin@byd.com`
- Şifre: `Admin123!`

### 5.2 Dashboard'dan TOPSIS Çalıştır
1. Sağ üstteki "TOPSIS Çalıştır" butonuna tıkla
2. Çalıştırma adı gir
3. Senaryo seç (Dengeli/Agresif/Temkinli)
4. "Çalıştır" butonuna tıkla

### 5.3 Sonuçları Görüntüle
- Dashboard'da Top 5 şehir grafiği
- Harita sayfasında renkli markerlar
- Şehir detay sayfasında ROI analizi

---

## 6. API Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/login` | Giriş |
| GET | `/api/auth/me` | Kullanıcı bilgisi |
| GET | `/api/cities` | Şehir listesi |
| GET | `/api/cities/:id` | Şehir detayı |
| GET | `/api/cities/map` | Harita verisi |
| GET | `/api/metrics/latest` | Son metrikler |
| POST | `/api/topsis/run` | TOPSIS çalıştır |
| GET | `/api/topsis/latest` | Son sonuçlar |
| GET | `/api/scenarios/presets` | Senaryo listesi |
| POST | `/api/roi/calculate` | ROI hesapla |
| POST | `/api/forecast/run` | Tahmin çalıştır |

---

## 7. Demo Senaryosu

### Senaryo: Ağırlık Değişikliği ile Sıralama Farkı

1. **Dengeli Strateji ile TOPSIS çalıştır**
   - Dashboard > TOPSIS Çalıştır > "Dengeli Strateji" seç
   - Top 5 şehirleri not al

2. **Agresif Büyüme ile TOPSIS çalıştır**
   - Dashboard > TOPSIS Çalıştır > "Agresif Büyüme" seç
   - Top 5 şehirlerin değişimini gözlemle

3. **Haritada Karşılaştır**
   - Harita sayfasına git
   - Marker renklerinin değiştiğini gözlemle

4. **ROI Etkisini Analiz Et**
   - Top şehre tıkla
   - ROI hesapla
   - Payback süresini incele

---

## 8. Sorun Giderme

### MySQL Bağlantı Hatası
```bash
# MAMP'ın çalıştığından emin ol
# Port 8889 olmalı (8888 değil)
```

### CORS Hatası
```bash
# .env dosyasında CORS_ORIGIN doğru mu?
CORS_ORIGIN=http://localhost:3001
```

### Token Expired
```
# Tarayıcı console'da localStorage temizle
localStorage.clear()
# Sayfayı yenile
```

---

## 9. Proje Yapısı

```
byd-kds/
├── backend/
│   ├── app.js                 # Express ana dosya
│   ├── src/
│   │   ├── config/            # DB, logger, cache
│   │   ├── middleware/        # Auth, error handling
│   │   └── modules/           # API modülleri
│   │       ├── auth/
│   │       ├── cities/
│   │       ├── metrics/
│   │       ├── topsis/
│   │       ├── forecast/
│   │       ├── scenarios/
│   │       └── roi/
│   └── etl/scripts/           # Veri yükleme
├── frontend/
│   ├── login.html
│   ├── dashboard.html
│   ├── map.html
│   ├── city.html
│   ├── src/services/api.js
│   └── assets/css/main.css
├── database/
│   ├── schema.sql
│   ├── views.sql
│   ├── triggers.sql
│   └── seed_districts.sql
└── docs/
    └── RUNBOOK.md
```

---

## 10. Lisans ve Atıflar

Bu proje eğitim amaçlı geliştirilmiştir.

**Veri Kaynakları:**
- TÜİK (nüfus verileri)
- EPDK (enerji verileri)
- Ulaştırma Bakanlığı (araç tescil)

**Kullanılan Teknolojiler:**
- Node.js + Express
- MySQL
- Chart.js
- Leaflet.js
