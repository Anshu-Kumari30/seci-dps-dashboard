const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

(async () => {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = process.env.DB_PORT || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASS || '';
  const database = process.env.DB_NAME_PRODUCTION || process.env.DB_NAME_TESTING || process.env.DB_NAME;

  let conn;
  try {
    conn = await mysql.createConnection({ host, port, user, password, database });
    console.log('Connected to DB', database);

    // pick an existing entity
    const [entities] = await conn.execute('SELECT dept_id, statistic_id, entity_id FROM dept_entity LIMIT 1');
    if (!entities || entities.length === 0) {
      console.error('No entities found in dept_entity table. Cannot create test entries.');
      process.exit(1);
    }
    const { dept_id, statistic_id, entity_id } = entities[0];
    console.log('Using entity:', dept_id, statistic_id, entity_id);

    // insert entity_docs test row
    const docId = uuidv4();
    const now = new Date();
    const insertDocSQL = `INSERT INTO entity_docs (doc_id, dept_id, statistic_id, entity_id, doc_name, doc_type, doc_path, doc_date, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`;
    await conn.execute(insertDocSQL, [docId, dept_id, statistic_id, entity_id, 'TEST CONTRACT DOC', 'cdoc', '/uploads/test.pdf', now, now, now]);
    console.log('Inserted test entity_docs id=', docId);

    // insert pmc_ce_entry test row
    const pmcId = uuidv4();
    const insertPmcSQL = `INSERT INTO pmc_ce_entry (pmc_ce_entry_id, dept_id, statistic_id, entity_id, sno, milestone, stage_payment, invoice_amount, invoice_raised, invoice_date, invoice_number, status, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    await conn.execute(insertPmcSQL, [pmcId, dept_id, statistic_id, entity_id, 1, 'TEST MILESTONE', 1000.00, 1000.00, 500.00, now, 'INV-TEST', 'Pending', now, now]);
    console.log('Inserted test pmc_ce_entry id=', pmcId);

    await conn.end();
    console.log('Done. Reload PMC C&E UI for the entity to see test rows.');
    process.exit(0);
  } catch (err) {
    console.error('Error inserting test entries:', err);
    if (conn) await conn.end();
    process.exit(1);
  }
})();
