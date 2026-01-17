-- =====================================================
-- BYD Türkiye EV Şarj İstasyonu Karar Destek Sistemi
-- Veritabanı Şeması (3NF)
-- MySQL 8.0+ / MAMP
-- Karakter Seti: utf8mb4_turkish_ci
-- =====================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Veritabanı oluştur (eğer yoksa)
CREATE DATABASE IF NOT EXISTS byd_kds 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_turkish_ci;

USE byd_kds;

-- =====================================================
-- 1. USERS - Kullanıcı Yönetimi
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'manager', 'analyst') NOT NULL DEFAULT 'analyst',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- =====================================================
-- 2. REGIONS - Coğrafi Bölgeler
-- =====================================================
CREATE TABLE IF NOT EXISTS regions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- =====================================================
-- 3. CITIES - 30 Büyük Şehir
-- =====================================================
CREATE TABLE IF NOT EXISTS cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plate_code VARCHAR(2) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    region_id INT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    population INT UNSIGNED NOT NULL DEFAULT 0,
    area_km2 DECIMAL(10, 2) NOT NULL DEFAULT 0,
    population_density DECIMAL(10, 2) GENERATED ALWAYS AS (population / NULLIF(area_km2, 0)) STORED,
    elevation_m INT DEFAULT 0,
    is_metropolitan BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE RESTRICT,
    INDEX idx_plate_code (plate_code),
    INDEX idx_region (region_id),
    INDEX idx_population (population DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- =====================================================
-- 4. DISTRICTS - İlçeler
-- =====================================================
CREATE TABLE IF NOT EXISTS districts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    population INT UNSIGNED DEFAULT 0,
    area_km2 DECIMAL(10, 2) DEFAULT 0,
    is_central BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_city (city_id),
    UNIQUE KEY uk_city_district (city_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- =====================================================
-- 5. DATA_SOURCES - Veri Kaynakları
-- =====================================================
CREATE TABLE IF NOT EXISTS data_sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    organization VARCHAR(100),
    url VARCHAR(500),
    access_type ENUM('api', 'csv', 'excel', 'scrape', 'manual') NOT NULL,
    license_note TEXT,
    reliability_score DECIMAL(3, 2) DEFAULT 0.80,
    last_fetched_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- =====================================================
-- 6. INDICATORS - Kriterler/Göstergeler
-- =====================================================
CREATE TABLE IF NOT EXISTS indicators (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category ENUM('demographic', 'economic', 'infrastructure', 'competition', 'energy', 'transport') NOT NULL,
    unit VARCHAR(30) NOT NULL,
    polarity ENUM('benefit', 'cost') NOT NULL COMMENT 'benefit: yüksek=iyi, cost: düşük=iyi',
    min_value DECIMAL(15, 4) DEFAULT 0,
    max_value DECIMAL(15, 4) DEFAULT 0,
    default_weight DECIMAL(5, 4) DEFAULT 0.1000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_polarity (polarity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- =====================================================
-- 7. INDICATOR_VALUES - Gösterge Değerleri
-- =====================================================
CREATE TABLE IF NOT EXISTS indicator_values (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    city_id INT NOT NULL,
    indicator_id INT NOT NULL,
    period_date DATE NOT NULL,
    value DECIMAL(15, 4) NOT NULL,
    source_id INT NOT NULL,
    quality_score DECIMAL(3, 2) DEFAULT 1.00 COMMENT '0-1 arası veri kalite puanı',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE CASCADE,
    FOREIGN KEY (source_id) REFERENCES data_sources(id) ON DELETE RESTRICT,
    UNIQUE KEY uk_city_indicator_date (city_id, indicator_id, period_date),
    INDEX idx_city_indicator (city_id, indicator_id),
    INDEX idx_period (period_date),
    INDEX idx_indicator (indicator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- =====================================================
-- 8. TOPSIS_RUNS - TOPSIS Çalıştırma Kayıtları
-- =====================================================
CREATE TABLE IF NOT EXISTS topsis_runs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    run_name VARCHAR(100) NOT NULL,
    created_by INT NOT NULL,
    scenario_type ENUM('aggressive', 'balanced', 'conservative', 'custom') DEFAULT 'balanced',
    date_range_start DATE,
    date_range_end DATE,
    normalization_method ENUM('vector', 'minmax', 'sum') DEFAULT 'vector',
    total_alternatives INT DEFAULT 30,
    total_criteria INT DEFAULT 0,
    status ENUM('pending', 'running', 'completed', 'failed') DEFAULT 'pending',
    execution_time_ms INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_created_by (created_by),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- =====================================================
-- 9. TOPSIS_WEIGHTS - TOPSIS Ağırlıkları
-- =====================================================
CREATE TABLE IF NOT EXISTS topsis_weights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    run_id INT NOT NULL,
    indicator_id INT NOT NULL,
    weight DECIMAL(5, 4) NOT NULL CHECK (weight >= 0 AND weight <= 1),
    FOREIGN KEY (run_id) REFERENCES topsis_runs(id) ON DELETE CASCADE,
    FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE CASCADE,
    UNIQUE KEY uk_run_indicator (run_id, indicator_id),
    INDEX idx_run (run_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- =====================================================
-- 10. TOPSIS_RESULTS - TOPSIS Sonuçları
-- =====================================================
CREATE TABLE IF NOT EXISTS topsis_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    run_id INT NOT NULL,
    city_id INT NOT NULL,
    s_plus DECIMAL(15, 8) NOT NULL COMMENT 'İdeal pozitife uzaklık',
    s_minus DECIMAL(15, 8) NOT NULL COMMENT 'İdeal negatife uzaklık',
    c_star DECIMAL(10, 8) NOT NULL COMMENT 'Relatif yakınlık skoru (0-1)',
    rank_position INT NOT NULL,
    investment_priority ENUM('high', 'medium', 'low') GENERATED ALWAYS AS (
        CASE 
            WHEN rank_position <= 10 THEN 'high'
            WHEN rank_position <= 20 THEN 'medium'
            ELSE 'low'
        END
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (run_id) REFERENCES topsis_runs(id) ON DELETE CASCADE,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    UNIQUE KEY uk_run_city (run_id, city_id),
    INDEX idx_run_rank (run_id, rank_position),
    INDEX idx_city (city_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- =====================================================
-- 11. FORECAST_MODELS - Tahmin Modelleri
-- =====================================================
CREATE TABLE IF NOT EXISTS forecast_models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    target_code VARCHAR(30) NOT NULL COMMENT 'ev_count, charging_demand, revenue',
    model_type ENUM('linear', 'exponential', 'arima', 'ets', 'prophet', 'regression') NOT NULL,
    params_json JSON,
    training_start_date DATE,
    training_end_date DATE,
    horizon_months INT DEFAULT 12,
    metrics_json JSON COMMENT 'MAPE, RMSE, MAE vb.',
    is_active BOOLEAN DEFAULT TRUE,
    trained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trained_by INT,
    FOREIGN KEY (trained_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_target (target_code),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- =====================================================
-- 12. FORECAST_RESULTS - Tahmin Sonuçları
-- =====================================================
CREATE TABLE IF NOT EXISTS forecast_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    model_id INT NOT NULL,
    city_id INT NOT NULL,
    target_code VARCHAR(30) NOT NULL,
    forecast_date DATE NOT NULL,
    yhat DECIMAL(15, 4) NOT NULL COMMENT 'Tahmin değeri',
    yhat_lower DECIMAL(15, 4) COMMENT 'Alt güven aralığı (%95)',
    yhat_upper DECIMAL(15, 4) COMMENT 'Üst güven aralığı (%95)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES forecast_models(id) ON DELETE CASCADE,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    UNIQUE KEY uk_model_city_date (model_id, city_id, forecast_date),
    INDEX idx_city_target (city_id, target_code),
    INDEX idx_forecast_date (forecast_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- =====================================================
-- 13. SCENARIO_PRESETS - Senaryo Kayıtları
-- =====================================================
CREATE TABLE IF NOT EXISTS scenario_presets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    scenario_type ENUM('aggressive', 'balanced', 'conservative', 'custom') NOT NULL,
    weights_json JSON NOT NULL COMMENT 'indicator_code: weight formatında',
    roi_params_json JSON COMMENT 'CAPEX, OPEX parametreleri',
    is_system BOOLEAN DEFAULT FALSE COMMENT 'Sistem varsayılanı mı',
    created_by INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_type (scenario_type),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- =====================================================
-- 14. ROI_CALCULATIONS - ROI Hesaplamaları
-- =====================================================
CREATE TABLE IF NOT EXISTS roi_calculations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    topsis_run_id INT NOT NULL,
    city_id INT NOT NULL,
    station_count INT NOT NULL DEFAULT 1,
    capex_per_station DECIMAL(12, 2) NOT NULL COMMENT 'TL',
    total_capex DECIMAL(15, 2) GENERATED ALWAYS AS (station_count * capex_per_station) STORED,
    monthly_opex DECIMAL(12, 2) NOT NULL COMMENT 'Bakım+elektrik+kira',
    avg_daily_usage DECIMAL(8, 2) NOT NULL COMMENT 'kWh/gün',
    price_per_kwh DECIMAL(6, 2) NOT NULL COMMENT 'TL/kWh',
    occupancy_rate DECIMAL(4, 2) DEFAULT 0.65 COMMENT '0-1 arası',
    monthly_revenue DECIMAL(12, 2) GENERATED ALWAYS AS (
        avg_daily_usage * 30 * price_per_kwh * occupancy_rate * station_count
    ) STORED,
    monthly_profit DECIMAL(12, 2) GENERATED ALWAYS AS (
        (avg_daily_usage * 30 * price_per_kwh * occupancy_rate * station_count) - monthly_opex
    ) STORED,
    payback_months DECIMAL(8, 2) GENERATED ALWAYS AS (
        CASE 
            WHEN ((avg_daily_usage * 30 * price_per_kwh * occupancy_rate * station_count) - monthly_opex) > 0 
            THEN (station_count * capex_per_station) / ((avg_daily_usage * 30 * price_per_kwh * occupancy_rate * station_count) - monthly_opex)
            ELSE 9999
        END
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topsis_run_id) REFERENCES topsis_runs(id) ON DELETE CASCADE,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    UNIQUE KEY uk_run_city (topsis_run_id, city_id),
    INDEX idx_payback (payback_months)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- =====================================================
-- 15. AUDIT_LOGS - Denetim Kaydı
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details_json JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- =====================================================
-- 16. CITY_STATS_CACHE - Şehir İstatistik Önbelleği
-- =====================================================
CREATE TABLE IF NOT EXISTS city_stats_cache (
    city_id INT PRIMARY KEY,
    total_indicators INT DEFAULT 0,
    data_completeness DECIMAL(5, 2) DEFAULT 0 COMMENT 'Veri tamlık yüzdesi',
    avg_quality_score DECIMAL(3, 2) DEFAULT 0,
    last_data_update TIMESTAMP NULL,
    last_topsis_rank INT,
    last_topsis_score DECIMAL(10, 8),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- =====================================================
-- VARSAYILAN VERİLER
-- =====================================================

-- Bölgeler
INSERT INTO regions (name, code) VALUES
('Marmara', 'MAR'),
('İç Anadolu', 'ICA'),
('Ege', 'EGE'),
('Akdeniz', 'AKD'),
('Karadeniz', 'KRD'),
('Doğu Anadolu', 'DOA'),
('Güneydoğu Anadolu', 'GDA');

-- Veri Kaynakları
INSERT INTO data_sources (code, name, organization, url, access_type, license_note, reliability_score) VALUES
('TUIK', 'Türkiye İstatistik Kurumu', 'TÜİK', 'https://data.tuik.gov.tr', 'api', 'Kamu verisi, atıf gerekli', 0.95),
('EPDK', 'Enerji Piyasası Düzenleme Kurumu', 'EPDK', 'https://www.epdk.gov.tr', 'csv', 'Resmi veri', 0.90),
('TEIAS', 'Türkiye Elektrik İletim AŞ', 'TEİAŞ', 'https://www.teias.gov.tr', 'csv', 'Resmi veri', 0.90),
('UB', 'Ulaştırma Bakanlığı', 'T.C. Ulaştırma Bakanlığı', 'https://www.uab.gov.tr', 'csv', 'Resmi veri', 0.85),
('ESARJ', 'E-Şarj İstasyonları', 'Özel Sektör', 'https://esarj.com', 'scrape', 'Kamuya açık veri', 0.75),
('KGM', 'Karayolları Genel Müdürlüğü', 'KGM', 'https://www.kgm.gov.tr', 'csv', 'Resmi veri', 0.90),
('MANUAL', 'Manuel Giriş', 'BYD Türkiye', NULL, 'manual', 'İç kaynak', 0.70);

-- Göstergeler (Kriterler)
INSERT INTO indicators (code, name, description, category, unit, polarity, default_weight) VALUES
('POP_DENSITY', 'Nüfus Yoğunluğu', 'Kilometre kare başına düşen nüfus', 'demographic', 'kişi/km²', 'benefit', 0.12),
('EV_COUNT', 'Elektrikli Araç Sayısı', 'Kayıtlı elektrikli araç adedi', 'transport', 'adet', 'benefit', 0.18),
('EV_DENSITY', 'EV Yoğunluğu', '10.000 kişi başına EV sayısı', 'transport', 'adet/10k', 'benefit', 0.15),
('ENERGY_CAPACITY', 'Enerji Altyapı Kapasitesi', 'Dağıtım şebekesi kapasitesi endeksi', 'energy', 'index', 'benefit', 0.10),
('CHARGING_STATIONS', 'Mevcut Şarj İstasyonu', 'Rakip şarj istasyonu sayısı', 'competition', 'adet', 'cost', 0.10),
('AVG_INCOME', 'Ortalama Gelir', 'Kişi başı ortalama yıllık gelir', 'economic', 'TL', 'benefit', 0.12),
('TOURISM_INDEX', 'Turizm Yoğunluğu', 'Yıllık turist ziyareti endeksi', 'economic', 'index', 'benefit', 0.08),
('HIGHWAY_ACCESS', 'Otoyol Erişimi', 'Ana otoyola uzaklık skoru (ters)', 'infrastructure', 'index', 'benefit', 0.08),
('ELECTRICITY_PRICE', 'Elektrik Birim Fiyatı', 'kWh başına ortalama fiyat', 'energy', 'TL/kWh', 'cost', 0.05),
('GRID_RELIABILITY', 'Şebeke Güvenilirliği', 'Yıllık kesinti saati (ters endeks)', 'infrastructure', 'index', 'benefit', 0.02);

-- Varsayılan Admin Kullanıcısı (şifre: Admin123!)
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@byd.com', '$2b$10$rQZ9QhWvqX5Y5Y5Y5Y5Y5OJKJKJKJKJKJKJKJKJKJKJKJKJKJKJa', 'BYD Admin', 'admin'),
('manager@byd.com', '$2b$10$rQZ9QhWvqX5Y5Y5Y5Y5Y5OJKJKJKJKJKJKJKJKJKJKJKJKJKJKJa', 'BYD Manager', 'manager');

-- Sistem Senaryo Presetleri
INSERT INTO scenario_presets (name, description, scenario_type, weights_json, roi_params_json, is_system, created_by) VALUES
('Agresif Büyüme', 'EV yoğunluğu ve nüfusa öncelik veren hızlı genişleme stratejisi', 'aggressive', 
 '{"POP_DENSITY": 0.15, "EV_COUNT": 0.25, "EV_DENSITY": 0.20, "ENERGY_CAPACITY": 0.10, "CHARGING_STATIONS": 0.08, "AVG_INCOME": 0.10, "TOURISM_INDEX": 0.05, "HIGHWAY_ACCESS": 0.05, "ELECTRICITY_PRICE": 0.01, "GRID_RELIABILITY": 0.01}',
 '{"capex_per_station": 750000, "monthly_opex": 15000, "price_per_kwh": 8.5, "occupancy_target": 0.70}', TRUE, 1),
('Dengeli Strateji', 'Tüm kriterleri eşit değerlendiren dengeli yaklaşım', 'balanced',
 '{"POP_DENSITY": 0.10, "EV_COUNT": 0.15, "EV_DENSITY": 0.15, "ENERGY_CAPACITY": 0.10, "CHARGING_STATIONS": 0.10, "AVG_INCOME": 0.12, "TOURISM_INDEX": 0.08, "HIGHWAY_ACCESS": 0.10, "ELECTRICITY_PRICE": 0.05, "GRID_RELIABILITY": 0.05}',
 '{"capex_per_station": 750000, "monthly_opex": 15000, "price_per_kwh": 8.0, "occupancy_target": 0.60}', TRUE, 1),
('Temkinli Yaklaşım', 'Gelir ve altyapı güvenliğine öncelik veren düşük riskli strateji', 'conservative',
 '{"POP_DENSITY": 0.08, "EV_COUNT": 0.12, "EV_DENSITY": 0.12, "ENERGY_CAPACITY": 0.18, "CHARGING_STATIONS": 0.12, "AVG_INCOME": 0.15, "TOURISM_INDEX": 0.05, "HIGHWAY_ACCESS": 0.08, "ELECTRICITY_PRICE": 0.05, "GRID_RELIABILITY": 0.05}',
 '{"capex_per_station": 750000, "monthly_opex": 15000, "price_per_kwh": 7.5, "occupancy_target": 0.55}', TRUE, 1);

-- 30 Büyük Şehir
INSERT INTO cities (plate_code, name, region_id, latitude, longitude, population, area_km2, is_metropolitan) VALUES
('34', 'İstanbul', 1, 41.0082, 28.9784, 15840900, 5461, TRUE),
('06', 'Ankara', 2, 39.9334, 32.8597, 5747325, 25632, TRUE),
('35', 'İzmir', 3, 38.4192, 27.1287, 4425789, 12012, TRUE),
('16', 'Bursa', 1, 40.1826, 29.0665, 3147818, 10813, TRUE),
('07', 'Antalya', 4, 36.8969, 30.7133, 2619832, 20177, TRUE),
('01', 'Adana', 4, 37.0000, 35.3213, 2274106, 13844, TRUE),
('42', 'Konya', 2, 37.8746, 32.4932, 2296347, 41001, TRUE),
('27', 'Gaziantep', 7, 37.0662, 37.3833, 2130432, 6803, TRUE),
('21', 'Diyarbakır', 7, 37.9144, 40.2306, 1804880, 15168, TRUE),
('33', 'Mersin', 4, 36.8121, 34.6415, 1891145, 15737, TRUE),
('31', 'Hatay', 4, 36.2023, 36.1603, 1686043, 5524, TRUE),
('41', 'Kocaeli', 1, 40.8533, 29.8815, 2079072, 3397, TRUE),
('38', 'Kayseri', 2, 38.7312, 35.4787, 1441523, 17109, TRUE),
('26', 'Eskişehir', 2, 39.7767, 30.5206, 906617, 13960, TRUE),
('54', 'Sakarya', 1, 40.6940, 30.4358, 1060876, 4878, TRUE),
('55', 'Samsun', 5, 41.2867, 36.3300, 1371274, 9083, TRUE),
('63', 'Şanlıurfa', 7, 37.1674, 38.7955, 2170110, 19242, TRUE),
('44', 'Malatya', 6, 38.3552, 38.3095, 812580, 12235, TRUE),
('25', 'Erzurum', 6, 39.9000, 41.2700, 749754, 25066, TRUE),
('10', 'Balıkesir', 1, 39.6484, 27.8826, 1257590, 14272, TRUE),
('52', 'Ordu', 5, 40.9862, 37.8797, 771932, 5952, FALSE),
('61', 'Trabzon', 5, 41.0027, 39.7168, 818023, 4662, TRUE),
('20', 'Denizli', 3, 37.7765, 29.0864, 1056332, 11861, TRUE),
('45', 'Manisa', 3, 38.6191, 27.4289, 1468279, 13269, TRUE),
('46', 'Kahramanmaraş', 4, 37.5858, 36.9371, 1177436, 14327, TRUE),
('65', 'Van', 6, 38.4891, 43.4089, 1141015, 19069, TRUE),
('02', 'Adıyaman', 7, 37.7648, 38.2786, 635169, 7572, FALSE),
('22', 'Edirne', 1, 41.6771, 26.5557, 413903, 6098, FALSE),
('48', 'Muğla', 3, 37.2153, 28.3636, 1021141, 12654, TRUE),
('59', 'Tekirdağ', 1, 41.2867, 27.5167, 1142451, 6191, TRUE);

-- City Stats Cache başlat
INSERT INTO city_stats_cache (city_id, total_indicators, data_completeness, avg_quality_score)
SELECT id, 0, 0, 0 FROM cities;
