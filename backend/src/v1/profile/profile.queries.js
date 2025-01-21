const knex = require('../../mysql/connection');

const updateUserProfilePicture = async (userId, profilePicUrl, thumbnailUrl) => {
    try {
        console.log("users table: ",profilePicUrl);
        const id= knex("users")
            .where("user_id", userId )
            .update({
                profile_pic: profilePicUrl,
                thumbnail: thumbnailUrl,
            });
            //console.log(id);
            return id;
    } catch (err) {
        console.error('Error updating user profile picture:', err);
        throw err;
    }
};

module.exports = { updateUserProfilePicture };