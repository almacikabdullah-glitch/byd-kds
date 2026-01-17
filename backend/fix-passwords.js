/**
 * Fix user passwords in database
 */
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixPasswords() {
    console.log('🔧 Şifreleri düzeltiyorum...');

    const password = 'Admin123!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    console.log('Yeni hash:', hash);

    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 8889,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'byd_kds',
    });

    try {
        await pool.execute(`UPDATE users SET password_hash = ? WHERE email = 'admin@byd.com'`, [hash]);
        await pool.execute(`UPDATE users SET password_hash = ? WHERE email = 'manager@byd.com'`, [hash]);
        console.log('✅ Şifreler güncellendi!');
        console.log('📧 Email: admin@byd.com');
        console.log('🔑 Şifre: Admin123!');
    } catch (err) {
        console.error('❌ Hata:', err.message);
    }

    await pool.end();
    process.exit(0);
}

fixPasswords();
