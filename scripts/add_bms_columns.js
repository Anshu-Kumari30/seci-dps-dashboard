(async ()=>{
  try{
    const db = require('../models');
    await db.sequelize.authenticate();
    console.log('Connected to DB');
    await db.sequelize.query('ALTER TABLE `contract_documents` ADD COLUMN `doc_date` DATE NULL;');
    await db.sequelize.query("ALTER TABLE `correspondences_other` ADD COLUMN `correspondence_date` DATE NULL, ADD COLUMN `sender` VARCHAR(255) NULL, ADD COLUMN `recipient` VARCHAR(255) NULL;");
    console.log('ALTER TABLE applied');
    process.exit(0);
  }catch(e){
    console.error('ERR',e);
    process.exit(2);
  }
})();
