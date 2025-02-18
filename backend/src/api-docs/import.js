/**
 * @swagger
 * tags:
 *   name: Import
 *   description: Data import endpoints
 */

/**
 * @swagger
 * api/v1/import:
 *   post:
 *     summary: Import data (Handles file uploads)
 *     tags: [Import]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: A list of files to upload.
 *                 maxItems: 10
 *     responses:
 *       200:
 *         description: Files uploaded successfully and data imported.
 *       400:
 *         description: Invalid files or missing data.
 *       401:
 *         description: Unauthorized. Authentication required.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * api/v1/uploads:
 *   get:
 *     summary: Get user-uploaded files
 *     tags: [Import]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of user-uploaded files.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   filename:
 *                     type: string
 *                     description: The name of the uploaded file.
 *                   uploadDate:
 *                     type: string
 *                     format: date-time
 *                     description: The date when the file was uploaded.
 *                   fileUrl:
 *                     type: string
 *                     description: The URL to access the uploaded file.
 *       401:
 *         description: Unauthorized. Authentication required.
 *       500:
 *         description: Server error.
 */