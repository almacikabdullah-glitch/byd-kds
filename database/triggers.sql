-- =====================================================
-- BYD KDS - TRIGGER Tanımları
-- =====================================================

USE byd_kds;

DELIMITER //

-- =====================================================
-- TRIGGER 1: Gösterge Değeri Eklendiğinde Şehir Stats Güncelle
-- indicator_values tablosuna yeni kayıt eklendiğinde
-- city_stats_cache tablosunu günceller
-- =====================================================
CREATE TRIGGER trg_indicator_value_insert
AFTER INSERT ON indicator_values
FOR EACH ROW
BEGIN
    DECLARE total_ind INT;
    DECLARE active_ind INT;
    DECLARE avg_quality DECIMAL(3,2);
    
    -- Aktif gösterge sayısını al
    SELECT COUNT(*) INTO active_ind FROM indicators WHERE is_active = TRUE;
    
    -- Bu şehir için mevcut gösterge sayısını ve ortalama kaliteyi hesapla
    SELECT 
        COUNT(DISTINCT indicator_id),
        COALESCE(AVG(quality_score), 0)
    INTO total_ind, avg_quality
    FROM indicator_values
    WHERE city_id = NEW.city_id;
    
    -- Cache tablosunu güncelle
    INSERT INTO city_stats_cache (city_id, total_indicators, data_completeness, avg_quality_score, last_data_update)
    VALUES (
        NEW.city_id, 
        total_ind, 
        (total_ind / active_ind) * 100,
        avg_quality,
        CURRENT_TIMESTAMP
    )
    ON DUPLICATE KEY UPDATE
        total_indicators = total_ind,
        data_completeness = (total_ind / active_ind) * 100,
        avg_quality_score = avg_quality,
        last_data_update = CURRENT_TIMESTAMP;
END//

-- =====================================================
-- TRIGGER 2: Gösterge Değeri Güncellendiğinde Stats Güncelle
-- =====================================================
CREATE TRIGGER trg_indicator_value_update
AFTER UPDATE ON indicator_values
FOR EACH ROW
BEGIN
    DECLARE avg_quality DECIMAL(3,2);
    
    -- Ortalama kalite skorunu yeniden hesapla
    SELECT COALESCE(AVG(quality_score), 0)
    INTO avg_quality
    FROM indicator_values
    WHERE city_id = NEW.city_id;
    
    -- Cache güncelle
    UPDATE city_stats_cache
    SET 
        avg_quality_score = avg_quality,
        last_data_update = CURRENT_TIMESTAMP
    WHERE city_id = NEW.city_id;
END//

-- =====================================================
-- TRIGGER 3: TOPSIS Sonuçları Yazıldığında Cache Güncelle
-- topsis_results tablosuna kayıt eklendiğinde
-- city_stats_cache'deki son TOPSIS bilgilerini günceller
-- =====================================================
CREATE TRIGGER trg_topsis_result_insert
AFTER INSERT ON topsis_results
FOR EACH ROW
BEGIN
    UPDATE city_stats_cache
    SET 
        last_topsis_rank = NEW.rank_position,
        last_topsis_score = NEW.c_star,
        updated_at = CURRENT_TIMESTAMP
    WHERE city_id = NEW.city_id;
END//

-- =====================================================
-- TRIGGER 4: Kullanıcı Girişinde Last Login Güncelle
-- (Manuel çağrı veya uygulama tarafından tetiklenir)
-- =====================================================
CREATE TRIGGER trg_user_login_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    IF NEW.last_login IS NOT NULL AND NEW.last_login <> OLD.last_login THEN
        SET NEW.updated_at = CURRENT_TIMESTAMP;
    END IF;
END//

-- =====================================================
-- TRIGGER 5: Audit Log - TOPSIS Çalıştırma Kaydı
-- Her TOPSIS run oluşturulduğunda audit log'a yazar
-- =====================================================
CREATE TRIGGER trg_audit_topsis_run
AFTER INSERT ON topsis_runs
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details_json, created_at)
    VALUES (
        NEW.created_by,
        'TOPSIS_RUN_CREATED',
        'topsis_runs',
        NEW.id,
        JSON_OBJECT(
            'run_name', NEW.run_name,
            'scenario_type', NEW.scenario_type,
            'date_range_start', NEW.date_range_start,
            'date_range_end', NEW.date_range_end
        ),
        CURRENT_TIMESTAMP
    );
END//

-- =====================================================
-- TRIGGER 6: Audit Log - Senaryo Preset Değişikliği
-- =====================================================
CREATE TRIGGER trg_audit_scenario_change
AFTER UPDATE ON scenario_presets
FOR EACH ROW
BEGIN
    IF OLD.weights_json <> NEW.weights_json OR OLD.name <> NEW.name THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details_json, created_at)
        VALUES (
            NEW.created_by,
            'SCENARIO_UPDATED',
            'scenario_presets',
            NEW.id,
            JSON_OBJECT(
                'old_name', OLD.name,
                'new_name', NEW.name,
                'weights_changed', IF(OLD.weights_json <> NEW.weights_json, 'yes', 'no')
            ),
            CURRENT_TIMESTAMP
        );
    END IF;
END//

-- =====================================================
-- TRIGGER 7: TOPSIS Run Tamamlandığında İstatistik Güncelle
-- =====================================================
CREATE TRIGGER trg_topsis_run_complete
AFTER UPDATE ON topsis_runs
FOR EACH ROW
BEGIN
    IF OLD.status <> 'completed' AND NEW.status = 'completed' THEN
        -- Audit log
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details_json, created_at)
        VALUES (
            NEW.created_by,
            'TOPSIS_RUN_COMPLETED',
            'topsis_runs',
            NEW.id,
            JSON_OBJECT(
                'execution_time_ms', NEW.execution_time_ms,
                'total_alternatives', NEW.total_alternatives,
                'total_criteria', NEW.total_criteria
            ),
            CURRENT_TIMESTAMP
        );
    END IF;
END//

DELIMITER ;
