const mysql = require('mysql2/promise');
const config = require('../config/config.js').production;

(async () => {
  const conn = await mysql.createConnection({
    host: config.host,
    user: config.username,
    password: config.password,
    port: config.port,
    database: config.database
  });

  try {
    await conn.execute(`CREATE TABLE IF NOT EXISTS SequelizeMeta (name VARCHAR(255) NOT NULL PRIMARY KEY)`);
    const migrations = [
      '20260316-add-number-of-projects-to-pmc-slice-meta.js'
    ];
    for (const m of migrations) {
      const [rows] = await conn.execute('SELECT name FROM SequelizeMeta WHERE name = ?', [m]);
      if (rows.length === 0) {
        await conn.execute('INSERT INTO SequelizeMeta (name) VALUES (?)', [m]);
        console.log('Inserted migration:', m);
      } else {
        console.log('Migration already present:', m);
      }
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await conn.end();
  }
})();
