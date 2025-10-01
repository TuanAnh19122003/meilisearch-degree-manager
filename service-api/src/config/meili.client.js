require('dotenv').config();

const { MeiliSearch } = require('meilisearch');

const client = new MeiliSearch({
    host: process.env.MEILI_HOST,
    apiKey: process.env.MEILI_KEY,
});

const roleIndex = client.index('roles');
const userIndex = client.index('users');

module.exports = { client, roleIndex, userIndex };
