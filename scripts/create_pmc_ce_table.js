const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = process.env.DB_PORT || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASS || '';
  const database = process.env.DB_NAME_PRODUCTION || process.env.DB_NAME_TESTING || process.env.DB_NAME;

  if (!database) {
    console.error('No database name found in env (DB_NAME_PRODUCTION or DB_NAME_TESTING)');
    process.exit(1);
  }

  const createSQL = `
    CREATE TABLE IF NOT EXISTS pmc_ce_entry (
      pmc_ce_entry_id VARCHAR(36) NOT NULL PRIMARY KEY,
      dept_id VARCHAR(36) NOT NULL,
      statistic_id VARCHAR(36) NOT NULL,
      entity_id VARCHAR(36) NOT NULL,
      sno INT NULL,
      milestone VARCHAR(1024) NULL,
      stage_payment DECIMAL(10,2) NULL,
      invoice_amount DECIMAL(15,2) NULL,
      invoice_raised DECIMAL(15,2) NULL,
      invoice_date DATETIME NULL,
      invoice_number VARCHAR(255) NULL,
      status VARCHAR(100) NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  let conn;
  try {
    conn = await mysql.createConnection({ host, port, user, password, database });
    console.log('Connected to MySQL at', host + ':' + port, 'DB:', database);
    const [result] = await conn.execute(createSQL);
    console.log('pmc_ce_entry table created or already exists. Result:', result);
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Failed to create table:', err);
    if (conn) await conn.end();
    process.exit(1);
  }
})();
