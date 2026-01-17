/**
 * BYD KDS - Sample Indicator Data Seed Script
 * Gerçek kaynaklar erişilemediğinde örnek veri oluşturur
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 8889,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'byd_kds',
    charset: 'utf8mb4'
});

// Gerçekçi veri aralıkları (TÜİK ve resmi kaynaklardan derlenen yaklaşık değerler)
const cityProfiles = {
    '34': { evCount: 45000, income: 95000, energy: 0.95, charging: 850, tourism: 0.90 }, // İstanbul
    '06': { evCount: 22000, income: 85000, energy: 0.92, charging: 420, tourism: 0.75 }, // Ankara
    '35': { evCount: 18000, income: 78000, energy: 0.88, charging: 310, tourism: 0.85 }, // İzmir
    '16': { evCount: 12000, income: 72000, energy: 0.85, charging: 180, tourism: 0.60 }, // Bursa
    '07': { evCount: 9500, income: 68000, energy: 0.82, charging: 220, tourism: 0.95 },  // Antalya
    '01': { evCount: 5500, income: 52000, energy: 0.78, charging: 95, tourism: 0.40 },   // Adana
    '42': { evCount: 5200, income: 58000, energy: 0.80, charging: 85, tourism: 0.55 },   // Konya
    '27': { evCount: 4800, income: 48000, energy: 0.75, charging: 75, tourism: 0.35 },   // Gaziantep
    '21': { evCount: 2200, income: 38000, energy: 0.65, charging: 35, tourism: 0.30 },   // Diyarbakır
    '33': { evCount: 4500, income: 55000, energy: 0.77, charging: 90, tourism: 0.65 },   // Mersin
    '31': { evCount: 2800, income: 42000, energy: 0.68, charging: 45, tourism: 0.55 },   // Hatay
    '41': { evCount: 8500, income: 75000, energy: 0.90, charging: 145, tourism: 0.35 },  // Kocaeli
    '38': { evCount: 4200, income: 62000, energy: 0.78, charging: 70, tourism: 0.45 },   // Kayseri
    '26': { evCount: 3800, income: 68000, energy: 0.82, charging: 65, tourism: 0.50 },   // Eskişehir
    '54': { evCount: 3200, income: 65000, energy: 0.80, charging: 55, tourism: 0.30 },   // Sakarya
    '55': { evCount: 3500, income: 58000, energy: 0.75, charging: 60, tourism: 0.50 },   // Samsun
    '63': { evCount: 1800, income: 35000, energy: 0.62, charging: 25, tourism: 0.40 },   // Şanlıurfa
    '44': { evCount: 2000, income: 45000, energy: 0.70, charging: 30, tourism: 0.35 },   // Malatya
    '25': { evCount: 1500, income: 42000, energy: 0.68, charging: 22, tourism: 0.40 },   // Erzurum
    '10': { evCount: 3000, income: 55000, energy: 0.72, charging: 50, tourism: 0.60 },   // Balıkesir
    '52': { evCount: 1800, income: 48000, energy: 0.68, charging: 28, tourism: 0.35 },   // Ordu
    '61': { evCount: 2500, income: 52000, energy: 0.72, charging: 40, tourism: 0.55 },   // Trabzon
    '20': { evCount: 3200, income: 60000, energy: 0.75, charging: 55, tourism: 0.50 },   // Denizli
    '45': { evCount: 3500, income: 58000, energy: 0.74, charging: 58, tourism: 0.40 },   // Manisa
    '46': { evCount: 2000, income: 42000, energy: 0.68, charging: 32, tourism: 0.30 },   // Kahramanmaraş
    '65': { evCount: 1200, income: 35000, energy: 0.60, charging: 18, tourism: 0.45 },   // Van
    '02': { evCount: 1000, income: 38000, energy: 0.62, charging: 15, tourism: 0.35 },   // Adıyaman
    '22': { evCount: 1500, income: 52000, energy: 0.70, charging: 25, tourism: 0.55 },   // Edirne
    '48': { evCount: 4500, income: 65000, energy: 0.78, charging: 120, tourism: 0.92 },  // Muğla
    '59': { evCount: 4200, income: 68000, energy: 0.82, charging: 75, tourism: 0.40 }    // Tekirdağ
};

async function seedIndicatorData() {
    const conn = await pool.getConnection();

    try {
        console.log('🌱 Gösterge verileri yükleniyor...');

        // Şehirleri al
        const [cities] = await conn.execute('SELECT id, plate_code, population, area_km2 FROM cities');

        // Göstergeleri al
        const [indicators] = await conn.execute('SELECT id, code FROM indicators WHERE is_active = TRUE');
        const indicatorMap = {};
        indicators.forEach(ind => { indicatorMap[ind.code] = ind.id; });

        // Veri kaynağını al
        const [sources] = await conn.execute("SELECT id FROM data_sources WHERE code = 'MANUAL'");
        const sourceId = sources[0]?.id || 1;

        const currentDate = new Date().toISOString().split('T')[0];
        let insertCount = 0;

        for (const city of cities) {
            const profile = cityProfiles[city.plate_code] || {
                evCount: 1000,
                income: 45000,
                energy: 0.65,
                charging: 20,
                tourism: 0.30
            };

            // Nüfus yoğunluğu
            const popDensity = city.population / city.area_km2;
            await insertValue(conn, city.id, indicatorMap['POP_DENSITY'], popDensity, sourceId, currentDate);

            // EV sayısı
            await insertValue(conn, city.id, indicatorMap['EV_COUNT'], profile.evCount, sourceId, currentDate);

            // EV yoğunluğu (10.000 kişi başına)
            const evDensity = (profile.evCount / city.population) * 10000;
            await insertValue(conn, city.id, indicatorMap['EV_DENSITY'], evDensity, sourceId, currentDate);

            // Enerji altyapı kapasitesi
            await insertValue(conn, city.id, indicatorMap['ENERGY_CAPACITY'], profile.energy, sourceId, currentDate);

            // Mevcut şarj istasyonu
            await insertValue(conn, city.id, indicatorMap['CHARGING_STATIONS'], profile.charging, sourceId, currentDate);

            // Ortalama gelir
            await insertValue(conn, city.id, indicatorMap['AVG_INCOME'], profile.income, sourceId, currentDate);

            // Turizm endeksi
            await insertValue(conn, city.id, indicatorMap['TOURISM_INDEX'], profile.tourism, sourceId, currentDate);

            // Otoyol erişimi (rastgele 0.5-1.0 arası)
            const highway = 0.5 + Math.random() * 0.5;
            await insertValue(conn, city.id, indicatorMap['HIGHWAY_ACCESS'], highway, sourceId, currentDate);

            // Elektrik fiyatı (TL/kWh)
            const elecPrice = 2.5 + Math.random() * 1.5;
            await insertValue(conn, city.id, indicatorMap['ELECTRICITY_PRICE'], elecPrice, sourceId, currentDate);

            // Şebeke güvenilirliği
            const gridRel = 0.7 + Math.random() * 0.25;
            await insertValue(conn, city.id, indicatorMap['GRID_RELIABILITY'], gridRel, sourceId, currentDate);

            insertCount += 10;
        }

        console.log(`✅ ${insertCount} gösterge değeri yüklendi`);

        // City stats cache'i güncelle
        await conn.execute(`
            UPDATE city_stats_cache csc
            SET 
                total_indicators = (SELECT COUNT(DISTINCT indicator_id) FROM indicator_values WHERE city_id = csc.city_id),
                data_completeness = (SELECT COUNT(DISTINCT indicator_id) FROM indicator_values WHERE city_id = csc.city_id) / 
                    (SELECT COUNT(*) FROM indicators WHERE is_active = TRUE) * 100,
                avg_quality_score = (SELECT AVG(quality_score) FROM indicator_values WHERE city_id = csc.city_id),
                last_data_update = NOW()
        `);

        console.log('✅ Şehir istatistikleri güncellendi');

    } catch (error) {
        console.error('❌ Hata:', error.message);
        throw error;
    } finally {
        conn.release();
        await pool.end();
    }
}

async function insertValue(conn, cityId, indicatorId, value, sourceId, date) {
    if (!indicatorId) return;

    await conn.execute(`
        INSERT INTO indicator_values (city_id, indicator_id, period_date, value, source_id, quality_score)
        VALUES (?, ?, ?, ?, ?, 0.85)
        ON DUPLICATE KEY UPDATE value = VALUES(value), quality_score = VALUES(quality_score)
    `, [cityId, indicatorId, date, value, sourceId]);
}

// Çalıştır
seedIndicatorData()
    .then(() => {
        console.log('🎉 Veri yükleme tamamlandı!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Veri yükleme başarısız:', err);
        process.exit(1);
    });
