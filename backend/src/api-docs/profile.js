/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management endpoints
 */

/**
 * @swagger
 * api/v1/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: johndoe123
 *                 email:
 *                   type: string
 *                   example: johndoe@example.com
 *                 first_name:
 *                   type: string
 *                   example: John
 *                 last_name:
 *                   type: string
 *                   example: Doe
 */

/**
 * @swagger
 * api/v1/profile/picture:
 *   put:
 *     summary: Update user profile picture
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_pic:
 *                 type: string
 *                 example: "https://example.com/profile.jpg"
 *               thumbnail:
 *                 type: string
 *                 example: "https://example.com/thumbnail.jpg"
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */