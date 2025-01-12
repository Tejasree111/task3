const Knex = require('knex');
const { Model } = require('objection');
const knexConfig = require('../knexfile');

// Initialize Knex
const knex = Knex(knexConfig.development);

// Bind all Models to the Knex instance
Model.knex(knex);

module.exports = knex;