const db = require('../mysql/connection');
 
module.exports = {
  async createUser(userData) {
    return db('users').insert(userData);
  },
  async findByEmail(email) {
    return db('users').where({ email }).first();
  },
  async findByUsername(username) {
    return db('users').where({ username }).first();
  },
};