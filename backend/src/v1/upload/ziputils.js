// backend/src/v1/upload/zipUtils.js

const JSZip = require('jszip');

// Utility to create a zip file from an array of file data
const zipFiles = async (files) => {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.name, file.data);
  }

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  return zipBuffer;
};

module.exports = { zipFiles };
