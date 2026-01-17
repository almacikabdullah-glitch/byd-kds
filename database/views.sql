-- =====================================================
-- BYD KDS - VIEW Tanımları
-- =====================================================

USE byd_kds;

-- =====================================================
-- VIEW 1: Şehir Bazlı En Güncel Gösterge Değerleri
-- Her şehir için her göstergenin en son değerini getirir
-- =====================================================
CREATE OR REPLACE VIEW v_city_latest_indicators AS
SELECT 
    c.id AS city_id,
    c.name AS city_name,
    c.plate_code,
    ind.id AS indicator_id,
    ind.code AS indicator_code,
    ind.name AS indicator_name,
    ind.category,
    ind.polarity,
    ind.unit,
    iv.value,
    iv.quality_score,
    iv.period_date,
    ds.name AS source_name,
    ds.reliability_score AS source_reliability
FROM cities c
CROSS JOIN indicators ind
LEFT JOIN (
    SELECT iv1.*
    FROM indicator_values iv1
    INNER JOIN (
        SELECT city_id, indicator_id, MAX(period_date) as max_date
        FROM indicator_values
        GROUP BY city_id, indicator_id
    ) iv2 ON iv1.city_id = iv2.city_id 
         AND iv1.indicator_id = iv2.indicator_id 
         AND iv1.period_date = iv2.max_date
) iv ON c.id = iv.city_id AND ind.id = iv.indicator_id
LEFT JOIN data_sources ds ON iv.source_id = ds.id
WHERE ind.is_active = TRUE
ORDER BY c.plate_code, ind.code;

-- =====================================================
-- VIEW 2: Şehir Özet İstatistikleri
-- Her şehir için genel istatistik özeti
-- =====================================================
CREATE OR REPLACE VIEW v_city_summary AS
SELECT 
    c.id AS city_id,
    c.name AS city_name,
    c.plate_code,
    r.name AS region_name,
    c.population,
    c.area_km2,
    c.population_density,
    c.is_metropolitan,
    csc.total_indicators,
    csc.data_completeness,
    csc.avg_quality_score,
    csc.last_topsis_rank,
    csc.last_topsis_score,
    (SELECT COUNT(*) FROM districts d WHERE d.city_id = c.id) AS district_count
FROM cities c
JOIN regions r ON c.region_id = r.id
LEFT JOIN city_stats_cache csc ON c.id = csc.city_id;

-- =====================================================
-- VIEW 3: TOPSIS Sonuç Özeti
-- En son TOPSIS çalıştırmasının sonuçları
-- =====================================================
CREATE OR REPLACE VIEW v_latest_topsis_results AS
SELECT 
    tr.run_id,
    tr.city_id,
    c.name AS city_name,
    c.plate_code,
    r.name AS region_name,
    tr.c_star AS score,
    tr.rank_position,
    tr.investment_priority,
    tr.s_plus,
    tr.s_minus,
    trun.scenario_type,
    trun.created_at AS run_date
FROM topsis_results tr
JOIN cities c ON tr.city_id = c.id
JOIN regions r ON c.region_id = r.id
JOIN topsis_runs trun ON tr.run_id = trun.id
WHERE trun.id = (
    SELECT id FROM topsis_runs 
    WHERE status = 'completed' 
    ORDER BY created_at DESC 
    LIMIT 1
)
ORDER BY tr.rank_position;

-- =====================================================
-- VIEW 4: Kriter Ağırlık Dağılımı
-- Her senaryo için kriter ağırlıklarını görüntüle
-- =====================================================
CREATE OR REPLACE VIEW v_scenario_weights AS
SELECT 
    sp.id AS scenario_id,
    sp.name AS scenario_name,
    sp.scenario_type,
    ind.code AS indicator_code,
    ind.name AS indicator_name,
    ind.polarity,
    JSON_UNQUOTE(JSON_EXTRACT(sp.weights_json, CONCAT('$.', ind.code))) AS weight
FROM scenario_presets sp
CROSS JOIN indicators ind
WHERE sp.is_active = TRUE AND ind.is_active = TRUE
ORDER BY sp.scenario_type, ind.code;

-- =====================================================
-- VIEW 5: Tahmin Özeti
-- Şehir bazlı gelecek 12 ay tahminleri
-- =====================================================
CREATE OR REPLACE VIEW v_forecast_summary AS
SELECT 
    c.id AS city_id,
    c.name AS city_name,
    c.plate_code,
    fr.target_code,
    fm.model_type,
    MIN(fr.forecast_date) AS forecast_start,
    MAX(fr.forecast_date) AS forecast_end,
    COUNT(*) AS forecast_periods,
    AVG(fr.yhat) AS avg_forecast,
    MIN(fr.yhat) AS min_forecast,
    MAX(fr.yhat) AS max_forecast
FROM forecast_results fr
JOIN cities c ON fr.city_id = c.id
JOIN forecast_models fm ON fr.model_id = fm.id
WHERE fm.is_active = TRUE
GROUP BY c.id, c.name, c.plate_code, fr.target_code, fm.model_type;

-- =====================================================
-- VIEW 6: ROI Özeti
-- Şehir bazlı yatırım geri dönüş analizi
-- =====================================================
CREATE OR REPLACE VIEW v_roi_summary AS
SELECT 
    c.id AS city_id,
    c.name AS city_name,
    c.plate_code,
    rc.station_count,
    rc.total_capex,
    rc.monthly_opex,
    rc.monthly_revenue,
    rc.monthly_profit,
    rc.payback_months,
    CASE 
        WHEN rc.payback_months <= 24 THEN 'excellent'
        WHEN rc.payback_months <= 36 THEN 'good'
        WHEN rc.payback_months <= 48 THEN 'moderate'
        ELSE 'long_term'
    END AS payback_rating,
    tr.run_name AS topsis_scenario
FROM roi_calculations rc
JOIN cities c ON rc.city_id = c.id
JOIN topsis_runs tr ON rc.topsis_run_id = tr.id
ORDER BY rc.payback_months;
