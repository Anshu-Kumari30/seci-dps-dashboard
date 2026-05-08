require('dotenv').config();

const development = {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root0930@',
    database: process.env.DB_NAME || process.env.DB_NAME_PRODUCTION || 'database_development',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '5', 10),
      min: parseInt(process.env.DB_POOL_MIN || '0', 10)
    }
  };

const test = {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root0930@',
    database: process.env.DB_NAME_TESTING || 'database_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    dialect: process.env.DB_DIALECT || 'mysql'
  };

const production = {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root0930@',
    database: process.env.DB_NAME_PRODUCTION || process.env.DB_NAME || 'database_production',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    dialect: process.env.DB_DIALECT || 'mysql'
  };

module.exports = {
  development,
  test,
  production,
  // Support uppercase NODE_ENV values (e.g. NODE_ENV=PRODUCTION)
  DEVELOPMENT: development,
  TEST: test,
  PRODUCTION: production,
};
