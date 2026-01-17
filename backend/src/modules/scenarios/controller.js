/**
 * BYD KDS - Scenarios Controller
 * Senaryo preset yönetimi
 */
const { query } = require('../../config/database');
const logger = require('../../config/logger');

// Tüm presetleri getir
const getPresets = async (req, res) => {
    try {
        const { active = 'true' } = req.query;

        let sql = `
            SELECT 
                sp.id, sp.name, sp.description, sp.scenario_type,
                sp.weights_json, sp.roi_params_json, sp.is_system,
                sp.is_active, sp.created_at,
                u.full_name as created_by_name
            FROM scenario_presets sp
            LEFT JOIN users u ON sp.created_by = u.id
        `;

        if (active === 'true') {
            sql += ' WHERE sp.is_active = TRUE';
        }

        sql += ' ORDER BY sp.is_system DESC, sp.created_at DESC';

        const presets = await query(sql);

        // JSON alanlarını parse et
        presets.forEach(p => {
            p.weights = JSON.parse(p.weights_json || '{}');
            p.roiParams = JSON.parse(p.roi_params_json || '{}');
            delete p.weights_json;
            delete p.roi_params_json;
        });

        res.json({
            success: true,
            data: presets
        });

    } catch (error) {
        logger.error('Get presets error:', error);
        res.status(500).json({
            success: false,
            error: 'Presetler alınamadı',
            code: 'GET_PRESETS_ERROR'
        });
    }
};

// Preset detayı
const getPreset = async (req, res) => {
    try {
        const { id } = req.params;

        const presets = await query(`
            SELECT * FROM scenario_presets WHERE id = ?
        `, [id]);

        if (presets.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Preset bulunamadı',
                code: 'PRESET_NOT_FOUND'
            });
        }

        const preset = presets[0];
        preset.weights = JSON.parse(preset.weights_json || '{}');
        preset.roiParams = JSON.parse(preset.roi_params_json || '{}');

        res.json({
            success: true,
            data: preset
        });

    } catch (error) {
        logger.error('Get preset error:', error);
        res.status(500).json({
            success: false,
            error: 'Preset alınamadı',
            code: 'GET_PRESET_ERROR'
        });
    }
};

// Yeni preset oluştur
const createPreset = async (req, res) => {
    try {
        const { name, description, scenarioType = 'custom', weights, roiParams } = req.body;

        if (!name || !weights) {
            return res.status(400).json({
                success: false,
                error: 'Preset adı ve ağırlıklar gerekli',
                code: 'MISSING_FIELDS'
            });
        }

        // Ağırlık toplamını kontrol et
        const weightSum = Object.values(weights).reduce((a, b) => a + b, 0);
        if (Math.abs(weightSum - 1) > 0.01) {
            return res.status(400).json({
                success: false,
                error: 'Ağırlıkların toplamı 1 olmalı',
                code: 'INVALID_WEIGHTS'
            });
        }

        const result = await query(`
            INSERT INTO scenario_presets 
            (name, description, scenario_type, weights_json, roi_params_json, created_by)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            name,
            description || null,
            scenarioType,
            JSON.stringify(weights),
            JSON.stringify(roiParams || {}),
            req.user.id
        ]);

        // Audit log
        await query(`
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details_json)
            VALUES (?, 'SCENARIO_CREATED', 'scenario_presets', ?, ?)
        `, [req.user.id, result.insertId, JSON.stringify({ name, scenarioType })]);

        logger.info(`Scenario preset created: ${name} by ${req.user.email}`);

        res.status(201).json({
            success: true,
            data: {
                id: result.insertId,
                name,
                scenarioType
            }
        });

    } catch (error) {
        logger.error('Create preset error:', error);
        res.status(500).json({
            success: false,
            error: 'Preset oluşturulamadı',
            code: 'CREATE_PRESET_ERROR'
        });
    }
};

// Preset güncelle
const updatePreset = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, weights, roiParams, isActive } = req.body;

        // Sistem presetini kontrol et
        const existing = await query('SELECT is_system FROM scenario_presets WHERE id = ?', [id]);

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Preset bulunamadı',
                code: 'PRESET_NOT_FOUND'
            });
        }

        if (existing[0].is_system && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Sistem presetleri sadece admin güncelleyebilir',
                code: 'FORBIDDEN'
            });
        }

        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (weights !== undefined) {
            updates.push('weights_json = ?');
            params.push(JSON.stringify(weights));
        }
        if (roiParams !== undefined) {
            updates.push('roi_params_json = ?');
            params.push(JSON.stringify(roiParams));
        }
        if (isActive !== undefined) {
            updates.push('is_active = ?');
            params.push(isActive);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Güncellenecek alan yok',
                code: 'NO_UPDATES'
            });
        }

        params.push(id);
        await query(`UPDATE scenario_presets SET ${updates.join(', ')} WHERE id = ?`, params);

        logger.info(`Scenario preset updated: ${id} by ${req.user.email}`);

        res.json({
            success: true,
            message: 'Preset güncellendi'
        });

    } catch (error) {
        logger.error('Update preset error:', error);
        res.status(500).json({
            success: false,
            error: 'Preset güncellenemedi',
            code: 'UPDATE_PRESET_ERROR'
        });
    }
};

// Preset sil
const deletePreset = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await query('SELECT is_system, name FROM scenario_presets WHERE id = ?', [id]);

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Preset bulunamadı',
                code: 'PRESET_NOT_FOUND'
            });
        }

        if (existing[0].is_system) {
            return res.status(403).json({
                success: false,
                error: 'Sistem presetleri silinemez',
                code: 'FORBIDDEN'
            });
        }

        await query('DELETE FROM scenario_presets WHERE id = ?', [id]);

        logger.info(`Scenario preset deleted: ${existing[0].name} by ${req.user.email}`);

        res.json({
            success: true,
            message: 'Preset silindi'
        });

    } catch (error) {
        logger.error('Delete preset error:', error);
        res.status(500).json({
            success: false,
            error: 'Preset silinemedi',
            code: 'DELETE_PRESET_ERROR'
        });
    }
};

module.exports = {
    getPresets,
    getPreset,
    createPreset,
    updatePreset,
    deletePreset
};
