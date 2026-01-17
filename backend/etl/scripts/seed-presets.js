/**
 * BYD KDS - Seed Scenario Presets
 * Creates default scenario presets if they don't exist
 */
const { query } = require('../../src/config/database');

const defaultPresets = [
    {
        name: 'Dengeli Strateji',
        description: 'Tüm kriterleri dengeli şekilde değerlendiren varsayılan strateji',
        scenario_type: 'balanced',
        is_system: true,
        weights: {
            POP_DENSITY: 0.10, EV_COUNT: 0.15, EV_DENSITY: 0.15, ENERGY_CAPACITY: 0.10,
            CHARGING_STATIONS: 0.10, AVG_INCOME: 0.12, TOURISM_INDEX: 0.08,
            HIGHWAY_ACCESS: 0.10, ELECTRICITY_PRICE: 0.05, GRID_RELIABILITY: 0.05
        }
    },
    {
        name: 'Agresif Büyüme',
        description: 'EV sayısı ve nüfus yoğunluğuna öncelik veren hızlı büyüme stratejisi',
        scenario_type: 'aggressive',
        is_system: true,
        weights: {
            POP_DENSITY: 0.15, EV_COUNT: 0.20, EV_DENSITY: 0.20, ENERGY_CAPACITY: 0.08,
            CHARGING_STATIONS: 0.05, AVG_INCOME: 0.15, TOURISM_INDEX: 0.10,
            HIGHWAY_ACCESS: 0.05, ELECTRICITY_PRICE: 0.01, GRID_RELIABILITY: 0.01
        }
    },
    {
        name: 'Temkinli Yaklaşım',
        description: 'Altyapı ve güvenilirliğe öncelik veren düşük riskli strateji',
        scenario_type: 'conservative',
        is_system: true,
        weights: {
            POP_DENSITY: 0.08, EV_COUNT: 0.10, EV_DENSITY: 0.10, ENERGY_CAPACITY: 0.12,
            CHARGING_STATIONS: 0.15, AVG_INCOME: 0.10, TOURISM_INDEX: 0.05,
            HIGHWAY_ACCESS: 0.10, ELECTRICITY_PRICE: 0.10, GRID_RELIABILITY: 0.10
        }
    }
];

async function seedPresets() {
    console.log('🌱 Senaryo presetleri oluşturuluyor...');

    try {
        // Check if table exists and has data
        const existing = await query('SELECT COUNT(*) as count FROM scenario_presets');

        if (existing[0].count > 0) {
            console.log('✅ Presetler zaten mevcut:', existing[0].count);
            return;
        }

        // Insert default presets
        for (const preset of defaultPresets) {
            await query(`
                INSERT INTO scenario_presets 
                (name, description, scenario_type, weights_json, is_system, is_active)
                VALUES (?, ?, ?, ?, ?, TRUE)
            `, [
                preset.name,
                preset.description,
                preset.scenario_type,
                JSON.stringify(preset.weights),
                preset.is_system
            ]);
            console.log(`  ✓ ${preset.name} oluşturuldu`);
        }

        console.log('✅ Tüm presetler başarıyla oluşturuldu!');

    } catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.log('⚠️ scenario_presets tablosu bulunamadı! Tablo oluşturuluyor...');

            // Create table
            await query(`
                CREATE TABLE IF NOT EXISTS scenario_presets (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    scenario_type ENUM('balanced', 'aggressive', 'conservative', 'custom') DEFAULT 'custom',
                    weights_json JSON,
                    roi_params_json JSON,
                    is_system BOOLEAN DEFAULT FALSE,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_by INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
                )
            `);
            console.log('✅ Tablo oluşturuldu');

            // Retry seed
            await seedPresets();
        } else {
            console.error('❌ Seed hatası:', error);
            throw error;
        }
    }
}

// Run if called directly
if (require.main === module) {
    seedPresets()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = { seedPresets };
