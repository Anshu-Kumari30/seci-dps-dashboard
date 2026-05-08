/**
 * Cleanup script: Remove pmc-execution data that doesn't come from the form
 * 
 * Usage: node src/cleanup-pmc-execution.js
 */

const { models } = require('./models');

async function cleanupPmcExecution() {
  try {
    console.log('🔍 Scanning pmc-execution segment...\n');

    // Find all pmc-execution records
    const sliceMetaRecords = await models.PmcSliceMeta.findAll({
      where: { segment: 'pmc-execution' }
    });

    const executionMetaRecords = await models.PmcExecutionMeta?.findAll({
      where: { segment: 'pmc-execution' }
    }) || [];

    console.log(`Found ${sliceMetaRecords.length} records in pmc_slice_meta`);
    console.log(`Found ${executionMetaRecords.length} records in pmc_execution_meta\n`);

    if (sliceMetaRecords.length === 0 && executionMetaRecords.length === 0) {
      console.log('✅ No pmc-execution data found. Nothing to clean up.\n');
      process.exit(0);
    }

    // Display records
    if (sliceMetaRecords.length > 0) {
      console.log('📋 pmc_slice_meta records:');
      sliceMetaRecords.forEach((r, i) => {
        const data = r.toJSON();
        console.log(`  ${i + 1}. [${data.pmc_slice_meta_id.substring(0, 8)}...] ${data.project_name || '(unnamed)'} (${new Date(data.createdAt).toLocaleDateString()})`);
      });
      console.log('');
    }

    if (executionMetaRecords.length > 0) {
      console.log('📋 pmc_execution_meta records:');
      executionMetaRecords.forEach((r, i) => {
        const data = r.toJSON();
        console.log(`  ${i + 1}. [${data.pmc_execution_meta_id.substring(0, 8)}...] ${data.project_name || '(unnamed)'} (${new Date(data.createdAt).toLocaleDateString()})`);
      });
      console.log('');
    }

    // Confirmation
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    rl.question('⚠️  Delete all above pmc-execution records? (yes/no): ', async (answer) => {
      rl.close();
      
      if (answer.toLowerCase() !== 'yes') {
        console.log('\n❌ Cleanup cancelled.\n');
        process.exit(0);
      }

      try {
        // Delete from pmc_execution_meta
        if (executionMetaRecords.length > 0) {
          await models.PmcExecutionMeta.destroy({
            where: { segment: 'pmc-execution' }
          });
          console.log(`✅ Deleted ${executionMetaRecords.length} from pmc_execution_meta`);
        }

        // Delete from pmc_slice_meta
        if (sliceMetaRecords.length > 0) {
          await models.PmcSliceMeta.destroy({
            where: { segment: 'pmc-execution' }
          });
          console.log(`✅ Deleted ${sliceMetaRecords.length} from pmc_slice_meta`);
        }

        console.log('\n✨ Cleanup complete! pmc-execution is now clean.\n');
        process.exit(0);
      } catch (err) {
        console.error('\n❌ Error during deletion:', err.message);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

// Run cleanup
cleanupPmcExecution();
