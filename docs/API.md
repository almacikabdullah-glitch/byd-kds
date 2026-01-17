# BYD KDS - API Dokümantasyonu

**Base URL:** `http://localhost:3000/api`

**Authentication:** Bearer Token (JWT)

---

## Auth

### POST /auth/login
Kullanıcı girişi yapar.

**Request:**
```json
{
  "email": "admin@byd.com",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@byd.com",
      "name": "BYD Admin",
      "role": "admin"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### POST /auth/refresh
Token yeniler.

### GET /auth/me
🔒 Mevcut kullanıcı bilgisi.

---

## Cities

### GET /cities
🔒 Şehir listesini getirir.

**Query Parameters:**
- `region` - Bölge filtresi (MAR, ICA, EGE, vb.)
- `sort` - Sıralama alanı (plate_code, name, population)
- `order` - ASC veya DESC
- `limit` - Maksimum kayıt (varsayılan: 30)

### GET /cities/map
🔒 Harita için hafif şehir verisi.

### GET /cities/summary
🔒 Genel istatistik özeti.

### GET /cities/:id
🔒 Şehir detayı + ilçeler + göstergeler.

---

## Metrics

### GET /metrics/indicators
🔒 Aktif gösterge listesi.

### GET /metrics/latest
🔒 Tüm şehirler için son gösterge değerleri.

### GET /metrics/city/:cityId
🔒 Belirli şehir metrikleri.

### GET /metrics/completeness
🔒 Veri tamlık raporu.

---

## TOPSIS

### POST /topsis/run
🔒👔 TOPSIS analizi çalıştırır.

**Request:**
```json
{
  "runName": "Analiz - 25.12.2024",
  "scenarioType": "balanced",
  "weights": {
    "POP_DENSITY": 0.10,
    "EV_COUNT": 0.15,
    ...
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "runId": 1,
    "runName": "Analiz - 25.12.2024",
    "executionTimeMs": 245,
    "results": [
      {
        "rank": 1,
        "cityName": "İstanbul",
        "cStar": 0.8523,
        "investmentPriority": "high"
      }
    ]
  }
}
```

### GET /topsis/latest
🔒 En son TOPSIS sonuçları.

### GET /topsis/runs
🔒 Çalıştırma geçmişi.

### GET /topsis/runs/:runId
🔒 Belirli run sonuçları.

### GET /topsis/runs/:runId/sensitivity
🔒 Duyarlılık analizi.

---

## Scenarios

### GET /scenarios/presets
🔒 Senaryo preset listesi.

### POST /scenarios/presets
🔒👔 Yeni senaryo oluştur.

### PUT /scenarios/presets/:id
🔒👔 Senaryo güncelle.

### DELETE /scenarios/presets/:id
🔒👔 Senaryo sil.

---

## Forecast

### POST /forecast/run
🔒👔 Tahmin çalıştır.

**Request:**
```json
{
  "targetCode": "EV_COUNT",
  "modelType": "exponential",
  "horizonMonths": 12,
  "cityIds": [1, 2, 3]
}
```

### GET /forecast/city/:cityId
🔒 Şehir tahmini.

### GET /forecast/models
🔒 Tahmin modelleri.

---

## ROI

### POST /roi/calculate
🔒👔 ROI hesapla.

**Request:**
```json
{
  "topsisRunId": 1,
  "stationCount": 5,
  "capexPerStation": 750000,
  "monthlyOpex": 15000,
  "pricePerKwh": 8.0
}
```

### GET /roi/summary
🔒 ROI özet raporu.

### GET /roi/city/:cityId
🔒 Şehir ROI detayı.

---

## Error Codes

| Kod | Açıklama |
|-----|----------|
| AUTH_REQUIRED | Token gerekli |
| TOKEN_EXPIRED | Token süresi dolmuş |
| INVALID_TOKEN | Geçersiz token |
| FORBIDDEN | Yetki yok |
| NOT_FOUND | Kaynak bulunamadı |
| VALIDATION_ERROR | Validasyon hatası |

---

**Semboller:**
- 🔒 = Authentication gerekli
- 👔 = admin/manager rolü gerekli
