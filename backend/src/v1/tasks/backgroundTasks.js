const cron = require('node-cron');
const knexConfig = require('../../mysql/knexfile'); // Import knex configuration
const knex = require('knex')(knexConfig.development);
const { processImportFile } = require('./processImportFile');
module.exports=(io,userSockets)=>{



// This task runs every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  try {
    console.log('Running background tasks inside cron job');
    const filesToProcess = await knex('imported_files').where('status', 'pending');
    for (const file of filesToProcess) {
      await processImportFile(file,knex,io,userSockets);
    }
  } catch (error) {
    console.error('Error in cron job', error);
  }
});
}
console.log('Background tasks running');
