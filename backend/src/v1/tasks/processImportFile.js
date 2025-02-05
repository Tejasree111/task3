const XLSX = require('xlsx');
const fetch = require('node-fetch');
const knexConfig = require('../../mysql/knexfile');
const knex = require('knex')(knexConfig.development);
const { validateProductData, generateErrorSheet } = require('./validation');
const { createProduct, uploadToS3 } = require('./../import/import.controller');
 


exports.processImportFile = async (file, knex,io,userSockets) => {
  try {
    console.log('User Sockets:', userSockets);
    //console.log('Processing file:', file);
    
    // Fetch file content from S3 (use the S3 URL saved in the database)
    const fileBuffer = await fetch(file.file_path).then(res => res.buffer());
    console.log('File Buffer:', fileBuffer.length);
    
    // Read the Excel file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Validate data
    const { validRecords, invalidRecords } = await validateProductData(data, knex);

    // Process valid records and create products
    for (const validRecord of validRecords) {
      await createProduct(validRecord);
      console.log('Processed valid record:', validRecord);
    }

    let status = 'processed';
    let errorFilePath = null;

    // If there are invalid records, generate error sheet and upload to S3
    if (invalidRecords.length > 0) {
      console.log('Invalid Records:', invalidRecords);
      const errorSheet = await generateErrorSheet(invalidRecords);
      errorFilePath = await uploadToS3(errorSheet, `error_${file.file_name}`);
      
      // Update the file status in the database to "failed"
      await knex('imported_files')
        .where('import_id', file.import_id)
        .update({ status: 'failed', error_file_path: errorFilePath });
      console.log('Error File Path:', errorFilePath);

      // Optionally log the imported files
      const importedFiles = await knex('imported_files').select('*');
      //console.log('Imported Files:', importedFiles);
    } else {
      // Update file status to "processed"
      await knex('imported_files')
        .where('import_id', file.import_id)
        .update({ status: 'processed' });
    }

    // Notify user via WebSocket
    const userRecord = await knex('imported_files')
      .select('user_id')
      .where('import_id', file.import_id)
      .first();

    if (userRecord && userRecord.user_id) {
      const userSocketId = userSockets[userRecord.user_id];
      console.log("user Socket id :",userSocketId)
      if (userSocketId) {
        io.to(userSocketId).emit('fileStatusUpdate', {
          fileName: file.file_name,
          status: status,
          errorFilePath: errorFilePath
        });
        console.log(`Notified user ${userRecord.user_id} via WebSocket`);
      }
    }
    
  } catch (error) {
    console.error('Error processing file:', error);
    
    // Update file status as "failed" in case of an error
    await knex('imported_files')
      .where('import_id', file.import_id)
      .update({ status: 'failed' })
      .catch(dbError => {
        console.error('Error updating database:', dbError);
      });

    // Notify user about failure via WebSocket
    const userRecord = await knex('imported_files')
      .select('user_id')
      .where('import_id', file.import_id)
      .first();

    if (userRecord && userRecord.user_id) {
      const userSocketId = userSockets[userRecord.user_id];
      console.log('User Socket ID:', userSocketId);
      if (userSocketId) {
        io.to(userSocketId).emit('fileStatusUpdate', {
          fileName: file.file_name,
          status: 'failed',
          error: 'File processing failed'
        });
        console.log(`Notified user ${userRecord.user_id} about failure`);
      }
    }
  }
};
