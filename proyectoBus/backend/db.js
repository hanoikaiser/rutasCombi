const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "rutasdb",
  password: "2521",
  port: 5432
});

module.exports = pool;
