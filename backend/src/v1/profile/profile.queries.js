const db = require('../../mysql/connection');

const updateUserProfilePicture = async (userId, profilePicUrl, thumbnailUrl) => {
    try {
        await db('users')
            .where({ user_id: userId })
            .update({
                profile_pic: profilePicUrl,
                thumbnail: thumbnailUrl,
            });
    } catch (err) {
        console.error('Error updating user profile picture:', err);
        throw err;
    }
};

module.exports = { updateUserProfilePicture };