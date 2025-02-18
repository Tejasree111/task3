/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload endpoints
 */

/**
 * @swagger
 * api/v1/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload.
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid file or missing data
 *       401:
 *         description: Unauthorized. Authentication required
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * api/v1/files:
 *   get:
 *     summary: Get the list of uploaded files
 *     tags: [Upload]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of uploaded files
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   filename:
 *                     type: string
 *                     description: The name of the uploaded file
 *                   uploadDate:
 *                     type: string
 *                     format: date-time
 *                     description: The date when the file was uploaded
 *                   fileUrl:
 *                     type: string
 *                     description: The URL to access the uploaded file
 *       401:
 *         description: Unauthorized. Authentication required
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * api/v1/download:
 *   post:
 *     summary: Download selected files as a zip
 *     tags: [Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: The IDs of the files to download
 *     responses:
 *       200:
 *         description: Files downloaded successfully
 *       400:
 *         description: Invalid file IDs or missing data
 *       401:
 *         description: Unauthorized. Authentication required
 *       500:
 *         description: Server error
 */