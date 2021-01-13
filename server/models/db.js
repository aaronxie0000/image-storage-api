const Pool = require('pg').Pool;
require('dotenv').config();


const pool = new Pool({
    user: process.env.PGSQL_USER,
    password: process.env.PGSQL_PASS,
    database: process.env.PGSQL_DATABASE,
    host:process.env.PGSQL_HOST,
    port: process.env.PGSQL_PORT
});

module.exports = pool;
