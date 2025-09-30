// src/core/config/sequelize-cli-config.cjs
const path = require('path');
require('dotenv').config();

// Determinar el entorno
const environment = process.env.NODE_ENV || 'development';

// Configuración base
const baseConfig = {
  dialect: 'postgres',
  autoLoadModels: true,
  synchronize: false,
  dialectOptions: {
    decimalNumbers: true,
  },
};

// Configuración específica por entorno
const configs = {
  development: {
    ...baseConfig,
    host: 'localhost',
    port: 5432,
    username: 'raffle_user',
    password: 'password',
    database: 'raffle_db',
    synchronize: true,
  },
  production: {
    ...baseConfig,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialectOptions: {
      ...baseConfig.dialectOptions,
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false,
      } : false,
    },
  },
};

// Exportar la configuración para el entorno actual
module.exports = configs[environment];