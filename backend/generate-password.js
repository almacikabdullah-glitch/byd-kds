/**
 * Generate bcrypt hash for default admin password
 * Run: node generate-password.js
 */
const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = 'Admin123!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\nSQL Update:');
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@byd.com';`);
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'manager@byd.com';`);
}

generateHash();
