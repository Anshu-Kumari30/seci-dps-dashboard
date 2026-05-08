(async () => {
  try {
    require('dotenv').config();
    const { sequelize } = require('./models');

    console.log('Running migration: Add date and land fields to PMC metadata tables...');

    const tables = [
      { name: 'pmc_slice_meta', columns: ['loa_date', 'scod', 'land'] },
      { name: 'pmc_dpr_meta', columns: ['loa_date', 'scod'] },
      { name: 'pmc_bms_meta', columns: ['loa_date', 'scod'] },
      { name: 'pmc_execution_meta', columns: ['loa_date', 'scod', 'land'] }
    ];

    for (const table of tables) {
      for (const col of table.columns) {
        try {
          const colType = col === 'land' ? 'INT' : 'DATE';
          await sequelize.query(
            `ALTER TABLE ${table.name} ADD COLUMN \`${col}\` ${colType} NULL`
          );
          console.log(`✓ Added ${col} to ${table.name}`);
        } catch (err) {
          if (err.message && err.message.includes('Duplicate column')) {
            console.log(`✓ ${col} already exists in ${table.name}`);
          } else {
            throw err;
          }
        }
      }
    }

    await sequelize.close();
    console.log('Migration completed successfully');
    process.exit(0);
  } catch(e) {
    console.error('Migration failed:', e.message);
    process.exit(1);
  }
})();
